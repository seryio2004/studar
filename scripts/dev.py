"""Serve the project locally, falling back when a port is occupied."""
import argparse
import errno
import hashlib
import json
import re
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def remove_resolved_review(payload):
    """Delete JSON artifacts of one review only after its exact version is resolved."""
    name = payload.get('path')
    if not isinstance(name, str) or not re.fullmatch(r'imports/moodle/\d{4}-\d{2}-\d{2}/proposals\.json', name):
        raise ValueError('Ruta de revisión inválida.')
    path = ROOT / name
    folder = path.parent
    if folder.resolve() != ROOT.resolve() / folder.relative_to(ROOT) or path.is_symlink():
        raise ValueError('La revisión no puede ser un enlace simbólico.')
    if not path.exists():
        return []
    content = path.read_bytes()
    if hashlib.sha256(content).hexdigest() != payload.get('sha256'):
        raise ValueError('La revisión ha cambiado; comprueba sus nuevas propuestas antes de borrar.')
    report = json.loads(content)
    if not isinstance(report, dict):
        raise ValueError('Informe inválido.')
    proposals = report.get('proposals')
    resolved = payload.get('resolved_ids')
    if not isinstance(resolved, list) or any(not isinstance(value, str) for value in resolved):
        raise ValueError('Decisiones inválidas.')
    if not isinstance(proposals, list) or not proposals or any(not isinstance(item, dict) or not isinstance(item.get('id'), str) for item in proposals):
        raise ValueError('No hay propuestas revisables en este informe.')
    if {item['id'] for item in proposals} != set(resolved):
        raise ValueError('Todavía quedan propuestas por resolver.')
    files = list(folder.rglob('*.json'))
    if any(file.is_symlink() or not file.resolve().is_relative_to(folder.resolve()) for file in files):
        raise ValueError('No se borran archivos JSON enlazados fuera de la revisión.')
    # Keep proposals.json until the end so interrupted cleanup can safely retry.
    files.sort(key=lambda file: (file == path, file.as_posix()))
    removed = []
    for file in files:
        file.unlink()
        removed.append(file.relative_to(ROOT).as_posix())
    return removed


class ProjectHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path != '/api/moodle-reviews/cleanup':
            self.send_error(404)
            return
        origin = self.headers.get('Origin')
        if origin and origin != 'http://' + self.headers.get('Host', ''):
            self.send_error(403, 'Origen no permitido')
            return
        if self.headers.get('Content-Type', '').split(';')[0] != 'application/json':
            self.send_error(415)
            return
        try:
            size = int(self.headers.get('Content-Length', '0'))
            if not 0 < size <= 1024 * 1024:
                raise ValueError('Solicitud inválida.')
            payload = json.loads(self.rfile.read(size))
            if not isinstance(payload, dict):
                raise ValueError('Solicitud inválida.')
            body = {'deleted': remove_resolved_review(payload)}
            status = 200
        except (ValueError, OSError) as error:
            body = {'error': str(error)}
            status = 409
        encoded = json.dumps(body).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def do_GET(self):
        if self.path.split('?', 1)[0] != '/api/moodle-reviews':
            return super().do_GET()
        reviews = []
        for path in sorted((ROOT / 'imports/moodle').glob('????-??-??/proposals.json')):
            if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', path.parent.name):
                continue
            try:
                content = path.read_bytes()
            except OSError:
                continue  # A review being replaced will be discovered next time.
            reviews.append({'path': path.relative_to(ROOT).as_posix(),
                            'sha256': hashlib.sha256(content).hexdigest()})
        body = json.dumps({'reviews': reviews}).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def create_server(port):
    handler = partial(ProjectHandler, directory=str(ROOT))
    for candidate in range(port, min(port + 100, 65536)):
        try:
            return ThreadingHTTPServer(('127.0.0.1', candidate), handler)
        except OSError as error:
            if error.errno != errno.EADDRINUSE:
                raise
    raise OSError('No hay puertos disponibles. Prueba npm run dev -- --port 8000.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=5173)
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error('El puerto debe estar entre 1 y 65535.')
    with create_server(args.port) as server:
        port = server.server_address[1]
        if port != args.port:
            print(f'El puerto {args.port} está ocupado; se usará el {port}.', flush=True)
        print(f'StudyTracker: http://localhost:{port}', flush=True)
        print('Pulsa Ctrl+C para detener el servidor.', flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print('\nServidor detenido.', flush=True)


if __name__ == '__main__':
    main()
