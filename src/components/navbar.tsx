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
    <header className="border-b bg-white/60 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center gap-4 p-4">
        <div className="mr-4 select-none font-semibold">WH40k LoreMaker</div>
        <ul className="flex items-center gap-3">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={
                    "rounded-md px-3 py-1.5 text-sm transition " +
                    (active
                      ? "bg-black text-white"
                      : "text-black/80 hover:bg-black/5")
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
