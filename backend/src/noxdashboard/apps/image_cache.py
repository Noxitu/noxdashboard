import pathlib
import re

import requests
from fastapi import Response

from noxdashboard.api_router import APIRouter
from noxdashboard.permissions import permissions


DEFAULT_ROUTE = '/image_cache'

def create_app(app_config):
    app = APIRouter()
    cache_path = app_config.get('cache_path')

    if cache_path is not None:
        cache_path = pathlib.Path(cache_path)

    @app.get('/health', tags=['health']) 
    def health():
        return True
    
    @app.get('/stats') 
    def stats():
        count = 0
        size = 0

        if cache_path is not None and cache_path.exists():
            for entry in cache_path.iterdir():
                count += 1
                size += entry.stat().st_size

        return dict(
            count=count,
            size=size,
        )


    @app.get('/image/{image}')
    @permissions()
    def get_image(image):
        allow_cache = (re.match(R'^[0-9]+\.jpeg$', image) is not None) and (cache_path is not None)

        if allow_cache:
            if (cache_path / image).exists():
                print('[Image cache] loading:', image)
                content = (cache_path / image).read_bytes()

                return Response(
                    content=content,
                    media_type='image/jpeg',
                    headers={
                        'Cache-Control': f'max-age={24*3600}',
                    },
                )


        url = app_config['url'] + image
        print('[Image cache] requesting:', image, 'from', url)
        res = requests.get(url, headers={'Referer': app_config['referer']}, timeout=5)
        res.raise_for_status()

        content = res.content
        content_type = res.headers['Content-Type']

        if allow_cache and len(content) < 500_000:
            cache_path.mkdir(parents=True, exist_ok=True)
            print('[Image cache] saving:', image)
            (cache_path / image).write_bytes(content)
        
        return Response(
            content=content,
            media_type=content_type,
            headers={
                'Cache-Control': f'max-age={24*3600}',
            },
        )

    return app
