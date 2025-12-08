"use client";

import { useEffect } from "react";
import {
  detectCountry,
  getLocaleFromCountry,
  setLocaleCookie,
  getLocaleCookie,
} from "@/lib/locale-utils";

export function LocaleDetector() {
  useEffect(() => {
    const initLocale = async () => {
      // Check if locale is already set
      const existingLocale = getLocaleCookie();
      if (existingLocale) {
        return; // User has already chosen a locale
      }

      // Detect country and set locale
      const country = await detectCountry();
      const locale = getLocaleFromCountry(country);
      setLocaleCookie(locale);

      // Reload to apply the locale
      window.location.reload();
    };

    initLocale();
  }, []);

  return null;
}
