import { Button } from "@amend/ui/components/button";
import { createFileRoute } from "@tanstack/react-router";
import { createAmendPanel, type AmendPanel } from "@amend/sdk/embed";
import { ArrowRight, Bell, MessageSquareText, PanelRightOpen, Road } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import AmendLogo from "@/components/amend-logo";
import { canonicalLink, openGraphMeta } from "@/lib/seo";

const title = "Amend.sh embed demo";
const description = "A runnable side-panel embed demo for Amend.sh.";

export const Route = createFileRoute("/embed-demo")({
  head: () => ({
    meta: [
      {
        title,
      },
      {
        name: "description",
        content: description,
      },
      ...openGraphMeta({ description, path: "/embed-demo", title }),
    ],
    links: [canonicalLink("/embed-demo")],
  }),
  component: EmbedDemoComponent,
});

function EmbedDemoComponent() {
  const panelRef = useRef<AmendPanel | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const panel = createAmendPanel({
      apiBaseUrl: `${import.meta.env.VITE_CONVEX_SITE_URL}/api/v1`,
      project: "amend-labs",
      title: "Amend updates",
    });
    panelRef.current = panel;
    setReady(true);

    return () => {
      panel.element.remove();
      panelRef.current = null;
    };
  }, []);

  return (
    <main className="min-h-svh overflow-x-hidden bg-background text-foreground">
      <section className="mx-auto grid min-h-svh max-w-[1200px] content-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[0.82fr_1fr] lg:px-8">
        <div>
          <AmendLogo size="md" markVariant="soft" />
          <p className="mt-16 font-mono text-sm text-muted-foreground">@amend/sdk/embed</p>
          <h1 className="mt-4 max-w-3xl text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.92] tracking-tight">
            The portal inside your app.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
            This route mounts the same side-panel helper customer apps can install. It reads the
            local portal API, shows shipped updates and roadmap records, and can submit feedback.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              type="button"
              size="lg"
              className="rounded-lg"
              onClick={() => {
                panelRef.current?.open();
                void panelRef.current?.refresh();
              }}
            >
              <PanelRightOpen className="size-4" />
              Open side panel
            </Button>
            <a
              href="/portal/amend-labs"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              View hosted portal
              <ArrowRight className="size-4" />
            </a>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Panel status: {ready ? "mounted" : "mounting"}
          </p>
        </div>

        <div className="grid content-center gap-4">
          <div className="border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="font-mono text-xs text-muted-foreground">customer-app.local</span>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                demo app
              </span>
            </div>
            <div className="grid gap-px bg-border md:grid-cols-3">
              <DemoTile
                icon={MessageSquareText}
                label="Signals"
                value="12"
                detail="requests mapped"
              />
              <DemoTile icon={Road} label="Roadmap" value="4" detail="source-linked items" />
              <DemoTile icon={Bell} label="Updates" value="3" detail="audiences queued" />
            </div>
            <div className="space-y-3 p-4">
              {[
                ["Webhook retry visibility", "The shipped update is now visible to API admins."],
                ["Digest windows", "Roadmap item planned from three customer requests."],
                ["Token rotation controls", "Published changelog note sent to security contacts."],
              ].map(([title, detail]) => (
                <div key={title} className="grid gap-1 border p-3">
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function DemoTile({
  detail,
  icon: Icon,
  label,
  value,
}: {
  detail: string;
  icon: typeof MessageSquareText;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card p-4">
      <div className="flex items-center justify-between">
        <Icon className="size-4 text-muted-foreground" />
        <span className="font-mono text-xl">{value}</span>
      </div>
      <p className="mt-6 text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
