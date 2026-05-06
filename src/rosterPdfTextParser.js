const BANK_TRUSTEE_NAME = "板信商業銀行股份有限公司";
const PING_PER_SQM_DIVISOR = 3.305785;

class RosterPdfParserError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "RosterPdfParserError";
    this.code = code;
    this.details = details;
  }
}

function normalizeFullWidth(value = "") {
  return String(value)
    .replace(/[０-９]/g, (char) => String(char.charCodeAt(0) - 0xff10))
    .replace(/[Ａ-Ｚａ-ｚ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/[，]/g, ",")
    .replace(/[．]/g, ".")
    .replace(/[－–—]/g, "-")
    .replace(/[／]/g, "/")
    .replace(/[　]/g, " ");
}

function normalizeText(value = "") {
  return normalizeFullWidth(value)
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function compactText(value = "") {
  return normalizeFullWidth(value).replace(/\s+/g, "");
}

function cleanField(value = "") {
  return normalizeFullWidth(value)
    .replace(/[＊*]+/g, "")
    .replace(/（空白）/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function parseNumber(value) {
  const parsed = Number(cleanField(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function roundNumber(value, digits = 6) {
  if (!Number.isFinite(value)) {
    return "";
  }

  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function extractKnownCity(text) {
  const compact = compactText(text);
  const cityPattern = /(新北市|臺北市|台北市|桃園市|臺中市|台中市|臺南市|台南市|高雄市|基隆市|新竹市|嘉義市|新竹縣|苗栗縣|彰化縣|南投縣|雲林縣|嘉義縣|屏東縣|宜蘭縣|花蓮縣|臺東縣|台東縣|澎湖縣|金門縣|連江縣)/;
  return compact.match(new RegExp(`資料管轄機關：${cityPattern.source}`))?.[1]
    || compact.match(cityPattern)?.[1]
    || "";
}

function extractLocation(text) {
  const compact = compactText(text);
  const match = compact.match(/([\u4e00-\u9fa5]{2,}(?:區|市|鎮|鄉))([\u4e00-\u9fa5]+?段)([\u4e00-\u9fa5]+?小段)?(\d{3,4}-\d{4})地號/);

  if (!match) {
    return null;
  }

  return {
    city: extractKnownCity(text),
    district: match[1],
    section: match[2],
    subsection: match[3] || "",
    lotNumber: match[4].padStart(9, "0"),
  };
}

function extractTranscriptMeta(text) {
  const compact = compactText(text);
  return {
    transcriptCode: cleanField(compact.match(/謄本種類碼：([A-Z0-9]+)/)?.[1] || ""),
    printTime: cleanField(compact.match(/列印時間：(民國\d+年\d+月\d+日\d+時\d+分)/)?.[1] || ""),
    landOffice: cleanField(compact.match(/資料管轄機關：([^謄]+?地政事務所)/)?.[1] || ""),
  };
}

function extractParcelFields(text) {
  const compact = compactText(text);
  const announcedMatch = compact.match(/民國(\d+)年(\d+)月公告土地現值：\**([\d,.]+)元/);
  const registrationMatch = compact.match(/土地標示部.*?登記日期：(民國\d+年\d+月\d+日)登記原因：([^面使民地其]+?)(?=面積|使用分區|民國|地上建物|其他登記事項|土地所有權部)/);

  return {
    landAreaSqm: parseNumber(compact.match(/面積：\**([\d,.]+)平方公尺/)?.[1]),
    announcedCurrentValue: parseNumber(announcedMatch?.[3]),
    announcedCurrentValueYear: announcedMatch ? `民國${announcedMatch[1]}年${announcedMatch[2]}月` : "",
    zoning: cleanField(compact.match(/使用分區：(.+?)使用地類別：/)?.[1] || ""),
    landUseCategory: cleanField(compact.match(/使用地類別：(.+?)(?=民國|地上建物|其他登記事項|土地所有權部)/)?.[1] || ""),
    buildingNumber: cleanField(compact.match(/地上建物建號：(.+?)(?=其他登記事項|土地所有權部)/)?.[1] || ""),
    registrationDate: cleanField(registrationMatch?.[1] || ""),
    registrationReason: cleanField(registrationMatch?.[2] || ""),
  };
}

function parseShare(blockText) {
  const match = blockText.match(/權利範圍：(?:全部)?\**(\d+)分之(\d+)/);
  if (!match) {
    return { shareNumerator: "", shareDenominator: "", shareRatio: null, shareText: "" };
  }

  const shareDenominator = Number(match[1]);
  const shareNumerator = Number(match[2]);
  const shareRatio = shareDenominator > 0 ? shareNumerator / shareDenominator : null;
  return {
    shareNumerator: String(shareNumerator),
    shareDenominator: String(shareDenominator),
    shareRatio,
    shareText: `${shareDenominator}分之${shareNumerator}`,
  };
}

function parseDeclaredLandValue(blockText) {
  const match = blockText.match(/當期申報地價：(\d+)年(\d+)月\**([\d,.]+)元/);
  return {
    declaredLandValueYear: match ? `民國${match[1]}年${match[2]}月` : "",
    declaredLandValue: parseNumber(match?.[3]),
  };
}

function parseOwnerBlocks(compactOwnerSection, lotContext, importedAt, issues) {
  const rows = [];
  const blockRegex = /（\d{4}）登記次序：(\d{4})([\s\S]*?)(?=（\d{4}）登記次序：\d{4}|土地他項權利部|本謄本列印完畢|$)/g;
  let match;

  while ((match = blockRegex.exec(compactOwnerSection)) !== null) {
    const block = match[2] || "";
    const registrationMatch = block.match(/登記日期：(民國\d+年\d+月\d+日)登記原因：(.+?)(?=原因發生日期|所有權人|$)/);
    const registeredOwnerName = cleanField(block.match(/所有權人：(.+?)(?=統一編號|住址|權利範圍|$)/)?.[1] || "");
    const registeredOwnerId = cleanField(block.match(/統一編號：([A-Z0-9]+)/)?.[1] || "");
    const rawTrustorName = block.match(/委託人：(.+?)(?=信託財產|信託內容|（\d{4}）登記次序|土地他項權利部|歷次取得權利範圍|相關他項權利登記次序|其他登記事項|本謄本|$)/)?.[1] || "";
    const trustorName = cleanField(rawTrustorName);
    const isTrust = registrationMatch?.[2]?.includes("信託")
      || block.includes("信託財產")
      || (registeredOwnerName === BANK_TRUSTEE_NAME && Boolean(trustorName));
    const ownerName = isTrust && trustorName ? trustorName : registeredOwnerName;
    const share = parseShare(block);
    const declared = parseDeclaredLandValue(block);
    const shareAreaSqm = Number.isFinite(share.shareRatio) && Number.isFinite(lotContext.landAreaSqm)
      ? lotContext.landAreaSqm * share.shareRatio
      : null;
    const titleNumber = cleanField(block.match(/權狀字號：(.+?號)/)?.[1] || "");

    if (!ownerName || !share.shareNumerator || !share.shareDenominator) {
      issues.push({
        id: `pdf-owner-review-${lotContext.lotNumber}-${match[1]}`,
        type: "PDF 權利列解析不足",
        severity: "高",
        message: `地號 ${lotContext.lotNumber} 登記次序 ${match[1]} 未能完整辨識 ownerName 或權利範圍，請改用 v7 清冊或人工確認。`,
        rows: [],
      });
      continue;
    }

    if (trustorName === "葉明熾") {
      issues.push({
        id: `pdf-name-review-${lotContext.lotNumber}-${match[1]}`,
        type: "名稱人工確認",
        severity: "中",
        message: "150 地號委託人解析為「葉明熾」，請依謄本人工確認是否正確。",
        rows: [],
      });
    }

    rows.push({
      city: lotContext.city,
      district: lotContext.district,
      section: lotContext.section,
      subsection: lotContext.subsection,
      lotNumber: lotContext.lotNumber,
      landNumber: lotContext.lotNumber,
      ownerName,
      registeredOwnerName,
      registeredOwnerId,
      trusteeName: isTrust ? registeredOwnerName : "",
      trustorName,
      ownershipType: isTrust ? "信託" : cleanField(registrationMatch?.[2] || ""),
      landAreaSqm: roundNumber(lotContext.landAreaSqm),
      landAreaPing: roundNumber(lotContext.landAreaSqm / PING_PER_SQM_DIVISOR),
      shareNumerator: share.shareNumerator,
      shareDenominator: share.shareDenominator,
      shareRatio: roundNumber(share.shareRatio, 10),
      shareAreaSqm: roundNumber(shareAreaSqm),
      shareAreaPing: roundNumber(shareAreaSqm / PING_PER_SQM_DIVISOR),
      calculatedShareRatio: roundNumber(share.shareRatio, 10),
      calculatedShareAreaSqm: roundNumber(shareAreaSqm),
      calculatedShareAreaPing: roundNumber(shareAreaSqm / PING_PER_SQM_DIVISOR),
      shareText: share.shareText,
      announcedCurrentValue: lotContext.announcedCurrentValue || "",
      announcedCurrentValueYear: lotContext.announcedCurrentValueYear,
      declaredLandValue: declared.declaredLandValue || "",
      declaredLandValueYear: declared.declaredLandValueYear,
      registrationOrder: match[1],
      registrationDate: cleanField(registrationMatch?.[1] || ""),
      registrationReason: cleanField(registrationMatch?.[2] || ""),
      causeDate: cleanField(block.match(/原因發生日期：(民國\d+年\d+月\d+日)/)?.[1] || ""),
      titleNumber,
      sourceType: "readable-pdf",
      sourceFilename: lotContext.sourceFilename,
      sourcePage: String(lotContext.sourcePage || ""),
      importedAt,
      updatedAt: importedAt,
      rowStatus: "draft",
      notes: isTrust
        ? `登記名義人為${registeredOwnerName}，信託財產。`
        : "依可讀電子謄本解析。",
      validationStatus: "PDF 文字層解析草稿，需人工確認",
    });
  }

  return rows;
}

function parseMortgageBlocks(compactMortgageSection, lotContext) {
  const rows = [];
  const blockRegex = /（\d{4}）登記次序：([0-9-]+)([\s\S]*?)(?=（\d{4}）登記次序：[0-9-]+|本謄本列印完畢|$)/g;
  let match;

  while ((match = blockRegex.exec(compactMortgageSection)) !== null) {
    const block = match[2] || "";
    rows.push({
      lotNumber: lotContext.lotNumber,
      mortgageOrder: match[1],
      rightType: cleanField(block.match(/權利種類：(.+?)(?=收件|登記日期|權利人|$)/)?.[1] || ""),
      creditorName: cleanField(block.match(/權利人：(.+?)(?=統一編號|住址|債權額比例|擔保債權總金額|$)/)?.[1] || ""),
      securedAmount: parseNumber(block.match(/擔保債權總金額：新臺幣\**([\d,.]+)元正/)?.[1]),
      subjectRegistrationOrders: cleanField(block.match(/標的登記次序：(.+?)(?=設定權利範圍|證明書字號|共同擔保地號|$)/)?.[1] || ""),
      mortgageShareText: cleanField(block.match(/設定權利範圍：(.+?)(?=證明書字號|共同擔保地號|其他登記事項|$)/)?.[1] || ""),
      certificateNumber: cleanField(block.match(/證明書字號：(.+?號)/)?.[1] || ""),
      sourceFilename: lotContext.sourceFilename,
      sourcePage: String(lotContext.sourcePage || ""),
    });
  }

  return rows.filter((row) => row.mortgageOrder || row.rightType || row.creditorName);
}

function splitOwnerAndMortgageSections(lotText) {
  const compact = compactText(lotText);
  const ownerStart = compact.indexOf("土地所有權部");
  const mortgageStart = compact.indexOf("土地他項權利部");

  return {
    ownerSection: ownerStart >= 0
      ? compact.slice(ownerStart, mortgageStart >= 0 ? mortgageStart : compact.length)
      : "",
    mortgageSection: mortgageStart >= 0 ? compact.slice(mortgageStart) : "",
  };
}

function groupPagesByLot(pages, sourceFilename) {
  const groups = [];
  let currentGroup = null;

  pages.forEach((page) => {
    const location = extractLocation(page.text);
    if (location) {
      const locationKey = [
        location.city,
        location.district,
        location.section,
        location.subsection,
        location.lotNumber,
      ].join("|");
      const currentKey = currentGroup
        ? [
          currentGroup.city,
          currentGroup.district,
          currentGroup.section,
          currentGroup.subsection,
          currentGroup.lotNumber,
        ].join("|")
        : "";

      if (!currentGroup || currentKey !== locationKey) {
        currentGroup = {
          ...location,
          sourceFilename,
          sourcePage: page.pageNumber,
          pages: [],
        };
        groups.push(currentGroup);
      }
    }

    if (currentGroup) {
      currentGroup.pages.push(page);
    }
  });

  return groups;
}

export function parseLandRegisterTextPages(pages, sourceFilename, importedAt = new Date().toLocaleString("zh-TW", { hour12: false })) {
  const normalizedPages = pages.map((page) => ({
    ...page,
    text: normalizeText(page.text || ""),
  }));
  const textCharCount = normalizedPages.reduce((total, page) => total + page.text.length, 0);

  if (textCharCount < 40) {
    throw new RosterPdfParserError(
      "NO_TEXT_LAYER",
      "此 PDF 為掃描影像或無文字層，正式站暫不支援自動建立清冊。請改用三策 v7 清冊模板填寫後上傳。",
      { textCharCount },
    );
  }

  const groups = groupPagesByLot(normalizedPages, sourceFilename);
  const landRights = [];
  const mortgages = [];
  const issues = [];
  const parcels = [];

  groups.forEach((group) => {
    const lotText = group.pages.map((page) => page.text).join("\n");
    const meta = extractTranscriptMeta(lotText);
    const parcel = {
      ...group,
      ...meta,
      ...extractParcelFields(lotText),
      pages: undefined,
    };
    parcels.push(parcel);

    const sections = splitOwnerAndMortgageSections(lotText);
    landRights.push(...parseOwnerBlocks(sections.ownerSection, parcel, importedAt, issues));
    mortgages.push(...parseMortgageBlocks(sections.mortgageSection, parcel));
  });

  if (!landRights.length) {
    throw new RosterPdfParserError(
      "NO_ROSTER_ROWS",
      "已讀取 PDF 文字層，但未能辨識足夠清冊欄位。請改用三策 v7 清冊模板。",
      { textCharCount, lotCount: groups.length },
    );
  }

  return {
    sourceFilename,
    importedAt,
    textCharCount,
    pageCount: normalizedPages.length,
    parcels,
    landRights,
    buildingRights: [],
    mortgages,
    issues,
  };
}

export { RosterPdfParserError };
