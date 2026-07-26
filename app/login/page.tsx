import { signIn, signUp } from "@/lib/actions/auth";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string; mode?: string };
}) {
  const mode = searchParams.mode === "signup" ? "signup" : "signin";

  return (
    <main className="max-w-sm mx-auto py-24 px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-1">
        {mode === "signup" ? "Create account" : "Sign in"}
      </p>
      <h1 className="font-serif text-3xl text-ink mb-6">Client Intelligence</h1>

      {searchParams.error && (
        <p className="text-sm text-red-700 border border-red-200 rounded-sm p-3 mb-4">
          {searchParams.error}
        </p>
      )}
      {searchParams.message && (
        <p className="text-sm text-emerald-800 border border-emerald-200 rounded-sm p-3 mb-4">
          {searchParams.message}
        </p>
      )}

      <form action={mode === "signup" ? signUp : signIn} className="space-y-4 mb-4">
        <label className="block">
          <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-1">
            Email
          </span>
          <input
            type="email"
            name="email"
            required
            className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-1">
            Password
          </span>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
        </label>
        <button
          type="submit"
          className="w-full bg-ink text-paper font-mono text-[12px] uppercase tracking-[0.1em] px-4 py-2.5 rounded-sm hover:bg-ink/90"
        >
          {mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-muted text-center">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <a href="/login" className="text-accent underline underline-offset-2">
              Sign in
            </a>
          </>
        ) : (
          <>
            No account yet?{" "}
            <a href="/login?mode=signup" className="text-accent underline underline-offset-2">
              Create one
            </a>
          </>
        )}
      </p>
    </main>
  );
}
