from datetime import date
from pydantic import BaseModel
#マッピングのクラス名はPascalCase

#FastAPI はこのクラスを使って、リクエスト JSON を自動で検証します。
class TodoCreate(BaseModel):
    title: str
    priority: str = "medium"
    category: str | None = None
    due_date: date | None = None