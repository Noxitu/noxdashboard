import fastapi
from fastapi.staticfiles import StaticFiles


DEFAULT_ROUTE = '/'


def create_app():
    app = fastapi.FastAPI()
    app.mount('/', StaticFiles(directory='static', html=True))

    return app
