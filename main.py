from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.responses import HTMLResponse
from starlette.templating import Jinja2Templates
from config import BASE_DIR, settings
from fastapi.staticfiles import StaticFiles
from database import get_db
from models import Todo
from sqlalchemy.orm import Session
from schemas import TodoCreate

#Pythonの関数・メソッドはsnake_case
#Pythonの変数はsnake_case

#静的ファイルのディレクトリ
static_dir = BASE_DIR / "static"
app=FastAPI()

templates=Jinja2Templates(directory=static_dir)
#cssとjsファイルはこれで渡す
app.mount("/static",StaticFiles(directory=static_dir), name="static")

print("STATIC DIR =", static_dir)

@app.get("/",response_class=HTMLResponse)#HTMLと言うルール(設計図)を渡している。
def top_page(request:Request)->HTMLResponse:#->HTMLResponseは単純にhtmlを返しますよと言っている
    return templates.TemplateResponse("main.html",{"request":request})


@app.get("/api/todos")
def get_todos(status: str | None = None,db:Session=Depends(get_db)):#dbという名前のセッション作成
    query=db.query(Todo);#Todoクラスにマッピング
    
    if status=="completed":
        query=query.filter(Todo.completed==True)
        
    elif status=="active":
        query=query.filter(Todo.completed==False)
        
        
    todos=query.all()
    #左側の変数名はjsonの項目名
    return[{
        "id":todo.id,
        "title":todo.title,
        "completed":todo.completed,    
        "priority":todo.priority,    
        "category":todo.category,    
        "due_date":todo.due_date
    }
    for todo in todos]

#jsで値を受け取る、それをTodoCreateというデータ設計図で、todo_newという名前で扱う。
@app.post("/api/todos")
def add_todo(todo_new:TodoCreate,db:Session=Depends(get_db)):
    todo = Todo(
    title=todo_new.title,
    priority=todo_new.priority,
    category=todo_new.category,
    due_date=todo_new.due_date
    )
    db.add(todo)
    db.commit()
    return todo
    
@app.delete("/api/todos/{todo_id}")
def delete_todo(todo_id:int,db:Session=Depends(get_db)):
    todo=db.get(Todo,todo_id)
    db.delete(todo)
    db.commit()
    
    
@app.patch("/api/todos/{todo_id}")
def patch_todo(todo_id:int,db:Session=Depends(get_db),todo_update:TodoCreate| None = None):
    todo=db.get(Todo,todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    if todo_update is None:
        todo.completed=True
        db.commit()
    else:
        todo.title=todo_update.title
        todo.priority=todo_update.priority
        todo.category=todo_update.category
        todo.due_date=todo_update.due_date
        db.commit()
        
        
    
    
   
    
    
    