# 01 Import・初期設定
from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.responses import HTMLResponse
from starlette.templating import Jinja2Templates
from config import BASE_DIR, settings
from fastapi.staticfiles import StaticFiles
from database import get_db
from models import Todo
from sqlalchemy.orm import Session
from schemas import TodoCreate
import requests

#Pythonの関数・メソッドはsnake_case
#Pythonの変数はsnake_case

#静的ファイルのディレクトリ
static_dir = BASE_DIR / "static"
#FastAPIアプリケーションを作成
app=FastAPI()
# HTMLテンプレートの保存先を設定
templates=Jinja2Templates(directory=static_dir)
#cssとjsファイルはこれで渡す
app.mount("/static",StaticFiles(directory=static_dir), name="static")


# 02 ページ表示
@app.get("/",response_class=HTMLResponse)#HTMLと言うルール(設計図)を渡している。
def top_page(request:Request)->HTMLResponse:#->HTMLResponseは単純にhtmlを返しますよと言っている
    return templates.TemplateResponse("main.html",{"request":request})

# 03 Todo関連API
# 指定されたステータスに応じてTodoを取得し、JSON形式で返す
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

# リクエストで受け取ったデータをもとに、新しいTodoを登録する
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

# 指定されたIDのTodoを削除する
@app.delete("/api/todos/{todo_id}")
def delete_todo(todo_id:int,db:Session=Depends(get_db)):
    todo=db.get(Todo,todo_id)
    db.delete(todo)
    db.commit()
    
# 指定されたIDのTodoの完了状態、または登録内容を更新する
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


# 04 件数取得API
# Todoの総数・完了数・未完了数を取得して返す
@app.get("/api/count/") 
def get_count(db:Session=Depends(get_db)):
    count_all=db.query(Todo).count()
    count_completed=db.query(Todo).filter(Todo.completed==True).count()
    count_not_completed=db.query(Todo).filter(Todo.completed==False).count()
    
    return{
        
        "count_all":count_all,
        "count_completed":count_completed,
        "count_not_completed":count_not_completed,
    }
         
# 05 天気API
# 指定された場所の天気情報を外部APIから取得して返す
@app.get("/api/get-weather")
def get_weather(location:str,span:str):
    if location=="平塚":
        latitude=35.33
        longitude=139.35
    elif location=="大崎":
        latitude=35.62
        longitude=139.73
        
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": "weather_code,temperature_2m,precipitation_probability",
        "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
        "current":"temperature_2m,weather_code",
        "timezone": "Asia/Tokyo",
        "forecast_days":7,
        }
    
    response=requests.get(url,params=params)
    data=response.json()
    print(f"現在の温度:{data['current']['temperature_2m']}")
    print(f"現在の天気:{data['current']['weather_code']}")
    print(f"時間ごと:{data['hourly']}")
    print(f"週間天気:{data['daily']['weather_code']}")
    return{
        "data":data
    }
    
    
    
   
    
    
    