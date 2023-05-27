from functools import lru_cache
import json
from pathlib import Path

import pydantic


class EnvSettings(pydantic.BaseSettings):
    instance_name: str = pydantic.Field('local', env='NOXDASHBOARD_NAME')


@lru_cache
def get_instance_name() -> str:
    return EnvSettings().instance_name


@lru_cache
def get_settings(name='dashboard'):
    instance_name = get_instance_name()
    print(f'Loading settings "{name}.{instance_name}"')
    config_path = Path() / 'configs' / f'{name}.{instance_name}.json'

    with open(config_path) as fd:
        return json.load(fd)

