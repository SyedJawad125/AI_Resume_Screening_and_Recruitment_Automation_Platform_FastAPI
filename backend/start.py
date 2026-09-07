# # start.py
# from app.main import app
# import uvicorn

# if __name__ == "__main__":
#     uvicorn.run(
#         "app.main:app",
#         host="127.0.0.1",  # Explicitly use localhost
#         port=8000,
#         reload=True,
#         log_level="debug"  # Get more detailed logs
#     )





"""
start.py
─────────
Single script to start the development server.

Usage:
    python start.py              # default: port 8000
    python start.py --port 9000
    python start.py --prod       # production mode (no reload)
"""
import subprocess
import sys
import argparse


def main():
    parser = argparse.ArgumentParser(description='Start AI Document Processing API')
    parser.add_argument('--port',   type=int, default=8000,  help='Port to run on')
    parser.add_argument('--host',   type=str, default='0.0.0.0', help='Host to bind')
    parser.add_argument('--prod',   action='store_true',     help='Production mode (no reload)')
    parser.add_argument('--workers',type=int, default=1,     help='Number of workers (prod only)')
    args = parser.parse_args()

    cmd = [
        'uvicorn', 'app.main:app',
        '--host', args.host,
        '--port', str(args.port),
        '--log-level', 'info',
    ]

    if args.prod:
        cmd += ['--workers', str(args.workers)]
        print(f'🚀 Starting PRODUCTION server on {args.host}:{args.port} ({args.workers} workers)')
    else:
        cmd += ['--reload']
        print(f'🔧 Starting DEVELOPMENT server on {args.host}:{args.port} (auto-reload on)')

    print(f'   API Docs: http://localhost:{args.port}/api/docs\n')

    try:
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print('\n👋 Server stopped.')


if __name__ == '__main__':
    main()

    