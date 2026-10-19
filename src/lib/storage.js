// Storage layer. Everything is async so it can later be replaced by fetch("/api/estimates")
// (Supabase / Vercel Blob / KV) without touching the UI code.
const KEY = "estimates.v1";
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const write = (list) => localStorage.setItem(KEY, JSON.stringify(list));

export async function listEstimates() {
  return read().sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}
export async function saveEstimate(est) {
  const list = read();
  const saved = { ...est, updatedAt: new Date().toISOString() };
  const i = list.findIndex((x) => x.id === est.id);
  if (i >= 0) list[i] = saved; else list.push(saved);
  write(list);
  return saved;
}
export async function deleteEstimate(id) {
  write(read().filter((x) => x.id !== id));
}
