"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/useUser";

const links = [
  { href: "/", label: "Home" },
  { href: "/scenario", label: "Scenario" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/saved", label: "Saved" },
  { href: "/reports", label: "Reports" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, supabase } = useUser();

  const onSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/50 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center gap-4 p-4">
        <div className="mr-4 select-none font-semibold text-white">WH40k LoreMaker</div>
        <ul className="flex items-center gap-3">
          {links.map(({ href, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={
                    "rounded-md px-3 py-1.5 text-sm transition " +
                    (active ? "bg-white text-black" : "text-white/80 hover:text-white hover:bg-white/10")
                  }
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto">
          {loading ? (
            <span className="text-white/70 text-sm">…</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-white/80 text-sm truncate max-w-[180px]">
                {user.user_metadata?.name || user.email}
              </span>
              <button
                onClick={onSignOut}
                className="rounded-md bg-white px-3 py-1.5 text-sm text-black hover:bg-white/90"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/sign-in"
              className="rounded-md bg-white px-3 py-1.5 text-sm text-black hover:bg-white/90"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
