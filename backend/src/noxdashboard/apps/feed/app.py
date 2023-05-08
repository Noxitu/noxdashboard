import json

from fastapi import Depends
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from noxdashboard.api_router import APIRouter
from noxdashboard.permissions import permissions
from . import database, models, schemas

DEFAULT_ROUTE = '/feed'
PERMISSION_FEED_SOURCE = 'feed::feed_source'


def create_app():
    database.create()

    app = APIRouter()

    @app.get('/health', tags=['health'], summary='Health check. Returns true.')
    def health():
        return True

    @app.get('/stats', summary='Get database statistics.')
    def stats(db: Session = Depends(database.get)):
        return dict(
            count=db.query(models.Post).count(),
            saved=db.query(models.Post).where(models.Post.like == 1).count(),
            unread=db.query(models.Post).where(models.Post.seen == False).count(),
            size=database.get_size()
        )


    @app.get('/', summary='List feed elements.', response_model=list[schemas.Post])
    @permissions()
    def feed(filter: str = 'interesting', db: Session = Depends(database.get)):
        items = db.query(models.Post)

        if filter == 'interesting':
            items = items.where(or_(models.Post.seen == False, models.Post.like == 1))
        elif filter == 'unseen':
            items = items.where(models.Post.seen == False)
        elif filter == 'saved':
            items = items.where(models.Post.like == 1)
        elif filter == 'archived':
            items = items.where(models.Post.like == 2)
        else:
            raise Exception(f'Invalid filter={filter}')

        items = items.order_by(models.Post.timestamp.desc())
        items = items.offset(0).limit(150)
        items = items.all()
        items = [schemas.Post.from_db(item) for item in items]

        return items
    
    @app.get

    @app.put('/add', summary='Add multiple new feed elements.')
    @permissions(PERMISSION_FEED_SOURCE)
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
