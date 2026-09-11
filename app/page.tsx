import { BrandLockup } from "@/components/brand-lockup";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-16 sm:px-6"
      >
        <h1>
          <BrandLockup size="lg" />
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          {site.appDescription}
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
