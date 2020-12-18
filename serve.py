from http.server import HTTPServer, BaseHTTPRequestHandler 
import ssl
httpd = HTTPServer(('localhost', 443), BaseHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(
    httpd.socket,
    keyfile="/etc/letsencrypt/live/media.auditory.ru/privkey.pem",
    certfile='/etc/letsencrypt/live/media.auditory.ru/fullchain.pem',
    server_side=True)
httpd.serve_forever()