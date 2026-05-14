import assert from "node:assert/strict";

import {
  buildAssessedCurrentValueSummaryFromLandRows,
  buildLotIdentityKey,
  buildUniqueLandRows,
} from "../src/landIdentity.js";
import {
  INTERNAL_DECIMAL_DIGITS,
  parseRatio,
  roundForStorage,
} from "../src/evaluationPrecision.js";

function applyMockLandValueUpdate(rows, update) {
  const updateKey = buildLotIdentityKey(update);

  return rows.map((row) => (
    buildLotIdentityKey(row) === updateKey
      ? { ...row, announcedCurrentValue: update.announcedCurrentValue }
      : row
  ));
}

function calculateShareArea(areaSqm, numerator, denominator) {
  const ratio = parseRatio(numerator, denominator);
  return Number.isFinite(areaSqm) && Number.isFinite(ratio)
    ? roundForStorage(areaSqm * ratio, INTERNAL_DECIMAL_DIGITS)
    : null;
}

const sameLotDifferentScopes = [
  {
    city: "台北市",
    district: "中正區",
    section: "忠孝段",
    subsection: "一小段",
    lotNumber: "123",
    landNumber: "123",
    landAreaSqm: 100,
    announcedCurrentValue: "1000",
  },
  {
    city: "台北市",
    district: "大安區",
    section: "忠孝段",
    subsection: "一小段",
    lotNumber: "123",
    landNumber: "123",
    landAreaSqm: 200,
    announcedCurrentValue: "2000",
  },
];

const uniqueDifferentScopes = buildUniqueLandRows(sameLotDifferentScopes);
assert.equal(uniqueDifferentScopes.length, 2, "same lot number in different scopes must not collapse");

const differentScopeSummary = buildAssessedCurrentValueSummaryFromLandRows(sameLotDifferentScopes);
assert.equal(differentScopeSummary.assessedCurrentValueByLot.length, 2);
assert.equal(differentScopeSummary.assessedCurrentValueTotal, 500000);
assert.equal(differentScopeSummary.assessedCurrentValueWeightedUnit, roundForStorage(500000 / 300, INTERNAL_DECIMAL_DIGITS));

const updatedDifferentScopes = applyMockLandValueUpdate(sameLotDifferentScopes, {
  city: "台北市",
  district: "大安區",
  section: "忠孝段",
  subsection: "一小段",
  lotNumber: "123",
  announcedCurrentValue: "2500",
});
assert.equal(updatedDifferentScopes[0].announcedCurrentValue, "1000", "value update must not touch another scope");
assert.equal(updatedDifferentScopes[1].announcedCurrentValue, "2500", "value update must touch the exact scope");

const sameLandMultipleRights = [
  {
    city: "新北市",
    district: "板橋區",
    section: "文化段",
    subsection: "",
    lotNumber: "88",
    landNumber: "88",
    landAreaSqm: 300,
    announcedCurrentValue: "3000",
    ownerName: "甲",
    shareNumerator: "1",
    shareDenominator: "2",
  },
  {
    city: "新北市",
    district: "板橋區",
    section: "文化段",
    subsection: "",
    lotNumber: "88",
    landNumber: "88",
    landAreaSqm: 300,
    announcedCurrentValue: "3000",
    ownerName: "乙",
    shareNumerator: "1",
    shareDenominator: "2",
  },
];

const uniqueSameLand = buildUniqueLandRows(sameLandMultipleRights);
assert.equal(uniqueSameLand.length, 1, "multiple rights on the same land must count the land once");

const sameLandSummary = buildAssessedCurrentValueSummaryFromLandRows(sameLandMultipleRights);
assert.equal(sameLandSummary.assessedCurrentValueByLot.length, 1);
assert.equal(sameLandSummary.assessedCurrentValueTotal, 900000);
assert.equal(calculateShareArea(300, "1", "2"), 150);

const roundTripRows = JSON.parse(JSON.stringify(sameLotDifferentScopes));
assert.equal(buildUniqueLandRows(roundTripRows).length, 2, "JSON roundtrip must rebuild full identity keys");

console.log("land identity key verification passed");
