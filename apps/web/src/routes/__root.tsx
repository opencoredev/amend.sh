import { ThemeProvider } from "next-themes";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { PostHogErrorBoundary, PostHogProvider } from "@posthog/react";
import type { ConvexQueryClient } from "@convex-dev/react-query";
import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useLocation,
  useRouteContext,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import posthog from "posthog-js";
import { Toaster } from "sileo";

import { authClient } from "@/lib/auth-client";
import { getToken } from "@/lib/auth-server";
import { capturePostHogPageview } from "@/lib/posthog";
import { defaultDescription, defaultTitle, openGraphMeta } from "@/lib/seo";

import appCss from "../index.css?url";

const getAuth = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await getToken();
  } catch {
    return null;
  }
});

export interface RouterAppContext {
  queryClient: QueryClient;
  convexQueryClient: ConvexQueryClient;
  isAuthenticated?: boolean;
  token?: string | null;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: defaultTitle,
      },
      {
        name: "description",
        content: defaultDescription,
      },
      ...openGraphMeta({ description: defaultDescription, title: defaultTitle }),
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
    ],
  }),

  component: RootDocument,
  beforeLoad: async (ctx) => {
    const token = await getAuth();
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
    }
    return {
      isAuthenticated: !!token,
      token,
    };
  },
});

function RootDocument() {
  const context = useRouteContext({ from: Route.id });
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) {
      void import("react-grab");
    }
  }, []);

  useEffect(() => {
    capturePostHogPageview(location.href);
  }, [location.href]);

  return (
    <ConvexBetterAuthProvider
      client={context.convexQueryClient.convexClient}
      authClient={authClient}
      initialToken={context.token}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <HeadContent />
        </head>
        <body className="antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <PostHogProvider client={posthog}>
              <PostHogErrorBoundary
                fallback={RootErrorFallback}
                additionalProperties={() => ({
                  app: "amend-web",
                  path: window.location.href,
                  surface: "root-react-boundary",
                })}
              >
                <div className="min-h-svh">
                  <Outlet />
                </div>
              </PostHogErrorBoundary>
            </PostHogProvider>
            <Toaster
              position="top-right"
              offset={{ right: 18, top: 18 }}
              theme="dark"
              options={{
                fill: "#111111",
                roundness: 12,
                styles: {
                  badge: "bg-white/10!",
                  button: "bg-white/10! text-white! hover:bg-white/15!",
                  description: "text-white/70!",
                  title: "text-white!",
                },
              }}
            />
          </ThemeProvider>
          <Scripts />
        </body>
      </html>
    </ConvexBetterAuthProvider>
  );
}

function RootErrorFallback() {
  return (
    <main className="grid min-h-svh place-items-center bg-[#050505] px-6 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-2xl shadow-black/40">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
          Amend recovered this view
        </p>
        <h1 className="mt-4 text-2xl font-semibold leading-tight">Something went wrong.</h1>
        <p className="mt-3 text-sm leading-6 text-white/65">
          The error was sent to PostHog. Refresh the page to reload the workspace.
        </p>
        <button
          className="mt-6 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors duration-150 ease-linear hover:bg-white/85 active:opacity-75"
          type="button"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </section>
    </main>
  );
}
