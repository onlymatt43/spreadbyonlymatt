import { OwnerOnboardingForm } from "@/components/owner-onboarding-form";

export default async function OwnerOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email = "" } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-3xl flex-col justify-center px-6 py-12">
      <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--accent)]">
          Owner onboarding
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Open your Node.</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)]">
          Set your main link, your visible identity, and the first public layer of your
          space. The Vault and deeper spreads come next.
        </p>
        <OwnerOnboardingForm initialEmail={email} />
      </div>
    </main>
  );
}
