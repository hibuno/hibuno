"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage" }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to subscribe");
      }
      setStatus("success");
      setMessage("You are subscribed! Check your inbox weekly.");
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setMessage(errorMessage);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-md items-center gap-2"
    >
      <Input
        type="email"
        required
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1"
        aria-label="Email address"
      />
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Subscribing…" : "Subscribe"}
      </Button>
      {message ? (
        <p
          className={`text-sm ${
            status === "success"
              ? "text-green-600"
              : status === "error"
                ? "text-red-600"
                : "text-muted-foreground"
          }`}
          role={status === "error" ? "alert" : undefined}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
