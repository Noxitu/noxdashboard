import fastapi
from fastapi.staticfiles import StaticFiles


DEFAULT_ROUTE = '/static'


def create_app():
    app = fastapi.FastAPI()
    app.mount('/', StaticFiles(directory='docs', html=True))

    return app
