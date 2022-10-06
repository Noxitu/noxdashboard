import os

import fastapi
from fastapi.security.api_key import APIKeyHeader


API_KEY = os.environ['NOXDASHBOARD_APIKEY']

API_KEY_HEADER = APIKeyHeader(
    name='X-Api-Key',
    description='Mandatory API Token, required for all endpoints',
    auto_error=True,
)

async def check_api_key(api_key_header: str = fastapi.Security(API_KEY_HEADER)):
    correct_api_key = (api_key_header == API_KEY)

    if not correct_api_key:
        raise fastapi.HTTPException(
            status_code=fastapi.status.HTTP_403_FORBIDDEN,
            detail='Invalid API Key',
        )


async def check_ws_api_key(websocket: fastapi.WebSocket):
    data = await websocket.receive_json()
    api_key = data.get('apiKey') if isinstance(data, dict) else None
    correct_api_key = (api_key == API_KEY)

    if not correct_api_key:
        await websocket.close()
        raise fastapi.WebSocketDisconnect()

CHECK_API_KEY = dict(dependencies=[fastapi.Security(check_api_key)])

