import Link from "next/link";
import { productWords } from "@/lib/content";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/commons", label: productWords.commons },
  { href: "/enter", label: "Enter" },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <header className="border-b border-[var(--line)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              {productWords.brand}
            </p>
            <p className="text-sm text-[var(--muted)]">Build your place in the Mesh.</p>
          </div>
          <nav className="flex items-center gap-5 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-[var(--accent)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
