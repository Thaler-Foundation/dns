import { readFileSync } from "node:fs";
import { join } from "node:path";

const docsDir = join(process.cwd(), "docs");

export const LEGAL_PAGES = [
  {
    slug: "privacy",
    title: "Privacy",
    file: "privacy.md",
    description:
      "Privacy Policy for DNS. Sign-in, Solana data, and cookies.",
  },
  {
    slug: "terms",
    title: "Terms",
    file: "terms.md",
    description: "Terms and Conditions for DNS.",
  },
  {
    slug: "cookies",
    title: "Cookies",
    file: "cookies.md",
    description:
      "Cookie Policy. Necessary sign-in storage and optional analytics.",
  },
] as const;

export type LegalSlug = (typeof LEGAL_PAGES)[number]["slug"];

export function legalHref(slug: string): string {
  return `/${slug}`;
}

export function findLegal(slug: string | undefined) {
  return LEGAL_PAGES.find((page) => page.slug === slug) ?? null;
}

export function readDoc(file: string): string {
  return readFileSync(join(docsDir, file), "utf8");
}
