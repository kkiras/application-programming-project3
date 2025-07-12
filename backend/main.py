# uvicorn main:app --reload
# pnpm dev

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from quiz_creator import generate_questions
from firebase_config import database
from firebase_admin import auth as firebase_auth
from fastapi import Request
import time
import random


import os
print("FIREBASE_AUTH_EMULATOR_HOST:", os.environ.get("FIREBASE_AUTH_EMULATOR_HOST"))

USE_FIREBASE_EMULATOR = "FIREBASE_AUTH_EMULATOR_HOST" in os.environ
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

@app.put("/api/save-setting-changes")
async def saveSettingChanges(req:Request):
    body = await req.json()
    changedSettings = body.get("changes")
    uid = body.get("uid")
    print("Changes:", changedSettings)
    print("UID:", uid)


    try:
        ref = database.child("Accounts").child(uid).child("settings")
        ref.update(changedSettings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/add-question")
async def addQuestion(req:Request):
    body = await req.json()
    question = body.get("question")
    print("Question before:", question)

    try:
        push_ref = database.child("Questions").push({})
        question_id = push_ref.key

        print("QuestionID:", question_id)

        question["id"]=question_id
        print("Question:", question)
        database.child("Questions").child(question_id).set(question)

        return {
            "message": "Question added successfully",
            "id": question_id
        }
    except Exception as e:
       print(str(e))
       raise HTTPException(status_code=500, detail="Internal server error")
    
@app.get("/get-questions/{count}")
def getQuestions(count: int):
    try:
        questions_snapshot = database.child("Questions").get()
        
        if not questions_snapshot:
            return { "questions": [] }
        
        questions = [
            {**val, "id": key}
            for key, val in questions_snapshot.items()
        ]
        random.shuffle(questions)
        return{ "questions": questions[:count] }
    
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=str(e))

