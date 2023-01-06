import json

from fastapi import Depends
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from noxdashboard.api_router import APIRouter
from noxdashboard.permissions import permissions
from . import database, models, schemas

DEFAULT_ROUTE = '/feed'
PERMISSION_NAME = 'feed::feed_source'


def create_app():
    database.create()

    app = APIRouter()

    @app.get('/health', tags=['health'], summary='Health check. Returns true.')
    def health():
        return True

    @app.get('/', summary='List feed elements.', response_model=list[schemas.Post])
    @permissions()
    def feed(db: Session = Depends(database.get)):
        items = db.query(models.Post)
        items = items.where(or_(models.Post.seen != 1, models.Post.like))
        items = items.order_by(models.Post.timestamp.desc())
        items = items.offset(0).limit(50)
        items = items.all()
        items = [schemas.Post.from_db(item) for item in items]

        return items

    @app.put('/add', summary='Add multiple new feed elements.')
    @permissions(PERMISSION_NAME)
    def add(
        items: list[schemas.PostCreate],
        db: Session = Depends(database.get)
    ):
        count = 0

        for post in items:
            db_post = models.Post.from_schema(post)
            try:
                db.add(db_post)
                db.commit()
                count += 1
            except IntegrityError:
                db.rollback()
        
        return count

    @app.post('/mark', summary='Toggle feed element flags.')
    @permissions()
    def mark(
        post: schemas.PostMarkers,
        db: Session = Depends(database.get)
    ):
        db.query(models.Post) \
          .where(models.Post.id == post.id) \
          .update({
            models.Post.like: post.like,
            models.Post.seen: post.seen,
          })
        db.commit()
        return True

    return app
