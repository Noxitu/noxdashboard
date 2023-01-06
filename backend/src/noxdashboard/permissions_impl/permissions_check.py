from functools import lru_cache

import fastapi
from fastapi.security.api_key import APIKeyHeader

from noxdashboard.settings import get_settings


TOKEN_HEADER = APIKeyHeader(
    name='X-Token',
    description='API Token',
    auto_error=True,
)


@lru_cache
def get_token_db():
    token_list = get_settings('tokens')
    return {token['token']: token for token in token_list}


def _verify_token(token: str, token_db: dict, required_permissions: list) -> bool:
    required_permissions = set(required_permissions)
    token_desc = token_db.get(token)

    if token_desc is None:
        return False

    return required_permissions & set(token_desc['permissions']) == required_permissions


def create_check_token(permissions: list):
    async def check_token(
        token: str = fastapi.Security(TOKEN_HEADER),
        token_db: dict = fastapi.Depends(get_token_db)
    ):
        if not _verify_token(token, token_db, permissions):
            raise fastapi.HTTPException(
                status_code=fastapi.status.HTTP_403_FORBIDDEN,
                detail=f'API Token does not have permissions required for endpoint: {permissions}',
            )

    return check_token


def create_check_ws_token(permissions: list):
    async def check_token(
        token: str = fastapi.Query(default=''),
        token_db: dict = fastapi.Depends(get_token_db)
    ):
        return _verify_token(token, token_db, permissions)

    return check_token
