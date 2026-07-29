import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import publicSiteNotFound, {
  PUBLIC_SITE_NOT_FOUND_HEADERS,
} from "../api/public-site-not-found.js";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(projectRoot, relativePath), "utf8");
const config = JSON.parse(read("vercel.json"));

const SERVICE_ALLOWLIST = Object.freeze([
  "/api/desktop-download",
  "/api/license/activate",
  "/api/license/deactivate-device",
  "/api/license/verify",
  "/api/sanze-db-env-check",
  "/api/sanze-db-load-cases",
  "/api/sanze-db-sync-case",
  "/api/sanze-system-login",
  "/api/sanze-system-logout",
  "/api/sanze-system-session",
  "/downloads/Sanze-App-macOS-Test-0.1.1-arm64.zip",
  "/downloads/Sanze-App-Windows-Test-0.1.1-x64-setup.exe",
  "/downloads/sanze-app-release.json",
  "/update/macos-test-latest.json",
  "/update/windows-test-latest.json",
]);

const BLOCKED_PATHS = Object.freeze([
  "/",
  "/downloads",
  "/downloads/",
  "/about",
  "/services/feasibility-analysis",
  "/missing-path-404-check",
  "/sitemap.xml",
  "/favicon.ico",
  "/site.webmanifest",
  "/logo.png",
  "/images/hero-community-renewal.jpg",
  "/assets/index-example.js",
  "/sanze-roster-template-v7-protected.xlsx",
  "/api/_license",
  "/api/license/status",
  "/api/unknown",
]);

const ROUTE_FILES = Object.freeze({
  "/api/desktop-download": "api/desktop-download.js",
  "/api/license/activate": "api/license/activate.js",
  "/api/license/deactivate-device": "api/license/deactivate-device.js",
  "/api/license/verify": "api/license/verify.js",
  "/api/sanze-db-env-check": "api/sanze-db-env-check.js",
  "/api/sanze-db-load-cases": "api/sanze-db-load-cases.js",
  "/api/sanze-db-sync-case": "api/sanze-db-sync-case.js",
  "/api/sanze-system-login": "api/sanze-system-login.js",
  "/api/sanze-system-logout": "api/sanze-system-logout.js",
  "/api/sanze-system-session": "api/sanze-system-session.js",
  "/downloads/Sanze-App-macOS-Test-0.1.1-arm64.zip":
    "public/downloads/Sanze-App-macOS-Test-0.1.1-arm64.zip",
  "/downloads/Sanze-App-Windows-Test-0.1.1-x64-setup.exe":
    "public/downloads/Sanze-App-Windows-Test-0.1.1-x64-setup.exe",
  "/downloads/sanze-app-release.json":
    "public/downloads/sanze-app-release.json",
  "/update/macos-test-latest.json": "public/update/macos-test-latest.json",
  "/update/windows-test-latest.json": "public/update/windows-test-latest.json",
});

function pathMatchesRoute(pathname, route) {
  return new RegExp(`^(?:${route.src})$`).test(pathname);
}

function resolveRoute(pathname) {
  return config.routes.find(
    (route) => !route.continue && pathMatchesRoute(pathname, route),
  );
}

function invokeNotFound(method) {
  const headers = new Map();
  let body = null;
  const response = {
    statusCode: 200,
    setHeader(key, value) {
      headers.set(key.toLowerCase(), value);
    },
    end(value) {
      body = value;
    },
  };

  publicSiteNotFound({ method }, response);
  return { body, headers, statusCode: response.statusCode };
}

assert.equal(
  config.$schema,
  "https://openapi.vercel.sh/vercel.json",
  "vercel.json must use Vercel's official schema",
);
assert.ok(Array.isArray(config.routes) && config.routes.length > 0);
assert.equal(
  config.rewrites,
  undefined,
  "the public /downloads SPA rewrites must be removed",
);
assert.equal(
  config.headers,
  undefined,
  "headers must be applied inside legacy routes so Vercel does not bypass them",
);

const continuingSecurityHeaders = config.routes[0];
assert.equal(continuingSecurityHeaders.src, "/(.*)");
assert.equal(continuingSecurityHeaders.continue, true);
assert.deepEqual(continuingSecurityHeaders.headers, {
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://sansce-website.vercel.app; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
});

const catchAll = config.routes.at(-1);
assert.deepEqual(catchAll, {
  src: "/(.*)",
  dest: "/api/public-site-not-found",
});

for (const pathname of SERVICE_ALLOWLIST) {
  const route = resolveRoute(pathname);
  assert.ok(route, `${pathname} must have an explicit allowlist route`);
  assert.notEqual(
    route,
    catchAll,
    `${pathname} must resolve before the public-site catch-all`,
  );
  assert.equal(route.src, pathname.replaceAll(".", "\\."));
  assert.equal(route.dest, pathname);
  assert.ok(existsSync(join(projectRoot, ROUTE_FILES[pathname])));
}

const internalNotFoundRoute = resolveRoute("/api/public-site-not-found");
assert.ok(internalNotFoundRoute);
assert.equal(internalNotFoundRoute.dest, "/api/public-site-not-found");

for (const pathname of BLOCKED_PATHS) {
  assert.equal(
    resolveRoute(pathname),
    catchAll,
    `${pathname} must resolve to the true-404 handler`,
  );
}

for (const forbiddenRoute of ["/api/(.*)", "/downloads/(.*)", "/update/(.*)"]) {
  assert.equal(
    config.routes.some((route) => route.src === forbiddenRoute),
    false,
    `${forbiddenRoute} is too broad for the service allowlist`,
  );
}

const getResult = invokeNotFound("GET");
assert.equal(getResult.statusCode, 404);
assert.equal(
  getResult.headers.get("cache-control"),
  "no-store, no-cache, max-age=0, must-revalidate",
);
assert.equal(
  getResult.headers.get("x-robots-tag"),
  "noindex, nofollow, noarchive",
);
assert.equal(getResult.headers.get("content-type"), "text/html; charset=utf-8");
assert.equal(getResult.headers.get("pragma"), "no-cache");
assert.equal(getResult.headers.get("expires"), "0");
assert.match(getResult.body, /<h1>404<\/h1>/);
assert.match(getResult.body, /<p>Not Found<\/p>/);

for (const forbidden of [
  "三策",
  "Sanze",
  "sansce",
  "logo",
  "維護",
  "maintenance",
  "暫停服務",
  "聯絡",
  "<script",
  "<link",
  "<img",
]) {
  assert.equal(
    getResult.body.toLowerCase().includes(forbidden.toLowerCase()),
    false,
    `404 body must not include ${forbidden}`,
  );
}

const headResult = invokeNotFound("HEAD");
assert.equal(headResult.statusCode, 404);
assert.equal(headResult.body, "");
assert.deepEqual(
  Object.fromEntries(headResult.headers),
  Object.fromEntries(
    Object.entries(PUBLIC_SITE_NOT_FOUND_HEADERS).map(([key, value]) => [
      key.toLowerCase(),
      value,
    ]),
  ),
);

const robotsText = read("public/robots.txt");
assert.equal(
  robotsText,
  "User-agent: *\nDisallow: /api/\nDisallow: /update/\nDisallow: /downloads/\n",
);
const robotsDisallowRules = robotsText
  .split("\n")
  .filter((line) => line.startsWith("Disallow: "))
  .map((line) => line.slice("Disallow: ".length));
const isDisallowedForCrawler = (pathname) =>
  robotsDisallowRules.some((rule) => pathname.startsWith(rule));
for (const pathname of ["/", "/about", "/downloads", "/sitemap.xml"]) {
  assert.equal(
    isDisallowedForCrawler(pathname),
    false,
    `${pathname} must remain crawlable so crawlers can observe the temporary 404`,
  );
}
for (const pathname of [
  "/api/license/verify",
  "/update/macos-test-latest.json",
  "/downloads/Sanze-App-macOS-Test-0.1.1-arm64.zip",
]) {
  assert.equal(
    isDisallowedForCrawler(pathname),
    true,
    `${pathname} must remain excluded from crawler access`,
  );
}
const robotsRoute = resolveRoute("/robots.txt");
assert.ok(robotsRoute);
assert.notEqual(robotsRoute, catchAll);
assert.equal(robotsRoute.dest, "/robots.txt");
assert.deepEqual(robotsRoute.headers, {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
});

const packageJson = JSON.parse(read("package.json"));
assert.equal(
  packageJson.dependencies?.["@vercel/functions"],
  undefined,
  "the source-level 404 must not require Vercel middleware dependencies",
);
assert.equal(
  packageJson.scripts["verify:site-visibility"],
  "node scripts/verify-site-visibility.mjs",
);

for (const [manifestPath, installerPath] of [
  [
    "public/update/macos-test-latest.json",
    "/downloads/Sanze-App-macOS-Test-0.1.1-arm64.zip",
  ],
  [
    "public/update/windows-test-latest.json",
    "/downloads/Sanze-App-Windows-Test-0.1.1-x64-setup.exe",
  ],
]) {
  const manifest = JSON.parse(read(manifestPath));
  const expectedUrl = `https://sansce-website.vercel.app${installerPath}`;
  assert.equal(manifest.downloadPageUrl, expectedUrl);
  assert.equal(manifest.downloadUrl, expectedUrl);
  assert.notEqual(
    resolveRoute(installerPath),
    catchAll,
    `${manifestPath} must point to an allowlisted installer`,
  );
}

console.log(
  `PASS verify-site-visibility (${SERVICE_ALLOWLIST.length} service paths preserved)`,
);
