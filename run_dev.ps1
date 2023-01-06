$Env:NOXDASHBOARD_NAME = 'local'

& '.venv\Scripts\uvicorn.exe' 'noxdashboard.app:create_app' --factory --port 5000 --host 0.0.0.0 --ssl-keyfile=ssl/local_key.pem --ssl-certfile=ssl/local_cert.pem --log-level trace --reload
# & '.venv\Scripts\uvicorn.exe' 'noxdashboard.app:create_app' --factory --port 5000 --host 0.0.0.0 --ssl-keyfile=ssl/local_key.pem --ssl-certfile=ssl/local_cert.pem --reload