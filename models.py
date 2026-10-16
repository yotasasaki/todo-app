from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base
from uuid import uuid4
from sqlalchemy.dialects.postgresql import JSONB, UUID
from datetime import date, datetime

#マッピングのクラス名はPascalCase

#idの部分はpython側とDB側で基本同じ名前を使う。
#Mapped[str]は「title はPythonでは文字列として扱いますという意味
#mapped_column()はDB側で登録するときはこの型ですということ
class Todo(Base):
    __tablename__="todos"
    id: Mapped[int] = mapped_column(primary_key=True,autoincrement=True)
    title: Mapped[str | None] = mapped_column(String(255))
    completed:Mapped[bool] = mapped_column(Boolean, default=False)
    priority:Mapped[str | None] = mapped_column(String(20))
    category:Mapped[str | None] = mapped_column(String(50))
    due_date: Mapped[date | None] = mapped_column(Date,index=True)
    
    
    