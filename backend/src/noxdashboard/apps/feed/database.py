from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = 'sqlite:///./db/feed.sqlite3'

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=dict(
        check_same_thread=False
    )
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def create():
    Base.metadata.create_all(bind=engine)


def get():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
