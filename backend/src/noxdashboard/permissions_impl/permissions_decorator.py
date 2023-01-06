import fastapi

import noxdashboard.api_router


def permissions(*args):
    return noxdashboard.api_router.permission_decorator(*args)
