from datetime import datetime
import json

from pydantic import BaseModel


class PostBase(BaseModel):
    id: str
    timestamp: float
    source: str
    like: int
    content: dict


class PostCreate(PostBase):
    pass


class PostMarkers(BaseModel):
    id: str
    like: int
    seen: bool


class Post(PostBase):
    # private_id: int
    seen: bool

    class Config:
        orm_mode = True

    @staticmethod
    def from_db(row):
        return Post(
            id=row.id,
            timestamp=row.timestamp.timestamp(),
            source=row.source,
            like=row.like,
            seen=row.seen,
            content=json.loads(row.content),
        )
