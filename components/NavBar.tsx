import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export async function NavBar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-line bg-white/40">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="font-serif text-lg text-ink">
          Client Intelligence
        </Link>
        <nav className="flex items-center gap-5 font-mono text-[12px] uppercase tracking-[0.1em] text-muted">
          <Link href="/dashboard" className="hover:text-ink">
            Dashboard
          </Link>
          <Link href="/companies" className="hover:text-ink">
            Companies
          </Link>
          <Link href="/chat" className="hover:text-ink">
            Chat
          </Link>
          {user ? (
            <form action={signOut}>
              <button type="submit" className="hover:text-ink" title={user.email}>
                Sign out
              </button>
            </form>
          ) : (
            <Link href="/login" className="hover:text-ink">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
