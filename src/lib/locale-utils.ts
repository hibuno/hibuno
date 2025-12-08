import { type Locale, defaultLocale } from "@/i18n/config";

export async function detectCountry(): Promise<string | null> {
  try {
    const response = await fetch("https://api.country.is/", {
      cache: "no-store",
    });
    if (response.ok) {
      const data = await response.json();
      return data.country || null;
    }
  } catch (error) {
    console.error("Failed to detect country:", error);
  }
  return null;
}

export function getLocaleFromCountry(country: string | null): Locale {
  if (country === "ID") {
    return "id";
  }
  return defaultLocale;
}

export function setLocaleCookie(locale: Locale) {
  if (typeof document !== "undefined") {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  }
}

export function getLocaleCookie(): Locale | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "NEXT_LOCALE") {
      return value as Locale;
    }
  }
  return null;
}
