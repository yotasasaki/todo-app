# 01 Import・初期設定
from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.responses import HTMLResponse
from starlette.templating import Jinja2Templates
from config import BASE_DIR, settings
from fastapi.staticfiles import StaticFiles
from database import get_db
from models import Todo, Case, Project
from sqlalchemy.orm import Session
from schemas import TodoCreate,CaseCreate,CaseUpdate
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
@app.get("/api/todos")#1
def get_todos(status: str | None = None,db:Session=Depends(get_db)):#dbという名前のセッション作成
    query=db.query(Todo);#Todoクラスにマッピング
    
    if status=="completed":
        query=query.filter(Todo.completed==True)
        
    elif status=="active":
        query=query.filter(Todo.completed==False)
        
    #この段階ではただのtodosテーブルからデータ取得しただけ。(relationはまだ実行されていない)
    todos=query.all()
    #左側の変数名はjsonの項目名
    return[{
        "id":todo.id,
        "title":todo.title,
        "completed":todo.completed,    
        "priority":todo.priority,    
        "category":todo.category,    
        "due_date":todo.due_date,
        "project_id": todo.project_id,
        #ここでrelationで以下SQlが実行
        #SELECT *
        #FROM projects
        #WHERE projects.id = todos.project_id;
        "project_name": todo.project.name,
        "case_id": todo.case_id,
        "case_name": todo.case.name if todo.case else None,
        
    }
    for todo in todos]

@app.get("/api/todos/{todo_id}")#2
def get_todo(todo_id:int,db:Session=Depends(get_db)):
    todo=db.query(Todo).filter(Todo.id==todo_id).first()
    
    return todo
    

# リクエストで受け取ったデータをもとに、新しいTodoを登録する
#jsで値を受け取る、それをTodoCreateというデータ設計図で、todo_newという名前で扱う。
@app.post("/api/todos")#3
def add_todo(todo_new:TodoCreate,case_id:int,db:Session=Depends(get_db)):
    
    case=db.query(Case).filter(Case.id==case_id).first()
    
    if not case:
        raise HTTPException(
            status_code=404,
            detail="Case not found"
        )
    
    todo = Todo(
    title=todo_new.title,
    priority=todo_new.priority,
    due_date=todo_new.due_date,
    project_id=case.project_id,
    case_id=case_id
    )
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo

# 指定されたIDのTodoの完了状態、または登録内容を更新する
#{todo_id}はパスパラメーター(PathParameter)と呼ばれるもの。
#todo_idという変数名でpythonで扱える
@app.patch("/api/todos/{todo_id}")#4
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
        
        
# 指定されたIDのTodoを削除する
@app.delete("/api/todos/{todo_id}")#5
def delete_todo(todo_id:int,db:Session=Depends(get_db)):
    todo=db.get(Todo,todo_id)
    db.delete(todo)
    db.commit()
    


@app.get("/api/cases")#6
def get_cases(db:Session=Depends(get_db)):
    query=db.query(Case)
    cases=query.all()
    
    return[{
        "id":case.id,
        "project_id":case.project_id,
        "name":case.name,
        "description":case.description,
        "created_at":case.created_at,
        "completed_at":case.completed_at
    }
    for case in cases]
    
@app.get("/api/cases/{case_id}")#7
def get_case(case_id:int,db:Session=Depends(get_db)):
    case=db.query(Case).filter(Todo.id==case_id).first()
    
    return case

@app.post("/api/cases")#8
def add_case(case_new:CaseCreate,project_id:int,db:Session=Depends(get_db)):
    
    
    case=Case(
    project_id=project_id,
    name=case_new.name,
    description=case_new.description
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    
    return case
    

@app.patch("/api/cases{case_id}")#9
def patch_case(case_id:int,case_update:CaseUpdate,db:Session=Depends(get_db)):
    
    case=db.query(Case).filter(Case.id==case_id).first()
    
    if case is None:
        raise HTTPException(status_code=404, detail="Case not found")
        
    
    case.name=case_update.name
    case.description=case_update.description
    case.project_id=case_update.project_id
    
    db.commit()
    db.refresh(case)
    return case

# 指定されたIDのCaseを削除する
@app.delete("/api/cases/{case_id}")#10
def delete_case(case_id:int,db:Session=Depends(get_db)):
    case=db.query(Case).filter(Case.id==case_id).first()
    db.delete(case)
    db.commit()

@app.get("/api/projects")#11
def get_projects(db:Session=Depends(get_db)):
    query=db.query(Project)
    projects=query.all()
    
    return[{
        "id":project.id,
        "name":project.name,
        "created_at":project.created_at,
    }
    for project in projects]

#Caseに属するTodo一覧取得
@app.get("/api/cases/{case_id}/todos")#16
def get_case_todos(case_id:int,db:Session=Depends(get_db)):
    todos=db.query(Todo).filter(Todo.case_id==case_id).all()
    
    return todos





@app.get("/api/projects/{project_id}/cases")#17
def get_project_cases(project_id:int,db:Session=Depends(get_db)):
    cases=db.query(Case).filter(Case.project_id==project_id).all()
    
    return classmethods





@app.post("/api/add-case/{project_id}")#9
def add_case2(case_new:CaseCreate,db:Session=Depends(get_db)):
    case=Case(
        name=case_new.name,
        description=case_new.description,
        project_id=case_new.project_id          
    )
    db.add(case)
    db.commit()
    return case




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
    
    
    
   
    
    
    