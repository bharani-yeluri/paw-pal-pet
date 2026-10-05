const http = require("http")
const fs = require("fs")
const path = require("path")

const PORT = process.env.PORT || 3000
const ROOT = __dirname

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    ...headers,
  })
  res.end(body)
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0])
  if (urlPath === "/") urlPath = "/index.html"

  // Allow extensionless routes to map to .html
  let filePath = path.join(ROOT, urlPath)
  if (!path.extname(filePath)) filePath += ".html"

  // Prevent path traversal
  if (!filePath.startsWith(ROOT)) {
    return send(res, 403, "Forbidden")
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      const notFound = path.join(ROOT, "404.html")
      return fs.readFile(notFound, (e2, data404) => {
        if (e2) return send(res, 404, "Not Found")
        send(res, 404, data404, { "Content-Type": MIME[".html"] })
      })
    }
    const ext = path.extname(filePath).toLowerCase()
    send(res, 200, data, { "Content-Type": MIME[ext] || "application/octet-stream" })
  })
})

server.listen(PORT, () => {
  console.log(`[v0] PawPal static server running on http://localhost:${PORT}`)
})
