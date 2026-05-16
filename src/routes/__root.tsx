import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center font-mono">
        <h1 className="text-7xl font-bold text-destructive text-glow-red">404</h1>
        <h2 className="mt-4 text-xl font-semibold uppercase tracking-widest">Telemetry Lost</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This sector of SANDWICH COMMAND is uncharted.
        </p>
        <Link to="/" className="mt-6 inline-block rounded-sm border border-primary px-4 py-2 text-sm uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground">
          Return to Base
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-mono">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold uppercase tracking-widest text-destructive">System Fault</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-sm border border-primary px-4 py-2 text-sm uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Recalibrate
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SANDWICH COMMAND — Decision Engine v9.7" },
      { name: "description", content: "Mission-critical analysis to determine whether you, the operator, should eat a sandwich at this present moment." },
      { name: "author", content: "Sandwich Command" },
      { property: "og:title", content: "SANDWICH COMMAND" },
      { property: "og:description", content: "The over-engineered sandwich decision engine." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
