
from noxdashboard.modules.kwejk import Downloader
from noxdashboard.api_router import APIRouter


DEFAULT_ROUTE = '/kwejk'


def create_app():
    app = APIRouter()
    kwejk = Downloader()

    @app.get('/health', tags=['health']) 
    def health():
        return True

    @app.get('/pages/latest_id')
    def get_id():
        return dict(id=kwejk.get_latest_id())

    @app.get('/pages/{page_id}')
    def get_page(page_id: int):
        return kwejk.get_page(page_id)

    return app
