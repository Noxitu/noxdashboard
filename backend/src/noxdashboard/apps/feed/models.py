from datetime import datetime
import json

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Index, DateTime
from sqlalchemy.orm import relationship

from .database import Base


class Post(Base):
    __tablename__ = 'posts'

    private_id = Column(Integer, primary_key=True, index=True)
    id = Column(String, unique=True, index=True)
    timestamp = Column(DateTime, nullable=False)
    source = Column(String, nullable=False)
    like = Column(Integer, nullable=False, default=0)
    seen = Column(Integer,
                  nullable=False,
                  default=0)
    content = Column(String, nullable=False)
    updated_at = Column(DateTime, 
                        nullable=False,
                        default=datetime.utcnow,
                        onupdate=datetime.utcnow,
    )

    @staticmethod
    def from_schema(post):
        return Post(
            id=post.id,
            timestamp=datetime.fromtimestamp(post.timestamp),
            source=post.source,
            like=post.like,
            content=json.dumps(post.content)
        )

# Index('i1', Post.timestamp)
# Index('i2', Post.source, Post.timestamp)
# Index('i3', Post.status, Post.timestamp)
# Index('i4', Post.source, Post.status, Post.timestamp)
