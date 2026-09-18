import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SwapView } from "@/components/swap-view";

export default function Home() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background selection:bg-primary/20">
      <SiteHeader />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10 sm:py-16"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.035)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"
        />

        <div className="relative z-10 w-full flex justify-center">
          <SwapView />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
