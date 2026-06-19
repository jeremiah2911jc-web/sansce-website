import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { hashLicenseKey, normalizeLicenseKey } from "../api/_license.js";

const licenseKeyPepper = process.env.LICENSE_KEY_PEPPER ?? "";

if (!licenseKeyPepper) {
  console.error("Missing LICENSE_KEY_PEPPER. Set it in the current shell before generating license SQL.");
  process.exit(1);
}

const rl = createInterface({ input, output });

try {
  const licenseKey = await promptRequired("License key");
  const customerName = await promptOptional("Customer name");
  const customerEmail = await promptOptional("Customer email");
  const companyName = await promptOptional("Company name");
  const plan = await promptOptional("Plan", "test");
  const maxDevicesInput = await promptOptional("Max devices", "1");
  const expiresAt = await promptOptional("Expires at", "");

  const maxDevices = Number.parseInt(maxDevicesInput, 10);
  if (!Number.isInteger(maxDevices) || maxDevices < 1) {
    throw new Error("Max devices must be a positive integer.");
  }

  if (expiresAt && Number.isNaN(new Date(expiresAt).getTime())) {
    throw new Error("Expires at must be empty or a valid ISO timestamp.");
  }

  const normalizedLicenseKey = normalizeLicenseKey(licenseKey);
  if (!normalizedLicenseKey) {
    throw new Error("License key is required.");
  }

  const licenseKeyHash = hashLicenseKey(normalizedLicenseKey, {
    licenseKeyPepper,
    supabaseUrl: "",
    serviceRoleKey: "",
    tokenSecret: "",
  });

  console.log("");
  console.log("Paste this SQL into Supabase SQL Editor. Do not store the plain license key in the database or repository.");
  console.log("");
  console.log(buildInsertSql({
    licenseKeyHash,
    customerName,
    customerEmail,
    companyName,
    plan,
    expiresAt,
    maxDevices,
  }));
  console.log("");
  console.log("Do not share screenshots or logs that contain the plain license key, token, or secret values.");
} finally {
  rl.close();
}

async function promptRequired(label) {
  const value = (await rl.question(`${label}: `)).trim();
  if (!value) {
    throw new Error(`${label} is required.`);
  }
  return value;
}

async function promptOptional(label, defaultValue = "") {
  const suffix = defaultValue ? ` (${defaultValue})` : "";
  const value = (await rl.question(`${label}${suffix}: `)).trim();
  return value || defaultValue;
}

function buildInsertSql({
  licenseKeyHash,
  customerName,
  customerEmail,
  companyName,
  plan,
  expiresAt,
  maxDevices,
}) {
  return [
    "insert into public.licenses (",
    "  license_key_hash,",
    "  customer_name,",
    "  customer_email,",
    "  company_name,",
    "  plan,",
    "  status,",
    "  expires_at,",
    "  max_devices,",
    "  enabled_features,",
    "  notes",
    ") values (",
    `  ${sqlString(licenseKeyHash)},`,
    `  ${sqlNullableString(customerName)},`,
    `  ${sqlNullableString(customerEmail)},`,
    `  ${sqlNullableString(companyName)},`,
    `  ${sqlString(plan)},`,
    "  'active',",
    `  ${expiresAt ? sqlString(expiresAt) : "null"},`,
    `  ${maxDevices},`,
    "  '{}'::jsonb,",
    "  'manual test license'",
    ");",
  ].join("\n");
}

function sqlNullableString(value) {
  return value ? sqlString(value) : "null";
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}
