"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/scenario", label: "Scenario" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/reports", label: "Reports" },
];

export default function NavBar() {
  const pathname = usePathname();

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
                    (active
                      ? "bg-white text-black"
                      : "text-white/80 hover:text-white hover:bg-white/10")
                  }
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
