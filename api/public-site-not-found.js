const NOT_FOUND_BODY = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404</title>
  </head>
  <body>
    <main>
      <h1>404</h1>
      <p>Not Found</p>
    </main>
  </body>
</html>`;

export const PUBLIC_SITE_NOT_FOUND_HEADERS = Object.freeze({
  "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
  "Content-Type": "text/html; charset=utf-8",
  Expires: "0",
  Pragma: "no-cache",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
});

export default function publicSiteNotFound(request, response) {
  response.statusCode = 404;

  for (const [key, value] of Object.entries(PUBLIC_SITE_NOT_FOUND_HEADERS)) {
    response.setHeader(key, value);
  }

  response.end(request.method === "HEAD" ? "" : NOT_FOUND_BODY);
}
