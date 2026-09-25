import { Company, Valuation, companies, districts, SNAPSHOT } from "./data";
export const money = (b: number) =>
  b >= 1000
    ? `$${(b / 1000).toFixed(2)}T`
    : b < 1
      ? `$${Number((b * 1000).toFixed(1))}M`
      : `$${Number(b.toFixed(1))}B`;
export function scaleFor(value: number) {
  const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
  return {
    height: 2 + Math.pow(safe, 0.68) * 1.55,
    width: 4 + Math.pow(safe, 0.22) * 1.4,
  };
}
// End of the chosen month, including rounds announced on the 29th–31st.
export function dateAt(year: number) {
  const whole = Math.floor(year);
  const month = Math.min(11, Math.floor((year - whole) * 12 + 0.00001));
  return new Date(Date.UTC(whole, month + 1, 0)).toISOString().slice(0, 10);
}
export function recordAt(
  company: Company,
  date: string,
): Valuation | undefined {
  return company.history
    .filter((v) => v.date <= date && v.date <= SNAPSHOT)
    .sort((a, b) => a.date.localeCompare(b.date))
    .at(-1);
}
export function stateAt(company: Company, date: string) {
  if (Number(date.slice(0, 4)) < company.founded) return "absent";
  return recordAt(company, date) ? "built" : "construction";
}
export function disclosedFunding(company: Company, date: string) {
  const records = company.history.filter(
    (v) => v.date <= date && v.date <= SNAPSHOT && v.raised !== undefined,
  );
  return records.length
    ? records.reduce((total, v) => total + (v.raised ?? 0), 0)
    : null;
}
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
export function positionFor(company: Company): [number, number, number] {
  const peers = companies.filter((c) => c.category === company.category);
  const i = peers.findIndex((c) => c.id === company.id);
  const [x, z] = districts[company.category].center;
  return [x + ((i % 3) - 1) * 16, 0, z + Math.floor(i / 3) * 17];
}
export const overview = {
  position: [175, 145, 200] as [number, number, number],
  target: [0, 24, 9] as [number, number, number],
};
