export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function parseMainLink(input: string) {
  try {
    const url = new URL(input);
    const hostname = url.hostname.replace(/^www\./, "");
    const firstSegment = url.pathname.split("/").filter(Boolean)[0] || "";

    return {
      platform: hostname.split(".")[0] || null,
      username: firstSegment || null,
    };
  } catch {
    return {
      platform: null,
      username: null,
    };
  }
}

export function parseSpreadLink(input: string) {
  const raw = input.trim();

  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProtocol);
    const hostname = url.hostname.replace(/^www\./, "");
    const platform = hostname.split(".")[0]?.toLowerCase() || "link";
    const firstSegment = url.pathname.split("/").filter(Boolean)[0] || "";

    const platformMeta: Record<string, { icon: string; label: string }> = {
      x: { icon: "X", label: "X" },
      twitter: { icon: "X", label: "X" },
      instagram: { icon: "IG", label: "Instagram" },
      tiktok: { icon: "TT", label: "TikTok" },
      youtube: { icon: "YT", label: "YouTube" },
      github: { icon: "GH", label: "GitHub" },
      patreon: { icon: "P", label: "Patreon" },
      onlyfans: { icon: "OF", label: "OnlyFans" },
    };

    const meta = platformMeta[platform] || { icon: "•", label: hostname };
    const display =
      firstSegment && firstSegment !== platform ? `@${firstSegment}` : meta.label;

    return {
      isLink: true,
      href: url.toString(),
      icon: meta.icon,
      display,
    };
  } catch {
    return {
      isLink: false,
      href: null,
      icon: "•",
      display: raw,
    };
  }
}
