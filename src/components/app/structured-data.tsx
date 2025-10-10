import { memo, useMemo } from "react";

interface StructuredDataProps {
  data: Record<string, unknown>;
}

export const StructuredData = memo(({ data }: StructuredDataProps) => {
  // Memoize the JSON string to prevent unnecessary re-serialization
  const jsonString = useMemo(() => {
    try {
      return JSON.stringify(data, null, 0);
    } catch (error) {
      console.error("Failed to serialize structured data:", error);
      return "{}";
    }
  }, [data]);

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe
      dangerouslySetInnerHTML={{
        __html: jsonString,
      }}
    />
  );
});

StructuredData.displayName = "StructuredData";
