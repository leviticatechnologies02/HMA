export function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function today(): string {
  return toISODate(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return toISODate(d);
}

export function diffDays(from: string, to: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / msPerDay);
}

export function diffMonths(from: string, to: string): number {
  const a = new Date(from);
  const b = new Date(to);
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}
