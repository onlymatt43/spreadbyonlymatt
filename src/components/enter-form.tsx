"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Intent = "owner" | "action";

export function EnterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loadingIntent, setLoadingIntent] = useState<Intent | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    email: string;
    intent: Intent;
    token: string;
  } | null>(null);

  async function submit(intent: Intent) {
    setError("");
    setResult(null);
    setLoadingIntent(intent);

    try {
      const response = await fetch("/api/enter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, intent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to continue.");
      }

      setResult(data);

      if (intent === "owner") {
        router.push(`/owner/onboarding?email=${encodeURIComponent(data.email)}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to continue.");
    } finally {
      setLoadingIntent(null);
    }
  }

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-full border border-[var(--line)] bg-transparent px-5 py-4 outline-none transition focus:border-[var(--accent)]"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => submit("owner")}
          disabled={loadingIntent !== null}
          className="rounded-full bg-[var(--ink)] px-5 py-4 text-sm font-medium text-[var(--canvas)] transition hover:bg-[var(--accent)] hover:text-[var(--ink-strong)] disabled:opacity-60"
        >
          {loadingIntent === "owner" ? "Opening..." : "I want a Node"}
        </button>
        <button
          type="button"
          onClick={() => submit("action")}
          disabled={loadingIntent !== null}
          className="rounded-full border border-[var(--line)] px-5 py-4 text-sm font-medium transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-60"
        >
          {loadingIntent === "action" ? "Continuing..." : "I want to act"}
        </button>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {result?.intent === "action" ? (
        <div className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--chip)] p-4 text-sm">
          Action flow created for <strong>{result.email}</strong>. For now, the token is
          generated server-side and ready for the next email magic-link step.
        </div>
      ) : null}
    </form>
  );
}
