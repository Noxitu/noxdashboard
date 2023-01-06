from datetime import datetime
import json

from pydantic import BaseModel


class PostBase(BaseModel):
    id: str
    timestamp: float
    source: str
    like: bool
    content: dict


class PostCreate(PostBase):
    pass


class PostMarkers(BaseModel):
    id: str
    like: bool
    seen: int


class Post(PostBase):
    # private_id: int
    seen: int

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
