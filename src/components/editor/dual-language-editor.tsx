"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RichTextEditor from "./rich-text-editor";
import { useTranslations } from "next-intl";
import type { LocalizedContent } from "@/db/types";

interface DualLanguageEditorProps {
  contentGroupId: string;
  initialContent: {
    en?: LocalizedContent;
    id?: LocalizedContent;
  };
  onChange: (locale: "en" | "id", content: LocalizedContent) => void;
}

export default function DualLanguageEditor({
  contentGroupId,
  initialContent,
  onChange,
}: DualLanguageEditorProps) {
  const t = useTranslations("editor");
  const [activeTab, setActiveTab] = useState<"en" | "id">("en");

  const [enContent, setEnContent] = useState<LocalizedContent>(
    initialContent.en || { title: "", excerpt: "", content: "" }
  );
  const [idContent, setIdContent] = useState<LocalizedContent>(
    initialContent.id || { title: "", excerpt: "", content: "" }
  );

  // Update parent when content changes
  useEffect(() => {
    if (activeTab === "en") {
      onChange("en", enContent);
    } else {
      onChange("id", idContent);
    }
  }, [enContent, idContent, activeTab, onChange]);

  const handleEnContentChange = (html: string) => {
    setEnContent((prev) => ({ ...prev, content: html }));
  };

  const handleIdContentChange = (html: string) => {
    setIdContent((prev) => ({ ...prev, content: html }));
  };

  return (
    <div className="w-full">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "en" | "id")}
      >
        <div className="border-b border-border bg-muted/30 px-4">
          <TabsList className="h-12">
            <TabsTrigger value="en" className="gap-2">
              <span className="text-xs font-mono">EN</span>
              <span>{t("english")}</span>
            </TabsTrigger>
            <TabsTrigger value="id" className="gap-2">
              <span className="text-xs font-mono">ID</span>
              <span>{t("indonesian")}</span>
            </TabsTrigger>
          </TabsList>
          <div className="text-xs text-muted-foreground py-2">
            Content Group ID:{" "}
            <code className="bg-muted px-1 py-0.5 rounded">
              {contentGroupId}
            </code>
          </div>
        </div>

        <TabsContent value="en" className="mt-0">
          <RichTextEditor
            content={enContent.content}
            onChange={handleEnContentChange}
          />
        </TabsContent>

        <TabsContent value="id" className="mt-0">
          <RichTextEditor
            content={idContent.content}
            onChange={handleIdContentChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
