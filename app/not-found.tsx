import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12"
      >
        <h1 className="font-heading text-2xl tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          That URL is not a DNS page.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-10 w-fit items-center text-sm text-kiln underline underline-offset-4"
        >
          Home
        </Link>
      </main>
    </div>
  );
}
