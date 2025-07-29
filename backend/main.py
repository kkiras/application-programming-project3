from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from agents_serve.quiz_creator import generate_questions
from agents_serve.quesion_checker import check_duplicates
from fastapi import Request
from datetime import datetime
from fastapi.responses import StreamingResponse
import json
import random
from typing import Optional, List
from pymongo import MongoClient
from bson.binary import Binary
import os
from dotenv import load_dotenv
import bcrypt
from jsonpath_ng import parse
from io import BytesIO
import uvicorn

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("MONGO_DB_NAME")]
questions_collection = db["Questions"]
accounts_collection = db["Accounts"]

app = FastAPI()
port = int(os.getenv("PORT", 8000))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionUpdate(BaseModel):
    question: str
    answers: List[str]
    correctAnswer: str
    id: str
    owner: str

class DeleteRequest(BaseModel):
    uid: Optional[str]
    question_ids: List[str]

class UpdateRequest(BaseModel):
    uid: str
    question: QuestionUpdate

@app.get("/api/")
def root():
    return {"message": f"Respone from server {port}"}
    
@app.get("/api/generate-questions")
async def get_questions(count: int, uid: str):
    print(f"Request {count} questions")
    try:
        existing_questions = getQuestionList(True, uid)
        questions = await generate_questions(count, existing_questions)
        return questions
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/signup")
async def signup(req: Request):
    try:
        body = await req.json()
        email = body.get("email")
        password = body.get("password")

        if not email or not password:
            raise HTTPException(status_code=400, detail="Missing required fields: email or password")

        if accounts_collection.find_one({"email": email}):
            raise HTTPException(status_code=409, detail="Email already registered")

        count = accounts_collection.count_documents({})
        uid = f"user{str(count + 1).zfill(3)}"

        while accounts_collection.find_one({"_id": uid}):
            count += 1
            uid = f"user{str(count + 1).zfill(3)}"

        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        new_user = {
            "_id": uid,
            "username": "", 
            "email": email,
            "password": hashed_password,
            "personal_inf": {
                "avatar": "",
                "displayName": "User"
            },
            "settings": {
                "backgroundMusic": True,
                "soundEffects": True,
                "questionTimer": True,
                "questionCount": 5
            }
        }

        accounts_collection.insert_one(new_user)

        return {
            "message": "Account created successfully",
            "uid": uid,
            "email": email
        }

    except HTTPException:
        raise 
    except Exception as e:
        print("Signup error:", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")
    

def serialize_user(user: dict):
    user["_id"] = str(user["_id"])

    if "personal_inf" in user:
        jsonpath_expr = parse("$.[*].personal_inf.avatar")
        jsonpath_expr.filter(lambda d: True, user)

        user["personal_inf"]["avatar_url"] = f"/api/avatar/{user['_id']}"

    return user

@app.post("/api/login")
async def login(req: Request):
    body = await req.json()
    email = body.get("email")
    password = body.get("password")

    user = accounts_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    stored_hash = user.get("password").encode("utf-8")
    if not bcrypt.checkpw(password.encode("utf-8"), stored_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    user = serialize_user(user)
    print("Account data: ", user)

    return {"message": "Login successful", "account_data": user}

@app.post("/api/save-settings")
async def save_settings(
    uid: str = Form(...),
    file: Optional[UploadFile] = File(None),
    general_settings: Optional[str] = Form(None)
):
    try:
        update_data = {}

        if file:
            if not file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                raise HTTPException(status_code=400, detail="Only image files allowed.")

            content = await file.read()

            avatar_binary = Binary(content)

            update_data["personal_inf"] = {
                "avatar": avatar_binary,
                "userName": ""
            }

        if general_settings:
            parsed = json.loads(general_settings)
            update_data["settings"] = parsed

        result = accounts_collection.update_one(
            {"_id": uid},
            {"$set": update_data},
            upsert=True
        )

        update_data["personal_inf"] = {
                "avatar_url": f"/api/avatar/{uid}",
                "userName": ""
        }

        return {
            "success": True,
            "updated": update_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/avatar/{user_id}")
def get_avatar(user_id: str):
    user = accounts_collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    avatar_data = user.get("personal_inf", {}).get("avatar")
    if not avatar_data:
        raise HTTPException(status_code=404, detail="Avatar not found")

    return StreamingResponse(BytesIO(avatar_data), media_type="image/png")

@app.post("/api/add-question")
async def addQuestion(req:Request):
    body = await req.json()
    uid = body.get("uid")
    questions = body.get("questions") or body.get("question")

    if not uid or not questions:
        raise HTTPException(status_code=400, detail="Missing 'uid' or 'question(s)'")

    if isinstance(questions, str):
        try:
            questions = json.loads(questions)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON format")

    if isinstance(questions, dict):
        questions = [questions]

    if not isinstance(questions, list):
        raise HTTPException(status_code=400, detail="'questions' must be a list or object")

    for q in questions:
        if not isinstance(q, dict) or not all(k in q for k in ("question", "answers", "correctAnswer")):
            raise HTTPException(status_code=400, detail="Invalid question format")

    existing = getQuestionList(True, uid)
    is_duplicated = await questionDuplicateCheck(existing, questions)

    if is_duplicated:
        raise HTTPException(status_code=400, detail="Duplicated question(s) detected")

    try:
        inserted = []
        timestamp = int(datetime.now().timestamp())

        if isinstance(questions, list):
            print("Questions:", questions)
            for idx, q in enumerate(questions):
                q_id = f"{timestamp}" if len(questions) == 1 else f"{timestamp}_{idx+1}"
                q["id"] = q_id
                q["owner"] = uid
                questions_collection.insert_one(q)
                q.pop("_id", None)
                inserted.append(q)
            
        else:
            raise ValueError("Dữ liệu 'questions' phải là object hoặc list")
        return {
            "message": " question(s) added successfully.",
            
        }

    except Exception as e:
        print("✖ Insert error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

    
@app.get("/api/get-questions")
def getQuestions(count: int, uid: Optional[str] = None):
    try:
        query = {"$or": [{"owner": "default"}]}
        if uid:
            query["$or"].append({"owner": uid})

        questions = list(questions_collection.find(query))
        for q in questions:
            q["id"] = q.get("id", str(q["_id"]))
            q.pop("_id", None)

        random.shuffle(questions)
        return {"questions": questions[:count]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
def serialize_question(q):
     return {
        "id": q.get("id", str(q.get("_id"))),
        "question": q.get("question", ""),
        "answers": q.get("answers", []),
        "correctAnswer": q.get("correctAnswer", ""),
        "owner": q.get("owner", "")
    }

@app.get("/api/get-questions-list")
def getQuestionList(isQuestionOnly: Optional[bool] = None, uid: Optional[str] = None):
    try:
        default_cursor = questions_collection.find({"owner": "default"})
        default_list = list(default_cursor)

        if isQuestionOnly:
            default_questions = [serialize_question(q) for q in default_list]

            user_questions = []
            if uid:
                user_cursor = questions_collection.find({"owner": uid})
                user_questions = [q.get("question", "") for q in user_cursor]

            return {
                "question_data": default_questions + user_questions
            }

        default_questions = [
            serialize_question(q) for q in default_list
        ]

        user_questions = []
        if uid:
            user_cursor = questions_collection.find({"owner": uid})
            user_questions = [serialize_question(q) for q in user_cursor]

        return {
            "default_questions": default_questions,
            "user_questions": user_questions
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.delete('/api/delete-question')
def deleteQuestion(data: DeleteRequest):
    try:
        uid = data.uid
        question_ids = data.question_ids

        if not question_ids:
            raise HTTPException(status_code=400, detail="Danh sách câu hỏi rỗng.")

        result = questions_collection.delete_many({
            "id": { "$in": question_ids },
            "owner": uid
        })

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi để xóa.")

        return { "message": f"Đã xóa {result.deleted_count} câu hỏi." }

    except Exception as e:
        print("✖ Delete error:", e)
        raise HTTPException(status_code=500, detail="Xóa nhiều câu hỏi thất bại.")

async def questionDuplicateCheck(exist_questions: List[str], adding_questions: List[str]):
    new_question_texts = [q["question"] for q in adding_questions]
    print("Data: ", exist_questions)
    print("New: ", new_question_texts)
    is_duplicate = await check_duplicates(existing_questions=exist_questions, new_questions=new_question_texts)
    print(is_duplicate)
    return is_duplicate

@app.put('/api/update-question')
def updateQuestion(data: UpdateRequest):
    try:
        uid = data.uid
        question = data.question

        print("UID:", uid)
        print("ID:", question.id)

        if not question or not question.id:
            raise HTTPException(status_code=400, detail="Không tìm thấy câu hỏi cần cập nhật.")

        result = questions_collection.update_one(
            {"id": question.id, "owner": uid},
            {"$set": question.dict(exclude={"id"})}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi tương ứng.")

        return {"message": f"Đã cập nhật câu hỏi {question.id} thành công."}

    except Exception as e:
        print("✖ Update error:", e)
        raise HTTPException(status_code=500, detail="Cập nhật câu hỏi thất bại.")


