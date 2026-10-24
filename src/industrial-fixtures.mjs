// src/lib/industrial/development.ts
var constraintKinds = { coverage: "\u5EFA\u853D\uFF0F\u5EFA\u7BC9\u9762\u7A4D", excavation: "\u958B\u6316", height: "\u9AD8\u5EA6", yard: "\u9000\u7E2E\u8207\u9662\u843D", parking: "\u6C7D\u6A5F\u8ECA\u53CA\u81EA\u884C\u8ECA\u505C\u8ECA", loading: "\u88DD\u5378\u4F4D\u8207\u8ECA\u9053", fire: "\u6D88\u9632\u8207\u670D\u52D9\u6838\u5FC3", quota: "\u5DE5\u696D\u4F7F\u7528\u7E3D\u91CF", permission: "\u7528\u9014\u8207\u884C\u696D\u8A31\u53EF" };
var proof = () => ({ source: "", date: "", finding: "", state: "unknown" });
var newDevelopment = () => ({ version: "industrial.layout.v1", operation: "unknown", applicantUse: "unknown", planName: "", planScope: "", planEvidence: proof(), allocations: [], constraints: [] });
var newAllocation = (floorId = "") => ({ id: crypto.randomUUID(), floorId, exempt: "", rent: "", self: "", donated: "", common: "", vacant: "", registered: "", evidence: proof() });
var newConstraint = () => ({ id: crypto.randomUUID(), kind: "coverage", name: "", scope: "", unit: "", actual: "", limit: "", operator: "max", basis: "general", effective: "", expires: "", evidence: proof() });

// src/lib/industrial/model.ts
var INDUSTRIAL_VERSION = "industrial.2026-10-24.v1";
var checks = { plan: "\u571F\u5730\u8EAB\u5206\u3001\u500B\u5225\u90FD\u5E02\u8A08\u756B\u8207\u5EFA\u7BC9\u57FA\u5730\u63A1\u8A08\u7BC4\u570D", use: "\u884C\u696D\u8207\u7528\u9014\u8A31\u53EF\u3001\u7E3D\u91CF\u7BA1\u5236\uFF08\u5340\u57DF\u984D\u5EA6\u8207\u57FA\u5730\u984D\u5EA6\u5206\u958B\uFF09", original: "\u539F\u5408\u6CD5\u5EFA\u7BC9\u5BB9\u7A4D\u7C3D\u8B49\u8207\u63A1\u7528\u8DEF\u5F91", renewal: "\u66F4\u65B0\u8CC7\u683C\u3001\u4E2D\u592E\u53CA\u5730\u65B9\u734E\u52F5\u3001\u5176\u4ED6\u6A5F\u95DC\u5148\u884C\u7533\u8ACB\u8207\u91CD\u8907\u6263\u9664", vertical: "\u7ACB\u9AD4\u5316\u516C\u544A\u7BC4\u570D\u3001\u6295\u8CC7\u3001\u589E\u91CF\u7528\u9014\u3001\u7533\u8ACB\u671F\u9650\u53CA\u56DE\u994B\u7FA9\u52D9", tdr: "\u5BB9\u79FB\u4F86\u6E90\u3001\u63A5\u53D7\u57FA\u5730\u3001\u81E8\u8DEF\u3001\u91CF\u9AD4\u8A55\u5B9A\u8207\u8A31\u53EF", layout: "\u5EFA\u853D\u3001\u9000\u7E2E\u3001\u9AD8\u5EA6\u3001\u6D88\u9632\u3001\u88DD\u5378\u3001\u505C\u8ECA\u3001\u90FD\u8A2D\u8207\u74B0\u8A55", combined: "\u4F75\u7528\u898F\u5B9A\u3001\u5404\u4E0A\u9650\u9069\u7528\u7BC4\u570D\u53CA\u5408\u4F75\u5BE9\u67E5\u6587\u4EF6" };
var conditionFields = { road: "\u9023\u63A5\u9053\u8DEF\u5BEC\u5EA6m", front: "\u540C\u8DEF\u6BB5\u9762\u5BECm", opened: "\u8DB3\u5BEC\u958B\u95E2\u53CA\u9023\u901A\u9053\u8DEF\u5BEC\u5EA6m", slope: "\u662F\u5426\u5C71\u5761\u5730\uFF08\u662F\uFF0F\u5426\uFF09", nonOpen: "\u65B0\u5317\u975E\u4E94\u9805\u958B\u653E\u6027\u516C\u8A2D\u9001\u51FA\u984D\u5EA6\u33A1", iso: "ISO50001\uFF08\u662F\uFF0F\u5426\uFF09", solar: "\u592A\u967D\u80FD\u6C34\u5E73\u6295\u5F71\u5360\u5C4B\u9802\u53EF\u8A2D\u7F6E\u5340\u57DF%", dc: "DC\u5145\u96FB\u5C08\u7528\u8ECA\u4F4D\u5360\u5168\u90E8\u8ECA\u4F4D%", ems: "\u80FD\u6E90\u7BA1\u7406\u7CFB\u7D71\uFF08\u662F\uFF0F\u5426\uFF09", storage: "\u5132\u80FD\u5BB9\u91CFkWh", hq: "\u71DF\u904B\u7E3D\u90E8\u8A8D\u5B9A\u8207\u767B\u8A18\u5730\u5740\u7B26\u5408\uFF08\u662F\uFF0F\u5426\uFF09", taipeiLocation: "\u81FA\u5317\u5BB9\u79FB\u4F4D\u7F6E\u689D\u4EF6\uFF08\u6377\u904B\uFF0F\u516C\u5712\uFF0F\u6B77\u53F2\u5EFA\u7BC9\uFF09", distance: "\u81F3\u6377\u904B\u51FA\u5165\u53E3\u6216\u516C\u5712\u8DDD\u96E2m", parkArea: "\u516C\u5712\u9762\u7A4D\u516C\u9803", secondRoad: "\u7B2C\u4E8C\u689D\u5DF2\u958B\u95E2\u9053\u8DEF\u5BEC\u5EA6m" };
var newEvidence = () => ({ source: "", date: "", finding: "", state: "unknown" });
var newParcel = () => ({ id: crypto.randomUUID(), name: "", zone: "", area: "", excluded: "", far: "", tdrRate: "", original: "", originalMode: "unknown", evidence: newEvidence() });
var newAward = () => ({ id: crypto.randomUUID(), name: "", parcelId: "", kind: "unknown", amount: "", deduct: "", evidence: newEvidence() });
var newFloor = () => ({ id: crypto.randomUUID(), building: "", level: "", count: "", area: "", purpose: "unknown", increment: "", incrementBasis: "unknown", evidence: newEvidence() });
var newIndustrial = () => ({ conditions: Object.fromEntries(Object.keys(conditionFields).map((k) => [k, ""])), version: INDUSTRIAL_VERSION, mode: "planning", name: "", edition: "", date: "", city: "unknown", regime: "unknown", route: "unknown", vertical: "unknown", awardMode: "unknown", transferMode: "unknown", originalRoute: "unknown", investment: "", applicationDate: "", combinedCap: "", tdrCap: "", tdrCash: "", declared: "", parcels: [], awards: [], floors: [], reviews: Object.fromEntries(Object.keys(checks).map((k) => [k, newEvidence()])) });

// src/lib/industrial/fixtures.ts
function industrialFixture(kind) {
  const m = newIndustrial(), e = { ...newEvidence(), source: "\u5408\u6210\u6E2C\u8A66\u8CC7\u6599\uFF0C\u975E\u5BE6\u969B\u6848\u4EF6\u6216\u6838\u51C6\u6587\u4EF6", date: "2026-10-24", finding: "\u53EA\u6AA2\u67E5\u7A0B\u5F0F\u5206\u9805\u8A08\u7B97\uFF0C\u4E0D\u80FD\u4F5C\u958B\u767C\u4F9D\u64DA", state: "assumed" };
  Object.assign(m, { name: "\u5408\u6210\u6E2C\u8A66\uFF08\u975E\u5BE6\u6848\uFF09\u2014" + kind, edition: "software-test-v1", date: "2026-10-24", city: "ntpc", regime: "urban", route: "ordinary", vertical: "none", awardMode: "none", transferMode: "none" });
  m.reviews = Object.fromEntries(Object.keys(checks).map((k) => [k, { ...e }]));
  m.parcels = [{ ...newParcel(), id: "fixture-land", name: "\u5408\u6210\u4E59\u7A2E\u5DE5\u696D\u571F\u5730", zone: "\u4E59\u7A2E\u5DE5\u696D\u5340", area: "1000", excluded: "0", far: "200", tdrRate: "30", originalMode: "none", evidence: e }];
  m.floors = [{ ...newFloor(), building: "\u5408\u6210A", level: "1\u20132", count: "2", area: "1000", purpose: "factory", increment: "0", incrementBasis: "18-2-1", evidence: e }];
  if (kind !== "ordinary") {
    Object.assign(m, { route: "renewal", originalRoute: "base", vertical: "ntpc", awardMode: "items", transferMode: "items", investment: "0.6", applicationDate: "2026-10-24", tdrCap: "600", combinedCap: "2940" });
    Object.assign(m.conditions, { road: "8", front: "8", opened: "8", slope: "\u5426", tdrRate: "30", nonOpen: "0", iso: "\u662F", ems: "\u5426", hq: "\u5426", solar: "0", dc: "6", storage: "0" });
    m.awards = [["f1", "300"], ["f2", "40"], ["feedback", "200"], ["tdr", "200"], ["renewal", "200"]].map(([k, a], i) => ({ ...newAward(), id: "fixture-award-" + i, name: "\u5408\u6210 " + k, kind: k, amount: a, deduct: "0", parcelId: "fixture-land", evidence: e }));
    m.floors[0].area = "1470";
    m.floors[0].increment = "540";
  }
  if (kind === "invalid") {
    m.city = "taipei";
    m.awards[1].amount = "100";
  }
  return m;
}
function developmentFixture(operation = "mixed") {
  const m = industrialFixture("ordinary"), e = m.reviews.plan, d = newDevelopment();
  m.name = "\u5408\u6210\u914D\u7F6E\u6E2C\u8A66\uFF08\u975E\u5BE6\u6848\uFF09\u2014" + operation;
  m.floors[0].id = "fixture-floor";
  Object.assign(d, { operation, applicantUse: operation === "self" ? "self" : "nonself", planName: "\u5408\u6210\u8A08\u756B\u689D\u4EF6\uFF0C\u975E\u5BE6\u969B\u90FD\u5E02\u8A08\u756B", planScope: "\u50C5\u6E2C\u8A66\u7BC4\u570D\uFF0C\u4E0D\u53EF\u4F5C\u70BA\u6838\u51C6\u4F9D\u64DA", planEvidence: e });
  d.allocations = [{ ...newAllocation(m.floors[0].id), id: "fixture-allocation", exempt: "200", rent: operation === "self" ? "0" : operation === "mixed" ? "1000" : "1800", self: operation === "rental" ? "0" : operation === "mixed" ? "800" : "1800", donated: "100", common: "200", vacant: "100", registered: "2100", evidence: e }];
  d.constraints = Object.entries(constraintKinds).map(([kind, name], i) => ({ ...newConstraint(), id: "fixture-condition-" + i, kind, name: "\u5408\u6210" + name, scope: "\u5408\u6210A", unit: "\u5408\u6210\u6AA2\u67E5\u55AE\u4F4D", actual: "1", limit: "2", effective: "2026-01-01", evidence: e }));
  m.development = d;
  return m;
}
export {
  developmentFixture,
  industrialFixture
};
