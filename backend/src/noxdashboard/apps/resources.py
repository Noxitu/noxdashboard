import shutil
import threading
import time

from fastapi import WebSocket, WebSocketDisconnect
import psutil

from noxdashboard.api_router import APIRouter


DEFAULT_ROUTE = '/resources'


class ResourceMonitor:
    def __init__(self):
        self.data = dict(cpu=0.0, mem=0.0, disk=0.0)

        self._thread = threading.Thread(target=self.monitor, daemon=True)
        self._thread.start()
        
        self._thread2 = threading.Thread(target=self.disk_monitor, daemon=True)
        self._thread2.start()

    def monitor(self):
        while True:
            cpu = psutil.cpu_percent(interval=10)
            mem = psutil.virtual_memory().percent
            self.data.update(cpu=cpu, mem=mem)

    def disk_monitor(self):
        while True:
            usage = shutil.disk_usage('/')
            self.data.update(disk=100 * usage.used / usage.total)
            time.sleep(60)


def create_app():
    app = APIRouter()
    monitor = ResourceMonitor()

    @app.get('/get')
    def get():
        return monitor.data

    @app.websocket('/subscribe')
    async def subscribe(websocket: WebSocket):
        try:
            await websocket.accept()

            while True:
                data = await websocket.receive_json()

                if not data:
                    break

                await websocket.send_json(monitor.data)
        except WebSocketDisconnect:
            pass

    return app
