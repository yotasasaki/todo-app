from sqlalchemy import create_engine
from collections.abc import Generator
from config import settings
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

#DBとの接続口を作成
engine=create_engine(settings.database_url,pool_pre_ping=True, connect_args={"connect_timeout": 5})
#DB操作のセッション作成
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

#これはEntityのクラスを作成する際の基底クラス
class Base(DeclarativeBase):
    pass

#DBのセッションをつくって閉じるメソッド
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
