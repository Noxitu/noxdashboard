# openssl req -x509 -newkey rsa:4096 -keyout ssl/local_key.pem -out ssl/local_cert.pem -sha256 -days 30000 -nodes -subj '/CN=noxdashboard-local'
# openssl req -x509 -newkey rsa:4096 -keyout ssl/oracle_key.pem -out ssl/oracle_cert.pem -sha256 -days 30000 -nodes -subj '/CN=noxdashboard-oracle'
