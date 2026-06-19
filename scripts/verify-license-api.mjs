import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const projectRoot = new URL("..", import.meta.url).pathname;

const paths = {
  migration: join(projectRoot, "supabase/migrations/20260619_license_schema.sql"),
  helper: join(projectRoot, "api/_license.js"),
  activate: join(projectRoot, "api/license/activate.js"),
  verify: join(projectRoot, "api/license/verify.js"),
  deactivate: join(projectRoot, "api/license/deactivate-device.js"),
  generateTestLicenseSql: join(projectRoot, "scripts/generate-test-license-sql.mjs"),
  envExample: join(projectRoot, ".env.example"),
  docs: join(projectRoot, "docs/LICENSE_API_SETUP.md"),
  packageJson: join(projectRoot, "package.json"),
};

function read(path) {
  assert.ok(existsSync(path), `${path} must exist`);
  return readFileSync(path, "utf8");
}

function assertIncludes(source, text, label) {
  assert.ok(source.includes(text), `${label} must include ${text}`);
}

const migration = read(paths.migration);
const helper = read(paths.helper);
const activate = read(paths.activate);
const verify = read(paths.verify);
const deactivate = read(paths.deactivate);
const generateTestLicenseSql = read(paths.generateTestLicenseSql);
const envExample = read(paths.envExample);
const docs = read(paths.docs);
const packageJson = JSON.parse(read(paths.packageJson));
const desktopDownloadPassword = ["command", "0924"].join("");

for (const table of ["licenses", "license_devices", "license_events"]) {
  assertIncludes(migration, `create table if not exists public.${table}`, "license migration");
}

for (const index of [
  "licenses_license_key_hash_idx",
  "licenses_status_idx",
  "license_devices_device_fingerprint_hash_idx",
  "license_events_created_at_idx",
]) {
  assertIncludes(migration, index, "license migration indexes");
}

assertIncludes(migration, "create extension if not exists pgcrypto", "license migration");
assertIncludes(migration, "alter table public.licenses enable row level security", "license migration RLS");
assertIncludes(migration, "license_key_hash text not null unique", "license key hash");
assertIncludes(migration, "device_fingerprint_hash text not null", "device fingerprint hash");
assert.ok(!migration.includes(desktopDownloadPassword), "migration must not contain desktop download password");

for (const envName of [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "LICENSE_TOKEN_SECRET",
  "LICENSE_KEY_PEPPER",
]) {
  assertIncludes(helper, `process.env.${envName}`, "license helper env reads");
  assertIncludes(envExample, `${envName}=`, ".env.example");
  assert.ok(!new RegExp(`${envName}=.+`).test(envExample), `.env.example must not contain a real value for ${envName}`);
}

for (const helperName of [
  "hashLicenseKey",
  "hashDeviceFingerprint",
  "signLicenseToken",
  "verifyLicenseToken",
  "normalizeLicenseKey",
  "nowIso",
  "jsonResponse",
  "readJsonBody",
]) {
  assertIncludes(helper, `function ${helperName}`, "license helper");
}

for (const source of [activate, verify, deactivate]) {
  assertIncludes(source, "request.method !== \"POST\"", "license API method guard");
  assertIncludes(source, "isLicenseServiceConfigured", "license API env guard");
  assert.ok(!source.includes("licenseToken: \"") && !source.includes("ok: true, status: \"online_authorized\", licenseToken: \"server"), "API must not hard-code success authorization");
}

assertIncludes(activate, ".from(\"licenses\")", "activate route");
assertIncludes(activate, ".from(\"license_devices\")", "activate route");
assertIncludes(activate, "device_limit_exceeded", "activate route");
assertIncludes(activate, "hashLicenseKey", "activate route");
assertIncludes(activate, "hashDeviceFingerprint", "activate route");
assertIncludes(verify, "verifyLicenseToken", "verify route");
assertIncludes(verify, "hashDeviceFingerprint", "verify route");
assertIncludes(deactivate, "deactivate_device", "deactivate route");

assertIncludes(docs, "Phase 2", "license API setup docs");
assertIncludes(docs, "Phase 3", "license API setup docs");
assertIncludes(docs, "App 不可持有 service role key", "license API setup docs");
assertIncludes(docs, "不保存明文授權碼", "license API setup docs");
assertIncludes(docs, "npm run license:generate-test-sql", "license API setup docs");
assertIncludes(docs, "不要把明文授權碼", "license API setup docs");

assert.equal(packageJson.scripts["verify:license-api"], "node scripts/verify-license-api.mjs");
assert.equal(packageJson.scripts["license:generate-test-sql"], "node scripts/generate-test-license-sql.mjs");

assertIncludes(generateTestLicenseSql, "process.env.LICENSE_KEY_PEPPER", "test license SQL generator");
assertIncludes(generateTestLicenseSql, "hashLicenseKey", "test license SQL generator");
assertIncludes(generateTestLicenseSql, "normalizeLicenseKey", "test license SQL generator");
assertIncludes(generateTestLicenseSql, "insert into public.licenses", "test license SQL generator");
assertIncludes(generateTestLicenseSql, "Supabase SQL Editor", "test license SQL generator");
assert.ok(!generateTestLicenseSql.includes("createClient("), "test license generator must not connect to Supabase");
assert.ok(!generateTestLicenseSql.includes(".from(\"licenses\")"), "test license generator must not write to Supabase");
assert.ok(!generateTestLicenseSql.includes("writeFile"), "test license generator must not write SQL to disk");
assert.ok(!generateTestLicenseSql.includes(desktopDownloadPassword), "test license generator must not contain desktop download password");
assert.ok(!/LICENSE_KEY_PEPPER=.[A-Za-z0-9]/.test(generateTestLicenseSql), "test license generator must not contain a hard-coded pepper");
assert.ok(!/LICENSE_TOKEN_SECRET=.[A-Za-z0-9]/.test(generateTestLicenseSql), "test license generator must not contain a hard-coded token secret");

const frontendSource = [
  read(join(projectRoot, "src/App.jsx")),
  existsSync(join(projectRoot, "public/downloads/sanze-app-release.json"))
    ? read(join(projectRoot, "public/downloads/sanze-app-release.json"))
    : "",
].join("\n");
assert.ok(!frontendSource.includes("SUPABASE_SERVICE_ROLE_KEY"), "frontend source must not mention service role key");
assert.ok(!frontendSource.includes("LICENSE_TOKEN_SECRET"), "frontend source must not mention token secret");
assert.ok(!frontendSource.includes("LICENSE_KEY_PEPPER"), "frontend source must not mention license pepper");

const repoSource = [
  migration,
  helper,
  activate,
  verify,
  deactivate,
  generateTestLicenseSql,
  envExample,
  docs,
].join("\n");
assert.ok(!repoSource.includes(desktopDownloadPassword), "license API sources must not contain desktop download password");

console.log("License API source verification passed.");
