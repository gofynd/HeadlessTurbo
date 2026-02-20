// handler.js
const { readFileSync, existsSync } = require("fs");
const { join, extname, resolve } = require("path");

// MIME types for different file extensions
const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

// Get MIME type based on file extension
function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase();
  return mimeTypes[ext] || "application/octet-stream";
}

// Define the handler function
const handler = async (event, res) => {
  try {
    const url = event.url || event.path || "/";
    const distPath = resolve(join(__dirname, "dist"));

    // Remove query string and hash
    let pathname = url.split("?")[0].split("#")[0];

    // Remove leading slash for path resolution
    const cleanPath = pathname === "/" ? "index.html" : pathname.slice(1);

    // Security: prevent directory traversal
    if (cleanPath.includes("..")) {
      res.statusCode = 403;
      res.setHeader("Content-Type", "text/plain");
      res.end("Forbidden");
      return;
    }

    let filePath = resolve(distPath, cleanPath);

    // Security: ensure the resolved path is still within distPath
    if (!filePath.startsWith(distPath)) {
      res.statusCode = 403;
      res.setHeader("Content-Type", "text/plain");
      res.end("Forbidden");
      return;
    }

    // For SPA routing: if file doesn't exist and it's not a static asset, serve index.html
    const isStaticAsset =
      /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|otf|json)$/i.test(
        cleanPath,
      );

    // Check if file exists
    if (existsSync(filePath)) {
      try {
        // Read the requested file
        const fileContent = readFileSync(filePath);
        const mimeType = getMimeType(filePath);

        res.statusCode = 200;
        res.setHeader("Content-Type", mimeType);
        // Cache static assets, but not HTML
        if (isStaticAsset) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else {
          res.setHeader("Cache-Control", "no-cache");
        }
        res.end(fileContent);
        return;
      } catch (readError) {
        console.error("Error reading file:", readError);
        res.statusCode = 500;
        res.setHeader("Content-Type", "text/plain");
        res.end("Internal Server Error");
        return;
      }
    }

    // File doesn't exist
    if (!isStaticAsset) {
      // For SPA routing: serve index.html for non-static assets
      const indexPath = resolve(distPath, "index.html");
      if (existsSync(indexPath)) {
        try {
          const htmlContent = readFileSync(indexPath, "utf-8");
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html");
          res.setHeader("Cache-Control", "no-cache");
          res.end(htmlContent);
          return;
        } catch (htmlError) {
          console.error("Error reading index.html:", htmlError);
        }
      }
    }

    // Static asset not found or index.html missing
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("Not Found");
  } catch (error) {
    // Handle errors
    console.error("Handler error:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end("Internal Server Error");
  }
};

module.exports = { handler };
