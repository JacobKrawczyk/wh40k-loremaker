import "./globals.css";
import type { Metadata } from "next";
import NavBar from "@/components/navbar";

export const metadata: Metadata = {
  title: "WH40k LoreMaker",
  description: "Narrative scenario generator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main className="mx-auto max-w-5xl p-4">{children}</main>
      </body>
    </html>
  );
}
