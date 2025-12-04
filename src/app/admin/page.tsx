"use client";

import {
  Calendar,
  Eye,
  FileText,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, MessageDialog } from "@/components/ui/alert-dialog";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published: boolean;
  published_at: string;
  updated_at: string;
  cover_image_url: string | null;
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    slug: string | null;
  }>({
    open: false,
    slug: null,
  });
  const [messageDialog, setMessageDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant?: "default" | "destructive";
  }>({
    open: false,
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/admin/posts");
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (slug: string) => {
    setDeleteDialog({ open: true, slug });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.slug) return;

    try {
      const response = await fetch(`/api/admin/posts/${deleteDialog.slug}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setPosts(posts.filter((p) => p.slug !== deleteDialog.slug));
        setDeleteDialog({ open: false, slug: null });
      } else {
        setDeleteDialog({ open: false, slug: null });
        setMessageDialog({
          open: true,
          title: "Delete Failed",
          description: "Failed to delete the post. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setDeleteDialog({ open: false, slug: null });
      setMessageDialog({
        open: true,
        title: "Error",
        description: "An error occurred while deleting the post.",
        variant: "destructive",
      });
    }
  };

  const filteredPosts = posts
    .filter((post) => {
      if (filter === "published") return post.published;
      if (filter === "draft") return !post.published;
      return true;
    })
    .filter((post) =>
      search ? post.title.toLowerCase().includes(search.toLowerCase()) : true
    );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto border-x bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div>
              <h1 className="text-lg font-semibold font-serif">hibuno</h1>
              <p className="text-xs text-muted-foreground">Content Dashboard</p>
            </div>
            <Button
              onClick={() => (window.location.href = "/editor")}
              size="sm"
              className="text-xs h-8 bg-foreground text-background"
            >
              <Plus className="w-3 h-3 mr-1" /> New Post
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="pl-8 h-9"
            />
          </div>
          <div className="flex gap-1 p-0.5 bg-muted rounded-md">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filter === "all"
                  ? "bg-card shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({posts.length})
            </button>
            <button
              onClick={() => setFilter("published")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filter === "published"
                  ? "bg-card shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Published ({posts.filter((p) => p.published).length})
            </button>
            <button
              onClick={() => setFilter("draft")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filter === "draft"
                  ? "bg-card shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Drafts ({posts.filter((p) => !p.published).length})
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h2 className="text-lg font-medium mb-1">No posts found</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {search
                ? "Try a different search term"
                : "Get started by creating your first post"}
            </p>
            {!search && (
              <Button
                onClick={() => (window.location.href = "/editor")}
                size="sm"
                className="text-xs h-8"
              >
                <Plus className="w-3 h-3 mr-1" /> Create Post
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Cover Image */}
                {post.cover_image_url ? (
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {!post.published && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-amber-500/90 text-white text-[10px] font-medium rounded">
                        Draft
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="relative aspect-[16/9] bg-muted flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                    {!post.published && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-amber-500/90 text-white text-[10px] font-medium rounded">
                        Draft
                      </span>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm line-clamp-2 flex-1">
                      {post.title}
                    </h3>
                    <div className="relative group/menu">
                      <button className="p-1 hover:bg-muted rounded transition-colors">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[120px] opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                        <button
                          onClick={() =>
                            (window.location.href = `/editor/${post.slug}`)
                          }
                          className="w-full px-3 py-1.5 text-left text-xs hover:bg-muted flex items-center gap-2"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => window.open(`/${post.slug}`, "_blank")}
                          className="w-full px-3 py-1.5 text-left text-xs hover:bg-muted flex items-center gap-2"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                        <button
                          onClick={() => handleDeleteClick(post.slug)}
                          className="w-full px-3 py-1.5 text-left text-xs hover:bg-destructive/10 text-destructive flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {post.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(
                        post.published_at || post.updated_at
                      ).toLocaleDateString()}
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded-full font-medium ${
                        post.published
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-border p-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      (window.location.href = `/editor/${post.slug}`)
                    }
                    className="flex-1 text-xs h-7"
                  >
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/${post.slug}`, "_blank")}
                    className="flex-1 text-xs h-7"
                  >
                    <Eye className="w-3 h-3 mr-1" /> View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, slug: null })}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />

      {/* Message Dialog */}
      <MessageDialog
        open={messageDialog.open}
        onOpenChange={(open) => setMessageDialog({ ...messageDialog, open })}
        title={messageDialog.title}
        description={messageDialog.description}
        variant={messageDialog.variant || "default"}
      />
    </div>
  );
}
