import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


DATABASE_PATH = './db/feed.sqlite3'
SQLALCHEMY_DATABASE_URL = f'sqlite:///{DATABASE_PATH}'


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


def get_size():
    """Get Database size in bytes."""
    return os.stat(DATABASE_PATH).st_size
