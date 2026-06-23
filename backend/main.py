from fastapi import FastAPI
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends

# DB 설정
DATABASE_URL = "sqlite:///./todos.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# DB 모델 (테이블 구조 정의)
class Todo(Base):
    __tablename__ = "todos"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, index=True)
    isDone = Column(Boolean, default=False)
    date = Column(String, index=True)
        
# Pydantic 스키마 (요청/응답 데이터 구조 정의)
class TodoCreate(BaseModel):
    # 생성 시 필요한 필드를 직접 추가해보세요
    text: str
    date: str

class TodoUpdate(BaseModel):
    # 업데이트 시 필요한 필드를 직접 추가해보세요
    text: str | None = None
    date: str | None = None
    isDone: bool | None = None


    

# 테이블 생성
Base.metadata.create_all(bind=engine)

# FastAPI 앱 생성
app = FastAPI(title="Todo API")

# FastAPI 앱 미들웨어 및 CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB 세션 의존성
def get_db():
    # 필요한 부분을 직접 작성해보세요.
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
    

# 엔드포인트 구현
# API 목록에 해당되는 부분을 직접 구현해보세요.

@app.post("/todos/")
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    db_todo = Todo(text=todo.text, date=todo.date)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

@app.get("/todos/")
def read_todos(db: Session = Depends(get_db)):
    return db.query(Todo).all()

@app.put("/todos/{todo_id}")
def update_todo(todo_id: int, todo: TodoUpdate, db: Session = Depends(get_db)):
    db_todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if db_todo is None:
        return {"error": "Todo not found"}
    if todo.text is not None:
        db_todo.text = todo.text
    if todo.date is not None:
        db_todo.date = todo.date
    if todo.isDone is not None:
        db_todo.isDone = todo.isDone
    db.commit()
    db.refresh(db_todo)
    return db_todo

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    db_todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if db_todo is None:
        return {"error": "Todo not found"}
    db.delete(db_todo)
    db.commit()
    return {"message": "Todo deleted successfully"}