import fastapi

from noxdashboard.permissions_impl.permission_enum import Permission
from noxdashboard.permissions_impl.permissions_check import create_check_token, create_check_ws_token


class RouteBuilder:
    def __init__(self, call):
        self._call = call
        self._permissions = [Permission.Default]

    def __compute_dependencies(self):
        ret = []

        if self._permissions:
            ret.append(fastapi.Depends(create_check_token(self._permissions)))

        return ret

    def build(self, func, args, kwargs):
        return func(
            *args,
            **kwargs,
            dependencies=self.__compute_dependencies()
        )(self._call)

    def build_websocket(self, func, args, kwargs):
        @func(*args, **kwargs)
        async def start_connection(
            websocket: fastapi.WebSocket,
            valid_token: bool = fastapi.Depends(create_check_ws_token(self._permissions)),
        ):
            if valid_token:
                await self._call(websocket)

        return start_connection



def _to_builder(call):
    if isinstance(call, RouteBuilder):
        return call

    return RouteBuilder(call)


def route_decorator(simplified_decorator):
    def actual_decorator(*args, **kwargs):
        def decorator(call):
            call = _to_builder(call)
            simplified_decorator(call, *args, **kwargs)
            return call
        return decorator
    return actual_decorator


@route_decorator
def permission_decorator(call: RouteBuilder, *permissions):
    call._permissions = permissions


def _wrap_method(name):
    method = getattr(fastapi.APIRouter, name)

    def invoke(*args, **kwargs):
        def decorator(call):
            call = _to_builder(call)
            return call.build(method, args, kwargs)
        return decorator

    return invoke


class APIRouter(fastapi.APIRouter):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    get = _wrap_method('get')
    post = _wrap_method('post')
    put = _wrap_method('put')

    def websocket(self, *args, **kwargs):
        websocket = super().websocket
        def decorate(call):
            call = _to_builder(call)
            return call.build_websocket(websocket, args, kwargs)
        return decorate

