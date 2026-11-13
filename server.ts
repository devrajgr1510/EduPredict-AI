import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { spawn, ChildProcess, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getCliArgValue(name: string): string | undefined {
  const rawArgs = process.argv.slice(2);
  for (let i = 0; i < rawArgs.length; i += 1) {
    const arg = rawArgs[i];
    if (arg === name && i + 1 < rawArgs.length) return rawArgs[i + 1];
    if (arg.startsWith(`${name}=`)) return arg.slice(name.length + 1);
    if (arg === `-${name.slice(2)}` && i + 1 < rawArgs.length) return rawArgs[i + 1];
  }
  return undefined;
}

function resolvePythonCommand(): string {
  const configuredCommand = process.env.PYTHON || process.env.PYTHON_COMMAND;
  if (configuredCommand && configuredCommand.trim()) {
    return configuredCommand.trim().split(/\s+/)[0];
  }

  for (const candidate of ['python3', 'python', 'py']) {
    const result = spawnSync(candidate, ['--version'], { stdio: 'ignore' });
    if (result.status === 0 || result.error == null) {
      return candidate;
    }
  }

  return 'python3';
}

const PORT = (() => {
  const cliPort = Number.parseInt(getCliArgValue('--port') || getCliArgValue('-p') || '', 10);
  if (Number.isFinite(cliPort) && cliPort > 0) {
    return cliPort;
  }
  const envPort = Number.parseInt(process.env.PORT || '', 10);
  return Number.isFinite(envPort) && envPort > 0 ? envPort : 3000;
})();
const PYTHON_HOST = '127.0.0.1';
const PYTHON_PORT = parseInt(process.env.PYTHON_PORT || '5050', 10);

let pythonProc: ChildProcess | null = null;

function startPythonMainBackend(): ChildProcess {
  const pythonCommand = resolvePythonCommand();
  const proc = spawn(pythonCommand, ['app.py', '--host', PYTHON_HOST, '--port', String(PYTHON_PORT)], {
    cwd: __dirname,
    env: {
      ...process.env,
      PYTHONUNBUFFERED: '1'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  proc.stdout?.on('data', (chunk: Buffer) => {
    process.stdout.write(`[python] ${chunk.toString()}`);
  });

  proc.stderr?.on('data', (chunk: Buffer) => {
    process.stderr.write(`[python] ${chunk.toString()}`);
  });

  proc.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) {
      console.error(`[python] exited unexpectedly with code=${code} signal=${signal}`);
    }
  });

  return proc;
}

async function waitForPythonReady(timeoutMs = 10000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const ok = await new Promise<boolean>((resolve) => {
        const req = http.get(`http://${PYTHON_HOST}:${PYTHON_PORT}/api/health`, (res) => {
          res.resume();
          resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(1000, () => {
          req.destroy();
          resolve(false);
        });
      });
      if (ok) return;
    } catch {
      // retry until timeout
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error('Timed out waiting for Python main backend to become healthy');
}

function proxyToPython(req: Request, res: Response) {
  const targetPath = req.originalUrl;
  const options: http.RequestOptions = {
    hostname: PYTHON_HOST,
    port: PYTHON_PORT,
    path: targetPath,
    method: req.method,
    headers: {
      ...req.headers,
      host: `${PYTHON_HOST}:${PYTHON_PORT}`
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode || 500);
    for (const [key, value] of Object.entries(proxyRes.headers)) {
      if (value !== undefined && key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    }
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('[proxy-error]', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Python backend unavailable', details: err.message });
    }
  });

  req.pipe(proxyReq);
}

async function startServer() {
  pythonProc = startPythonMainBackend();
  await waitForPythonReady();

  const app = express();

  // Forward all /api requests directly to the Python main backend
  app.use('/api', (req: Request, res: Response) => {
    proxyToPython(req, res);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Edu Predict Frontend Gateway + Python Main Backend listening on http://0.0.0.0:${PORT}`);
  });

  const cleanup = () => {
    server.close();
    if (pythonProc && !pythonProc.killed) {
      pythonProc.kill('SIGTERM');
    }
    process.exit(0);
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  if (pythonProc && !pythonProc.killed) {
    pythonProc.kill('SIGTERM');
  }
  process.exit(1);
});
