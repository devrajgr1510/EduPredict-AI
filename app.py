#!/usr/bin/env python3
"""Main Python entry point for the Edu Predict Academic Platform.

Runs the SQLite-backed Python HTTP server, Machine Learning prediction engine,
Digital Student Twin simulator, K-Means clustering, Gemini Academic Advisor,
and serves the production React frontend from dist/.

Usage:
    python app.py              # Auto-builds dist/ if missing & serves on port 3000 (or $PORT)
    python app.py --build      # Rebuilds frontend bundle then starts server on port 3000
    python app.py --port 5050  # Runs Python API backend on port 5050
"""

from __future__ import annotations

import argparse
import os
import shutil
import signal
import subprocess
import sys

from python_app.server import run_server


def _load_dotenv(env_path: str) -> None:
    if not os.path.isfile(env_path):
        return
    with open(env_path, "r", encoding="utf-8") as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = val


def _ensure_frontend_built(root_dir: str, force_build: bool) -> bool:
    """Build dist/ via npm run build if forced or missing."""
    dist_index = os.path.join(root_dir, "dist", "index.html")
    if not force_build and os.path.isfile(dist_index):
        return True

    npm_bin = shutil.which("npm")
    if not npm_bin or not os.path.isdir(os.path.join(root_dir, "node_modules")):
        return os.path.isfile(dist_index)

    print("Building Edu Predict frontend bundle (npm run build)...", flush=True)
    result = subprocess.run([npm_bin, "run", "build"], cwd=root_dir)
    if result.returncode != 0:
        print(
            "Warning: frontend build failed; continuing in API-only mode.",
            file=sys.stderr,
            flush=True,
        )
        return os.path.isfile(dist_index)
    return True


def main() -> None:
    root_dir = os.path.dirname(os.path.abspath(__file__))
    _load_dotenv(os.path.join(root_dir, ".env"))

    parser = argparse.ArgumentParser(description="Edu Predict Python Main Server")
    parser.add_argument(
        "--host",
        default=os.environ.get("PYTHON_HOST", "0.0.0.0"),
        help="Host interface to bind",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.environ.get("PYTHON_PORT") or os.environ.get("PORT") or 3000),
        help="Port to listen on",
    )
    parser.add_argument(
        "--db",
        default=os.environ.get("EDUPREDICT_DB_PATH") or os.environ.get("LEARNINGMATE_DB_PATH"),
        help="SQLite database path",
    )
    parser.add_argument(
        "--build",
        action="store_true",
        help="Force rebuilding frontend assets into dist/ before starting server",
    )
    parser.add_argument(
        "--no-build",
        action="store_true",
        help="Skip auto-building frontend assets even if dist/ is absent",
    )
    args = parser.parse_args()

    dist_dir = os.path.join(root_dir, "dist")
    is_api_subprocess = args.port == 5050 and args.host == "127.0.0.1"
    if not args.no_build and not is_api_subprocess:
        _ensure_frontend_built(root_dir, force_build=args.build)

    server = run_server(
        host=args.host,
        port=args.port,
        db_path=args.db,
        static_dir=dist_dir if os.path.isdir(dist_dir) else None,
    )

    def _shutdown(_signum, _frame):
        server.server_close()
        sys.exit(0)

    signal.signal(signal.SIGTERM, _shutdown)
    signal.signal(signal.SIGINT, _shutdown)

    print(
        f"Edu Predict Python Main Server listening on http://{args.host}:{args.port}",
        flush=True,
    )
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
