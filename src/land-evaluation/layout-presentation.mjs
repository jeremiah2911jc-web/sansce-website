// Presentation only. The shared calculation and canAdopt gate remain authoritative.
export function layoutPresentation(input, assessment, result) {
  const houses = input.groups.flatMap(g => g.houses);
  const selected = input.groups.flatMap(g => g.parcelIds);
  const prerequisites = result.errors.filter(text =>
    (assessment.intendedUse === 'unknown' && text.startsWith('本工具適用一般住宅透天')) ||
    (!selected.length && text.includes('土地範圍未選定或地號已移除')) ||
    (!houses.length && text.includes('須配置1棟住宅'))
  );
  const violations = result.errors.filter(text => !prerequisites.includes(text));
  const showAreas = houses.length > 0 && selected.length > 0 && input.groups.every(g=>Number(g.baseArea)>0 && Number(g.width)>0 && Number(g.depth)>0 && g.houses.every(h=>h.floors.length>0 && h.floors.every(f=>Number(f.area)>0))); 
  return {
    status: violations.length ? result.status : prerequisites.length || result.pending.length ? '資料待補，尚未完成配置檢核' : result.status,
    showAreas, violations,
    prerequisites: [...(assessment.intendedUse === 'unknown' ? ['請先選定預定用途。'] : []), ...(!selected.length ? ['請選定本方案的土地範圍。'] : []), ...(!houses.length ? ['請新增住宅棟別並填寫逐層配置。'] : []), ...(!showAreas && houses.length ? ['請補齊建築基地、配置範圍及各層樓板面積，再查看面積結果。'] : [])]
  };
}
