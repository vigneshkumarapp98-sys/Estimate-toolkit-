export const uid = () => "est-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
export const num = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
export const sum = (rows, k) => rows.reduce((a, r) => a + num(r[k]), 0);
export const fmt = (n) => num(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function setIn(obj, path, value) {
  if (path.length === 0) return value;
  const [k, ...rest] = path;
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  copy[k] = setIn(obj[k], rest, value);
  return copy;
}

export const blank = {
  mrow: () => ({ desc: "", qty: 0, rate: 0, unit: "Nos" }),
  feature: () => ({ item: "", qty: 0, unit: "Nos" }),
  loadRow: () => ({ feeder: "Feeder -", agriNos: 0, agriHp: 0, indNos: 0, indHp: 0, domNos: 0, domHp: 0, newNos: 0, newHp: 0 }),
  loadSection: () => ({ title: "New load details", rows: [blank.loadRow()] }),
  costLine: () => ({ label: "", gross: 0, net: 0 }),
  conductor: () => ({ conductor: "", constant: 0, distance: 0, loadHp: 0 }),
  feeder: () => ({ name: "Feeder", scNo: "", loadHp: 0, conductors: [blank.conductor()] }),
};

export function newEstimate() {
  const now = new Date().toISOString();
  return {
    id: uid(), title: "New estimate", createdAt: now, updatedAt: now,
    common: { applicantName: "", address: "", scNo: "", load: "", estimateCost: 0 },
    letter: { from: "", to: "", lrNo: "", subject: "", ref: "", body: "", enclosure: "Estimate - 2 Set", signatory: "Assistant Engineer" },
    report: { scope: "", pointOfSupply: "", mainFeatures: [], loadDetails: [blank.loadSection()], regulationPercent: 0, estimateCostLines: [blank.costLine()], consumerPaid: 0 },
    regulation: { feeders: [blank.feeder()] },
    materials: { dismantled: [], reusable: [], structure: [], scrap: [], bookValue: { lifeYears: 0, servedYears: 0, depreciationRate: 0 } },
    poles: { columns: ["AAAC 7/3.15 mm", "AAAC 7/2.50 mm", "RSJ Pole", "PSC Pole 9.0 Mtr", "PSC Pole 8.0 Mtr", "PSC Pole 7.5 Mtr", "Base plate", "Tapping X arm"], rows: [{ loc: "", span: 0 }] },
  };
}
