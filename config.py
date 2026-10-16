import os
from pathlib import Path
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent#これは"C:\Users\sasak\Desktop\my_python\Todo"アプリを返す。どこの環境に入れても成り立つようにこれをいれている。
load_dotenv(BASE_DIR / ".env")#envを使うためのライブラリ


class Settings:
    app_name: str = os.getenv("APP_NAME", "todo管理システム")
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://YOUR_USER:YOUR_PASSWORD@localhost:5432/todo_db",
    )
    
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
    openai_image_model: str = os.getenv("OPENAI_IMAGE_MODEL", "gpt-image-2")
    openai_image_quality: str = os.getenv("OPENAI_IMAGE_QUALITY", "medium")
    

#ここは理由はよくわからないがここで実物をつくっておく
settings = Settings()