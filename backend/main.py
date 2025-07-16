# uvicorn main:app --reload
# pnpm dev

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from quiz_creator import generate_questions
from firebase_config import database
from firebase_admin import auth as firebase_auth
from firebase_admin import storage
from fastapi import Request
from fastapi.responses import RedirectResponse
from datetime import timedelta, datetime
import time
import json
import random
from typing import Optional, List

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

class DeleteRequest(BaseModel):
    uid: Optional[str]
    question_ids: List[str]

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
async def get_questions():
    questions = await generate_questions()
    return questions

@app.get("/questions")
def get_questions_from_db():
    questions_ref = database.child("Questions")
    questions = questions_ref.get()
    
    if questions:
        return [value for key, value in questions.items()]
    else:
        return []
    

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
    print("Question before:", question)
    print("UID: ", uid)

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
def getQuestionList(uid: Optional[str] = None):
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

        return{ "default_questions": default_questions, 'user_questions': byUser_questions }
    
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

