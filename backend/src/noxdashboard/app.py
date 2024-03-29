import importlib
import inspect

import fastapi

from .cors import allow_cors
from .settings import get_settings


def create_app():
    app = fastapi.FastAPI()

    config = get_settings()

    for app_config in config.get('apps', []):
        app_name = app_config['name']

        if app_name.startswith('-'):
            continue

        module = importlib.import_module(f'noxdashboard.apps.{app_name}')
        route = app_config.get('route', getattr(module, 'DEFAULT_ROUTE', None))

        if route is None:
            raise Exception('Route not provided')

        print(f'Creating module {app_name} in route: {route}.')

        signature = inspect.signature(module.create_app)
        kwargs = {}

        def set_kwarg(key, value):
            if key in signature.parameters:
                kwargs[key] = value

        set_kwarg('app_config', app_config)

        subapp = module.create_app(**kwargs)

        if isinstance(subapp, fastapi.APIRouter):
            subrouter = fastapi.APIRouter(prefix=route, tags=[app_name])
            subrouter.include_router(subapp)
            app.include_router(subrouter)

        else:
            app.mount(route, subapp)

    allow_cors(app)

    return app
