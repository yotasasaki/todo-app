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
    #ForeignKey("projects.id"):projectsテーブルのidと紐づける(project_idには、projectsテーブルに存在するidを設定する)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id"), nullable=False)
    case_id: Mapped[int | None] = mapped_column(Integer,ForeignKey("cases.id"),nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime,nullable=True)
    created_at: Mapped[datetime | None] = mapped_column(DateTime,server_default=func.now())
    #relationship()：Caseモデルとのリレーションを設定し、関連するCaseのデータを取得できるようにする
    #back_populates="todos"：Caseモデル側のtodosと双方向に紐づける
    case: Mapped["Case | None"] = relationship(back_populates="todos")
    project: Mapped["Project"] = relationship(back_populates="todos")
    
    
class Case(Base):
    __tablename__="cases"
    id: Mapped[int] = mapped_column(primary_key=True,autoincrement=True)
    project_id: Mapped[int] = mapped_column(Integer,ForeignKey("projects.id"))
    name: Mapped[str] = mapped_column(String(100),nullable=False)
    description: Mapped[str| None] = mapped_column(Text,nullable=True)
    created_at: Mapped[datetime | None] = mapped_column(DateTime,server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime,nullable=True)
    project: Mapped["Project"] = relationship(back_populates="cases")
    todos: Mapped[list["Todo"]] = relationship(back_populates="case")
    
    
class Project(Base):
    __tablename__="projects"
    id: Mapped[int] = mapped_column(primary_key=True,autoincrement=True)
    name: Mapped[str] = mapped_column(String(100),nullable=False)
    created_at: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())
    cases:Mapped[list["Case"]]=relationship(back_populates="project")
    todos: Mapped[list["Todo"]] = relationship(back_populates="project")
    
    
    
    