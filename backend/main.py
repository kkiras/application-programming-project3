# uvicorn main:app --reload
# pnpm dev

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from agents_serve.quiz_creator import generate_questions
from agents_serve.quesion_checker import check_duplicates
from firebase_config import database
from firebase_admin import auth as firebase_auth
from firebase_admin import storage
from fastapi import Request
from fastapi.responses import RedirectResponse
from datetime import timedelta, datetime
import time
import json
import random
from typing import Optional, List, Dict

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Item(BaseModel):
    text: str # Required field
    is_done: bool = False # Default value is False

items = []

class QuestionUpdate(BaseModel):
    question: str
    answers: List[str]
    correctAnswer: str
    id: str

class DeleteRequest(BaseModel):
    uid: Optional[str]
    question_ids: List[str]

class UpdateRequest(BaseModel):
    uid: str
    question: QuestionUpdate

@app.get("/")
def root():
    return {"message": "Hello, World!"}

@app.post("/items")
def create_item(item: Item):
    items.append(item)
    return items

@app.get("/items")
def list_items(limit: int = 10):
    return items[0:limit]

@app.get("/items/{item_id}")
def get_item(item_id: int) -> Item:
    
    if item_id < len(items):
        return items[item_id]
    else:
        raise HTTPException(status_code=404, detail="Item not found")
    
@app.get("/generate-questions")
async def get_questions(count: int, uid: str):
    print(f"Request {count} questions")
    try:
        existing_questions = getQuestionList(True, uid)
        questions = await generate_questions(count, existing_questions)
        return {"questions": questions}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/signup")
async def signup(req: Request):
    body = await req.json()
    username = body.get("username")
    id_token = body.get("idToken")
    print("ID-Token", id_token)
    # email = body.get("email")
    # uid = body.get("uid")
    
    try:
        decoded = firebase_auth.verify_id_token(id_token)
        uid = decoded.get("uid")
        email = decoded.get("email")   

        print("UID", uid)
        print("email", email)

        account_ref = database.child("Accounts").child(uid)
        if account_ref.get() is not None:
            return {"message": "User already exists"}
        
        account_ref.set({
            "uid": uid,
            "username": username,
            "email": email,
            "personal_inf":{
                "avatar": '',
                "displayName": 'User',
            },
            "settings":{
                "backgroundMusic": True,
                "soundEffects": True,
                "questionTimer": True,
                "questionCount": 5,
            }
        })

        return {"message": "Account created", "uid": uid, "email": email}
    
    except Exception as e:
        print(e)
        raise HTTPException(status_code=401, detail="Invalid token or account creation failed")

@app.post("/api/auth")
async def verify_token(req: Request):
    body = await req.json()
    id_token = body.get("token")

    try:
        t0 = time.time()
        decoded = firebase_auth.verify_id_token(id_token)
        print("✔ Token decoded in", time.time() - t0)

        uid = decoded.get("uid")
        email = decoded.get("email")

        t1 = time.time()
        account_ref = database.child("Accounts").child(uid)
        account_data = account_ref.get()
        print("✔ Firebase get() took", time.time() - t1)

        return {"account_data": account_data}

    except Exception as e:
        print("✖ Auth error:", e)
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/api/save-settings")
async def save_settings(
    uid: str = Form(...),
    file: Optional[UploadFile] = File(None),
    general_settings: Optional[str] = Form(None)
):
    try:
        update_data = {}

        if file:
            if not file.filename.endswith(('.jpg', '.jpeg', '.png')):
                raise HTTPException(status_code=400, detail="Only image files allowed.")
            bucket = storage.bucket()
            timestamp = int(datetime.now().timestamp())
            path = f"avatars/{uid}/{timestamp}.jpg"
            blob = bucket.blob(path)
            blob.upload_from_string(await file.read(), content_type=file.content_type)
            avatar_url = blob.generate_signed_url(expiration=timedelta(minutes=10))
            update_data["personal_inf"] = {"avatar": f"{uid}/{timestamp}.jpg"}
            ref = database.child("Accounts").child(uid).child("personal_inf")
            current_personal_inf = ref.get() or {}

            current_personal_inf["avatar"] = f"{uid}/{timestamp}.jpg"

            database.child("Accounts").child(uid).child("personal_inf").update(current_personal_inf)

        if general_settings:
            parsed = json.loads(general_settings)
            update_data["settings"] = parsed
            ref = database.child("Accounts").child(uid)
            ref.update(update_data)

        return {
            "success": True,
            "updated": update_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/add-question")
async def addQuestion(req:Request):
    body = await req.json()
    question = body.get("question")
    uid = body.get("uid")

    existing_questions = getQuestionList(True, uid)
    is_duplicated = await check_duplicates(question, existing_questions)

    if is_duplicated:
        raise HTTPException(status_code=400, detail="Duplicated question(s) detected")

    try:
        timestamp = int(datetime.now().timestamp())
        question_key = str(timestamp)

        print("QuestionID:", question_key)

        question["id"]=question_key
        print("Question:", question)
        database.child("Questions").child(uid).child(question_key).set(question)

        return {
            "message": "Question added successfully",
            "id": question_key
        }
    except Exception as e:
       print(str(e))
       raise HTTPException(status_code=500, detail="Internal server error")
    
@app.get("/get-questions/{count}")
def getQuestions(count: int, uid: Optional[str] = None):
    try:
        questions_snapshot = database.child("Questions").child("default_questions").get()
        
        if not questions_snapshot:
            questions_snapshot = []
        
        default_questions = [
            {**val, "id": key}
            for key, val in questions_snapshot.items()
        ]

        byUser_questions = []
        if uid:
            questions_snapshot = database.child("Questions").child(uid).get()
            if questions_snapshot:
                byUser_questions = [
                    {**val, "id": key}
                    for key, val in questions_snapshot.items()
                ]

        questions = default_questions + byUser_questions

        random.shuffle(questions)
        return{ "questions": questions[:count] }
    
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/avatars/{filePath:path}")
def get_user_avatar(filePath: str):
    try:
        path= f"avatars/{filePath}"
        bucket= storage.bucket()
        blob= bucket.blob(path)

        if not blob.exists():
            raise HTTPException(status_code=404, detail="Avatar file not found")

        signed_url = blob.generate_signed_url(expiration=timedelta(minutes=10))
        return RedirectResponse(signed_url)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/get-questions-list")
def getQuestionList(isQuestionOnly: Optional[bool] = None, uid: Optional[str] = None):
    try:
        default_snapshot = database.child("Questions").child("default_questions").get()
        default_snapshot = default_snapshot if default_snapshot else {}

        if isQuestionOnly:
            default_questions = [
                val.get("question", "")
                for val in default_snapshot.values()
                if isinstance(val, dict)
            ]

            user_questions = []
            if uid:
                user_snapshot = database.child("Questions").child(uid).get()
                if user_snapshot:
                    user_questions = [
                        val.get("question", "")
                        for val in user_snapshot.values()
                        if isinstance(val, dict)
                    ]

            return {
                "question_data": default_questions + user_questions
            }

        default_questions = [
            {**val, "id": key}
            for key, val in default_snapshot.items()
        ]

        user_questions = []
        if uid:
            user_snapshot = database.child("Questions").child(uid).get()
            if user_snapshot:
                user_questions = [
                    {**val, "id": key}
                    for key, val in user_snapshot.items()
                ]

        return {
            "default_questions": default_questions,
            "user_questions": user_questions
        }
    
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=str(e))
    
@app.delete('/api/delete-question')
def deleteQuestion(data: DeleteRequest):
    try:
        uid = data.uid
        question_ids = data.question_ids
        
        if not question_ids:
            raise HTTPException(status_code=400, detail="Danh sách câu hỏi rỗng.")
        
        updates = { f"{qid}": None for qid in question_ids }

        ref = database.child('Questions').child(uid)
        ref.update(updates)

        return { "message": f"Đã xóa {len(question_ids)} câu hỏi." }
    
    except Exception as e:
        print("✖ Delete error:", e)
        raise HTTPException(status_code=500, detail="Xóa nhiều câu hỏi thất bại.")
    
@app.post("/api/add-ai-question")
async def addAIQuestion(req: Request):
    body = await req.json()
    questions = body.get("questions")
    uid = body.get("uid")

    # ⚠️ Kiểm tra thiếu uid hoặc questions phải làm ngay từ đầu
    if not questions or not uid:
        raise HTTPException(status_code=400, detail="Missing 'uid' or 'questions'")

    # Parse danh sách câu hỏi nếu là JSON string
    try:
        if isinstance(questions, str):
            questions_list = json.loads(questions)
        else:
            questions_list = questions
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format in 'questions'")

    # Kiểm tra định dạng danh sách câu hỏi
    if not isinstance(questions_list, list):
        raise HTTPException(status_code=400, detail="'questions' must be a list")

    for q in questions_list:
        if not isinstance(q, dict) or not all(k in q for k in ("question", "answers", "correctAnswer")):
            raise HTTPException(status_code=400, detail="Invalid question format")

    # Lấy danh sách các câu hỏi hiện tại (chỉ lấy field "question")
    questions_data = getQuestionList(True, uid)

    # Kiểm tra trùng lặp
    is_duplicated = await questionDuplicateCheck(questions_data, questions_list)

    if is_duplicated:
        raise HTTPException(status_code=400, detail="Duplicated question(s) detected")

    # Ghi vào database
    try:
        inserted_questions = []
        timestamp = int(datetime.now().timestamp())

        for idx, q in enumerate(questions_list):
            question_key = f"{timestamp}_{idx}"
            q["id"] = question_key
            database.child("Questions").child(uid).child(question_key).set(q)
            inserted_questions.append(q)

        return {
            "message": "Questions added successfully",
            "questions": inserted_questions
        }

    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail="Internal server error")

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

        print("ID:", question.id)
        
        if not question:
            raise HTTPException(status_code=400, detail="Không tìm thấy câu hỏi cần cập nhật.")
        
        ref = database.child("Questions").child(uid).child(question.id)
        ref.update(question.dict())

        return {"message": f"Đã cập nhật câu hỏi {question.id} thành công."}
    except Exception as e:
        print("✖ Delete error:", e)
        raise HTTPException(status_code=500, detail="Cập nhật câu hỏi thất bại.")


