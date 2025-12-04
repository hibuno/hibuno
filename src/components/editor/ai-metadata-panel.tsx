"use client";

import { Check, Copy, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { generateMetadata, generateContent } from "@/lib/ai-service";

interface AIMetadataPanelProps {
  content: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  onApplyTitle?: (title: string) => void;
  onApplySlug?: (slug: string) => void;
  onApplyExcerpt?: (excerpt: string) => void;
  onApplyTags?: (tags: string[]) => void;
}

export default function AIMetadataPanel({
  content,
  title,
  slug,
  excerpt,
  tags,
  onApplyTitle,
  onApplySlug,
  onApplyExcerpt,
  onApplyTags,
}: AIMetadataPanelProps) {
  const [loading, setLoading] = useState(false);
  const [loadingField, setLoadingField] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{
    title?: string;
    slug?: string;
    excerpt?: string;
    tags?: string[];
    suggestedTitles?: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Local state for manual editing
  const [localTitle, setLocalTitle] = useState(title);
  const [localSlug, setLocalSlug] = useState(slug);
  const [localExcerpt, setLocalExcerpt] = useState(excerpt);
  const [localTags, setLocalTags] = useState(tags.join(", "));

  // Sync with parent props
  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  useEffect(() => {
    setLocalSlug(slug);
  }, [slug]);

  useEffect(() => {
    setLocalExcerpt(excerpt);
  }, [excerpt]);

  useEffect(() => {
    setLocalTags(tags.join(", "));
  }, [tags]);

  const generateAll = async () => {
    if (!content || content.length < 50) {
      setError("Please add more content before generating metadata");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await generateMetadata(content, title);
      setSuggestions(result);

      // Auto-apply all generated values
      if (result.title && onApplyTitle) {
        onApplyTitle(result.title);
        setLocalTitle(result.title);
      }
      if (result.slug && onApplySlug) {
        onApplySlug(result.slug);
        setLocalSlug(result.slug);
      }
      if (result.excerpt && onApplyExcerpt) {
        onApplyExcerpt(result.excerpt);
        setLocalExcerpt(result.excerpt);
      }
      if (result.tags && onApplyTags) {
        onApplyTags(result.tags);
        setLocalTags(result.tags.join(", "));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate metadata"
      );
    } finally {
      setLoading(false);
    }
  };

  const generateField = async (
    field: "title" | "excerpt" | "tags" | "slug"
  ) => {
    if (!content || content.length < 50) {
      setError("Please add more content first");
      return;
    }

    setLoadingField(field);
    setError(null);

    try {
      const options: Parameters<typeof generateContent>[0] = {
        type: field,
        content: content.substring(0, 3000),
      };
      if (title) {
        options.context = `Title: ${title}`;
      }
      const response = await generateContent(options);

      let result = response.result;

      if (field === "title") {
        try {
          const parsed = JSON.parse(result);
          if (Array.isArray(parsed)) {
            const newTitle = parsed[0];
            setSuggestions((prev) => ({
              ...prev,
              suggestedTitles: parsed,
              title: newTitle,
            }));
            onApplyTitle?.(newTitle);
            setLocalTitle(newTitle);
          }
        } catch {
          setSuggestions((prev) => ({ ...prev, title: result }));
          onApplyTitle?.(result);
          setLocalTitle(result);
        }
      } else if (field === "tags") {
        try {
          const parsed = JSON.parse(result);
          if (Array.isArray(parsed)) {
            setSuggestions((prev) => ({ ...prev, tags: parsed }));
            onApplyTags?.(parsed);
            setLocalTags(parsed.join(", "));
          }
        } catch {
          // Handle non-JSON response
        }
      } else if (field === "slug") {
        setSuggestions((prev) => ({ ...prev, slug: result }));
        onApplySlug?.(result);
        setLocalSlug(result);
      } else if (field === "excerpt") {
        setSuggestions((prev) => ({ ...prev, excerpt: result }));
        onApplyExcerpt?.(result);
        setLocalExcerpt(result);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to generate ${field}`
      );
    } finally {
      setLoadingField(null);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Handle manual input changes with debounced apply
  const handleTitleChange = (value: string) => {
    setLocalTitle(value);
    onApplyTitle?.(value);
  };

  const handleSlugChange = (value: string) => {
    setLocalSlug(value);
    onApplySlug?.(value);
  };

  const handleExcerptChange = (value: string) => {
    setLocalExcerpt(value);
    onApplyExcerpt?.(value);
  };

  const handleTagsChange = (value: string) => {
    setLocalTags(value);
    const tagsArray = value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onApplyTags?.(tagsArray);
  };

  return (
    <div className="space-y-3">
      {/* Generate All Button */}
      <button
        onClick={generateAll}
        disabled={loading}
        className="w-full px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-md hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-3 h-3" />
            Generate All Metadata
          </>
        )}
      </button>

      {error && (
        <div className="px-2 py-1.5 text-xs text-red-600 bg-red-50 rounded">
          {error}
        </div>
      )}

      {/* Title Field */}
      <FieldWithAI
        label="Title"
        value={localTitle}
        onChange={handleTitleChange}
        placeholder="Post title"
        loading={loadingField === "title"}
        onGenerate={() => generateField("title")}
        onCopy={() => copyToClipboard(localTitle, "title")}
        copied={copiedField === "title"}
        alternatives={suggestions?.suggestedTitles}
        onSelectAlternative={(value) => {
          setLocalTitle(value);
          onApplyTitle?.(value);
        }}
      />

      {/* Slug Field */}
      <FieldWithAI
        label="Slug"
        value={localSlug}
        onChange={handleSlugChange}
        placeholder="url-slug"
        loading={loadingField === "slug"}
        onGenerate={() => generateField("slug")}
        onCopy={() => copyToClipboard(localSlug, "slug")}
        copied={copiedField === "slug"}
        mono
      />

      {/* Excerpt Field */}
      <FieldWithAI
        label="Excerpt"
        value={localExcerpt}
        onChange={handleExcerptChange}
        placeholder="Brief description..."
        loading={loadingField === "excerpt"}
        onGenerate={() => generateField("excerpt")}
        onCopy={() => copyToClipboard(localExcerpt, "excerpt")}
        copied={copiedField === "excerpt"}
        multiline
        maxLength={160}
      />

      {/* Tags Field */}
      <FieldWithAI
        label="Tags"
        value={localTags}
        onChange={handleTagsChange}
        placeholder="tag1, tag2, tag3"
        loading={loadingField === "tags"}
        onGenerate={() => generateField("tags")}
        onCopy={() => copyToClipboard(localTags, "tags")}
        copied={copiedField === "tags"}
      />
    </div>
  );
}

interface FieldWithAIProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading: boolean;
  onGenerate: () => void;
  onCopy: () => void;
  copied: boolean;
  mono?: boolean;
  multiline?: boolean;
  maxLength?: number;
  alternatives?: string[] | undefined;
  onSelectAlternative?: (value: string) => void;
}

function FieldWithAI({
  label,
  value,
  onChange,
  placeholder,
  loading,
  onGenerate,
  onCopy,
  copied,
  mono,
  multiline,
  maxLength,
  alternatives,
  onSelectAlternative,
}: FieldWithAIProps) {
  const [selectedAlt, setSelectedAlt] = useState(0);

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-2 py-1.5 bg-muted/50">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
          {label}
        </label>
        <div className="flex items-center gap-1">
          <button
            onClick={onCopy}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Copy"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={onGenerate}
            disabled={loading}
            className="p-1 hover:bg-muted rounded transition-colors"
            title={`Generate ${label} with AI`}
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
            ) : (
              <RefreshCw className="w-3 h-3 text-muted-foreground hover:text-amber-500" />
            )}
          </button>
        </div>
      </div>

      <div className="p-2">
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="w-full px-2 py-1.5 text-sm border border-input rounded-md bg-transparent resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-2 py-1.5 text-sm border border-input rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-ring ${
              mono ? "font-mono" : ""
            }`}
          />
        )}

        {maxLength && (
          <span className="text-[10px] text-muted-foreground mt-1 block">
            {value.length}/{maxLength}
          </span>
        )}

        {alternatives && alternatives.length > 1 && (
          <div className="flex gap-1 mt-2">
            <span className="text-[10px] text-muted-foreground mr-1">Alt:</span>
            {alternatives.map((alt, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedAlt(i);
                  onSelectAlternative?.(alt);
                }}
                className={`px-1.5 py-0.5 text-[10px] rounded ${
                  i === selectedAlt
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                title={alt}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
