"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initialEmail: string;
};

export function OwnerOnboardingForm({ initialEmail }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [displayName, setDisplayName] = useState("");
  const [mainLink, setMainLink] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/nodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          displayName,
          mainLink,
          shortBio,
          photoUrl,
          videoUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create node.");
      }

      router.push(`/owner/node/${data.node.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create node.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Owner email"
        className="rounded-[1.2rem] border border-[var(--line)] bg-transparent px-5 py-4 outline-none transition focus:border-[var(--accent)]"
      />
      <input
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        placeholder="Display name"
        className="rounded-[1.2rem] border border-[var(--line)] bg-transparent px-5 py-4 outline-none transition focus:border-[var(--accent)]"
      />
      <input
        value={mainLink}
        onChange={(event) => setMainLink(event.target.value)}
        placeholder="Main link"
        className="rounded-[1.2rem] border border-[var(--line)] bg-transparent px-5 py-4 outline-none transition focus:border-[var(--accent)]"
      />
      <textarea
        value={shortBio}
        onChange={(event) => setShortBio(event.target.value)}
        placeholder="Short bio"
        rows={4}
        className="rounded-[1.2rem] border border-[var(--line)] bg-transparent px-5 py-4 outline-none transition focus:border-[var(--accent)]"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          value={photoUrl}
          onChange={(event) => setPhotoUrl(event.target.value)}
          placeholder="Photo URL"
          className="rounded-[1.2rem] border border-[var(--line)] bg-transparent px-5 py-4 outline-none transition focus:border-[var(--accent)]"
        />
        <input
          value={videoUrl}
          onChange={(event) => setVideoUrl(event.target.value)}
          placeholder="Video URL"
          className="rounded-[1.2rem] border border-[var(--line)] bg-transparent px-5 py-4 outline-none transition focus:border-[var(--accent)]"
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-[var(--ink)] px-5 py-4 text-sm font-medium text-[var(--canvas)] transition hover:bg-[var(--accent)] hover:text-[var(--ink-strong)] disabled:opacity-60"
      >
        {loading ? "Creating Node..." : "Create my Node"}
      </button>
    </form>
  );
}
