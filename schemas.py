from datetime import date
from pydantic import BaseModel
#マッピングのクラス名はPascalCase

#FastAPI はこのクラスを使って、リクエスト JSON を自動で検証します。
class TodoCreate(BaseModel):
    title: str
    priority: str = "medium"
    #category: str | None = None
    due_date: date | None = None
    #project_id: int
    case_id: int | None = None
    
    
class CaseCreate(BaseModel):
    name: str
    description: str
    project_id: int
    
    
class CaseUpdate(BaseModel):
    name: str
    description: str
    project_id: int