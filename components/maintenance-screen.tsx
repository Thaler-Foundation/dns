// The maintenance screen served in place of every covered page while MAINTENANCE_MODE is 1.
export function MaintenanceScreen() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12"
      >
        <h1 className="font-heading text-2xl tracking-tight">DNS is under maintenance.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Vault data and the devnet mirror are paused while we carry out maintenance. We will be back
          shortly.
        </p>
      </main>
    </div>
  );
}
