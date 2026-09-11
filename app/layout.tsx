import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/providers";
import { getSEOTags } from "@/lib/seo";
import { SEO_KEYWORDS, site } from "@/lib/site";
import "./globals.css";
import { cn } from "@/lib/utils";

const pantheon = localFont({
  src: [
    {
      path: "../fonts/gt-pantheon-text-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/gt-pantheon-text-medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const logo = localFont({
  src: "../fonts/PPWriter-Regular.otf",
  variable: "--font-logo",
  display: "swap",
  weight: "400",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f5" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1c1c" },
  ],
};

const defaultTitle = `${site.appName}: ${site.appDescription}`;

export const metadata: Metadata = {
  ...getSEOTags({
    title: defaultTitle,
    description: site.appDescription,
    keywords: [...SEO_KEYWORDS],
    canonicalUrlRelative: "/",
  }),
  title: {
    default: defaultTitle,
    template: `%s | ${site.appName}`,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", pantheon.variable, logo.variable)}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-background font-sans text-foreground">
        {/* <SkipLink /> */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
