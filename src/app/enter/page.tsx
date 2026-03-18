import { EnterForm } from "@/components/enter-form";

export default function EnterPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-2xl flex-col justify-center px-6 py-12">
      <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--accent)]">Enter</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Send your email when you want more.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-8 text-[var(--muted)]">
          Owners use email to open a Node. Others use email when they want to act:
          send a request, leave a suggestion, or push something through Spread It.
        </p>
        <EnterForm />
      </div>
    </main>
  );
}
