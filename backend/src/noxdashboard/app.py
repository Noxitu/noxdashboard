import importlib
import json
import os
from pathlib import Path

import fastapi

from .cors import allow_cors


def get_config_paths():
    name = os.environ.get('NOXDASHBOARD_NAME')

    if name is not None:
        yield f'./configs/dashboard.{name}.json'

    yield './configs/dashboard.json'


def load_config():
    for path in get_config_paths():
        if Path(path).exists():
            with open(path) as fd:
                return json.load(fd)


def create_app():
    app = fastapi.FastAPI()

    config = load_config()

    for app_config in config.get('apps', []):
        app_name = app_config['name']

        if app_name.startswith('-'):
            continue

        module = importlib.import_module(f'noxdashboard.apps.{app_name}')
        route = app_config.get('route', getattr(module, 'DEFAULT_ROUTE', None))

        if route is None:
            raise Exception('Route not provided')

        subapp = module.create_app()

        app.mount(route, subapp)

    allow_cors(app)

    return app
