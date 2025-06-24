# uvicorn main:app --reload
# pnpm dev

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from quiz_creator import generate_questions
from firebase_config import database
import json


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