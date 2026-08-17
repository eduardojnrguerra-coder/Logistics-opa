import { publicConfig } from "@/lib/config.client";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(publicConfig.NEXT_PUBLIC_LOCALE, {
    style: "currency",
    currency: publicConfig.NEXT_PUBLIC_CURRENCY_CODE,
  }).format(value);
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(publicConfig.NEXT_PUBLIC_LOCALE, {
    dateStyle: "medium",
  }).format(date);
}
