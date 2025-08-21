from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from redis import Redis
import json
from typing import List
from . import models, schemas
from .database import SessionLocal, engine
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv('FRONT_URL')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database
models.Base.metadata.create_all(bind=engine)

# Redis
redis = Redis(host=os.getenv('REDIS_URL'), port=os.getenv('REDIS_PORT'), db=os.getenv('REDIS_DB'))


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/todos/", response_model=schemas.Todo)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    db_todo = models.Todo(title=todo.title, description=todo.description)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    redis.delete("todos")  # Очистка кэша
    return db_todo


@app.get("/todos/", response_model=List[schemas.Todo])
def read_todos(db: Session = Depends(get_db)):
    # Проверка кэша Redis
    cached_todos = redis.get("todos")
    if cached_todos:
        return json.loads(cached_todos)

    todos = db.query(models.Todo).all()
    # Сериализация с использованием Pydantic
    todos_dict = [schemas.Todo.from_orm(todo).dict() for todo in todos]
    # Кэширование в Redis
    redis.setex("todos", 3600, json.dumps(todos_dict))
    return todos_dict


@app.put("/todos/{todo_id}", response_model=schemas.Todo)
def update_todo(todo_id: int, todo: schemas.TodoUpdate, db: Session = Depends(get_db)):
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    db_todo.title = todo.title
    db_todo.description = todo.description
    db_todo.completed = todo.completed
    db.commit()
    db.refresh(db_todo)
    redis.delete("todos")  # Очистка кэша
    return db_todo


@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(db_todo)
    db.commit()
    redis.delete("todos")  # Очистка кэша
    return {"message": "Todo deleted"}