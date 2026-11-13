import { createServer } from "node:http";
import { stat, readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const defaultPublicDir = fileURLToPath(new URL("./dist/public/", import.meta.url));
const publicDir = resolve(process.env.STATIC_DIR ?? defaultPublicDir);
const port = Number(process.env.PORT ?? "5000");

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

const server = createServer(async (request, response) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(
      new URL(request.url ?? "/", "http://localhost").pathname,
    );
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }

  if (pathname === "/healthz") {
    const health = JSON.stringify({ status: "ok" });
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Length": Buffer.byteLength(health),
      "Content-Type": "application/json; charset=utf-8",
    });
    response.end(request.method === "HEAD" ? undefined : health);
    return;
  }

  let filePath = resolve(publicDir, `.${pathname}`);
  if (filePath !== publicDir && !filePath.startsWith(`${publicDir}${sep}`)) {
    response.writeHead(404).end("Not found");
    return;
  }

  let fileInfo;
  try {
    fileInfo = await stat(filePath);
    if (fileInfo.isDirectory()) {
      filePath = resolve(filePath, "index.html");
      fileInfo = await stat(filePath);
    }
  } catch {
    if (extname(pathname)) {
      response.writeHead(404).end("Not found");
      return;
    }
    filePath = resolve(publicDir, "index.html");
    try {
      fileInfo = await stat(filePath);
    } catch {
      response.writeHead(503).end("Application files are not built");
      return;
    }
  }

  if (!fileInfo.isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }

  const body = await readFile(filePath);
  response.writeHead(200, {
    "Cache-Control":
      extname(filePath) === ".html"
        ? "no-cache"
        : "public, max-age=31536000, immutable",
    "Content-Length": body.length,
    "Content-Type":
      contentTypes.get(extname(filePath)) ?? "application/octet-stream",
  });
  response.end(request.method === "HEAD" ? undefined : body);
});

server.listen(port, "0.0.0.0", () => {
  process.stdout.write(`OAuth URL Generator listening on 0.0.0.0:${port}\n`);
});
