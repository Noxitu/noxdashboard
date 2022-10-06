from fastapi import FastAPI

from noxdashboard.modules.kwejk import Downloader
from noxdashboard.apikey import CHECK_API_KEY


DEFAULT_ROUTE = '/kwejk'


def create_app():
    app = FastAPI(**CHECK_API_KEY)
    kwejk = Downloader()

    @app.get('/health') 
    def health():
        return True

    @app.get('/pages/latest_id')
    def get_id():
        return dict(id=kwejk.get_latest_id())

    @app.get('/pages/{page_id}')
    def get_page(page_id: int):
        return kwejk.get_page(page_id)

    return app
