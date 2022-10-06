import threading

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import psutil

from noxdashboard.apikey import CHECK_API_KEY, check_ws_api_key


DEFAULT_ROUTE = '/resources'


class ResourceMonitor:
    def __init__(self):
        self.data = dict(cpu=0.0, mem=0.0)
        self._thread = threading.Thread(target=self.monitor, daemon=True)
        self._thread.start()

    def monitor(self):
        while True:
            cpu = psutil.cpu_percent(interval=10)
            mem = psutil.virtual_memory().percent
            self.data = dict(cpu=cpu, mem=mem)


def create_app():
    app = FastAPI(**CHECK_API_KEY)
    monitor = ResourceMonitor()

    @app.get("/get")
    def get():
        return monitor.data

    @app.websocket("/subscribe")
    async def subscribe(websocket: WebSocket):
        try:
            await websocket.accept()
            await check_ws_api_key(websocket)

            while True:
                data = await websocket.receive_json()

                if not data:
                    break

                await websocket.send_json(monitor.data)
        except WebSocketDisconnect:
            pass

    return app
