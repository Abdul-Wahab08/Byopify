
interface FormatOrderWhenOptions {
  dateStyle?: "full" | "long" | "medium" | "short";
}

export function formatPrice(cents: number, currency: string | undefined) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: (currency ?? "usd").toUpperCase(),
  }).format(cents / 100);
}

export function formatOrderWhen(iso: Date | null, opts: FormatOrderWhenOptions = {}) {
  const { dateStyle = "medium" } = opts;
  if (!iso) return "";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle,
    timeStyle: "short",
  }).format(date);
}
