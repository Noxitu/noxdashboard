import requests
from fastapi import Response

from noxdashboard.api_router import APIRouter
from noxdashboard.permissions import permissions


DEFAULT_ROUTE = '/image_cache'

def create_app(app_config):
    app = APIRouter()


    @app.get('/health', tags=['health']) 
    def health():
        return True

    @app.get('/image/{image}')
    @permissions()
    def get_image(image):
        url = app_config['url'] + image
        print('Image cache: requesting url:', url)
        res = requests.get(url, headers={'Referer': app_config['referer']}, timeout=5)
        res.raise_for_status()
        return Response(
            content=res.content,
            media_type=res.headers['Content-Type'],
            headers={
                'Cache-Control': f'max-age={24*3600}',
            },
        )

    return app
