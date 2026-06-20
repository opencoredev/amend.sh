/**
 * Connections — where Amend plugs into the outside world.
 *
 * Sources aren't a flat list: each integration plays a role in the loop, so the
 * page groups them by job — Listening (signal in), Ship tracking (what shipped),
 * Delivery (loop out). Each role is a compact grid of brand tiles (logos as the
 * star, not a long scroll); connected ones light up, the rest read as quiet
 * Connect targets so no category looks empty. Live state comes from the same
 * seam the agent reads (`useSourcesStatus` → `sources.status`); connect/manage
 * flows are the next build and are stubbed honestly for now.
 */
import { cn } from "@amend/ui/lib/utils";
import { type ReactNode, useMemo, useState } from "react";

import {
  ErrorState,
  SectionLabel,
  SkeletonBar,
  agentButtonClass,
} from "@/components/amend-agent-shared";
import { DashboardWorkspaceSurface } from "@/components/dashboard-workspace-surface";
import { PageHeader } from "@/components/amend-agent-chrome";
import { ToolbarBar, ToolbarGroup, ToolbarPill } from "@/components/dashboard-toolbar";
import { BrandIcon, type BrandKey } from "@/components/brand-icons";
import type { SourceChannel, SourcesStatus } from "@/lib/amend-contract";
import { relativeFromNow } from "@/lib/amend-agent-format";
import { useSourcesStatus } from "@/lib/mock-amend";
import { Code2, Globe, LifeBuoy, Link2, Mail, Plus, Sparkles, type LucideIcon } from "@/lib/icons";
import { toast } from "@/lib/toast";

type Role = "listening" | "ships" | "delivery";

interface Integration {
  id: string;
  name: string;
  /** Real company mark, or a generic glyph for first-party / protocol sources. */
  brand?: BrandKey;
  glyph?: LucideIcon;
  roles: Role[];
  /** One-line job; per-role override when the same provider does two jobs. */
  blurb: string;
  blurbByRole?: Partial<Record<Role, string>>;
  /** Maps to a live feedback channel in `sources.status`, when there is one. */
  channel?: SourceChannel;
  /** GitHub reads its richer connection record (repo + last sync). */
  isGithub?: boolean;
}

const ROLES: { key: Role; label: string; description: string }[] = [
  {
    key: "listening",
    label: "Listening",
    description: "Where Amend gathers signal — every source here feeds the agent's ghosts.",
  },
  {
    key: "ships",
    label: "Ship tracking",
    description: "What actually shipped, so Amend can close the loop with proof.",
  },
  {
    key: "delivery",
    label: "Delivery",
    description: "How Amend replies — notify the people who asked when it lands.",
  },
];

// One entry per provider; bidirectional ones list multiple roles and surface in
// each section (connect once, used in many).
const CATALOG: Integration[] = [
  {
    id: "github",
    name: "GitHub",
    brand: "github",
    isGithub: true,
    roles: ["listening", "ships"],
    blurb: "Issues & discussions as signal",
    blurbByRole: { ships: "Pull requests & releases" },
  },
  {
    id: "discord",
    name: "Discord",
    brand: "discord",
    channel: "discord",
    roles: ["listening", "delivery"],
    blurb: "Watch community channels",
    blurbByRole: { delivery: "Post updates back to channels" },
  },
  {
    id: "slack",
    name: "Slack",
    brand: "slack",
    roles: ["listening", "delivery"],
    blurb: "Read feedback from channels",
    blurbByRole: { delivery: "Notify requesters in-channel" },
  },
  {
    id: "support-inbox",
    name: "Support inbox",
    glyph: LifeBuoy,
    channel: "support",
    roles: ["listening"],
    blurb: "Forward support@ to Amend",
  },
  {
    id: "intercom",
    name: "Intercom",
    brand: "intercom",
    roles: ["listening"],
    blurb: "Pull support conversations",
  },
  {
    id: "zendesk",
    name: "Zendesk",
    brand: "zendesk",
    roles: ["listening"],
    blurb: "Tickets as feedback signal",
  },
  {
    id: "embed",
    name: "Embed widget",
    glyph: Globe,
    channel: "embed",
    roles: ["listening"],
    blurb: "Drop-in in-app feedback button",
  },
  {
    id: "linear",
    name: "Linear",
    brand: "linear",
    roles: ["listening", "ships"],
    blurb: "Requests triaged in Linear",
    blurbByRole: { ships: "Completed issues & cycles" },
  },
  {
    id: "posthog",
    name: "PostHog",
    brand: "posthog",
    roles: ["listening"],
    blurb: "Surveys & feedback events",
  },
  {
    id: "x",
    name: "X",
    brand: "x",
    roles: ["listening"],
    blurb: "Mentions of your product",
  },
  {
    id: "vercel",
    name: "Vercel",
    brand: "vercel",
    roles: ["ships"],
    blurb: "Production deployments",
  },
  {
    id: "gitlab",
    name: "GitLab",
    brand: "gitlab",
    roles: ["ships"],
    blurb: "Merge requests & releases",
  },
  {
    id: "email",
    name: "Email",
    glyph: Mail,
    roles: ["delivery"],
    blurb: "Reply to requesters + weekly digest",
  },
  {
    id: "webhook",
    name: "Webhook",
    glyph: Code2,
    roles: ["listening", "delivery"],
    blurb: "Custom inbound & outbound events",
  },
];

interface ConnectionState {
  connected: boolean;
  detail?: string;
}

function statusFor(item: Integration, sources: SourcesStatus | undefined): ConnectionState {
  if (!sources) return { connected: false };
  if (item.isGithub) {
    if (!sources.github.connected) return { connected: false };
    const detail = [
      sources.github.repo,
      sources.github.lastSync ? `synced ${relativeFromNow(sources.github.lastSync)}` : null,
    ]
      .filter(Boolean)
      .join(" · ");
    return { connected: true, detail: detail || undefined };
  }
  if (item.channel) {
    const channel = sources.feedback.channels.find((c) => c.channel === item.channel);
    if (!channel?.connected) return { connected: false };
    return {
      connected: true,
      detail: channel.lastSignal ? `Active ${relativeFromNow(channel.lastSignal)}` : "Connected",
    };
  }
  return { connected: false };
}

function IntegrationTile({
  item,
  role,
  state,
}: {
  item: Integration;
  role: Role;
  state: ConnectionState;
}) {
  const connected = state.connected;
  const sub = connected ? (state.detail ?? "Connected") : (item.blurbByRole?.[role] ?? item.blurb);

  return (
    <div className="group flex flex-col rounded-xl bg-white/[0.02] p-4 ring-1 ring-white/[0.06] ring-inset transition-colors duration-150 ease-linear hover:bg-white/[0.035] hover:ring-white/[0.1]">
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "grid size-10 place-items-center rounded-lg ring-1 ring-inset transition-colors duration-150",
            connected
              ? "bg-white/[0.07] text-foreground ring-white/[0.1]"
              : "bg-white/[0.025] text-muted-foreground/60 ring-white/[0.05] group-hover:text-muted-foreground",
          )}
        >
          {item.brand ? (
            <BrandIcon brand={item.brand} className="size-5" />
          ) : item.glyph ? (
            <item.glyph className="size-5" />
          ) : null}
        </span>
        {connected ? (
          <span className="inline-flex items-center gap-1 text-[0.66rem] font-semibold text-amend-success">
            <span className="size-1.5 rounded-full bg-amend-success" />
            Live
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-sm font-semibold text-foreground">{item.name}</p>
      <p className="mt-0.5 line-clamp-2 min-h-[2.25rem] text-xs leading-relaxed text-muted-foreground">
        {sub}
      </p>

      <button
        type="button"
        onClick={() =>
          connected
            ? toast.info({ title: item.name, description: "Manage flow is coming soon." })
            : toast.info({
                title: `Connect ${item.name}`,
                description: "This connection isn't wired up yet — the flow is the next build.",
              })
        }
        className={cn(agentButtonClass(connected ? "ghost" : "secondary", "sm"), "mt-3 w-full")}
      >
        {connected ? (
          "Manage"
        ) : (
          <>
            <Plus />
            Connect
          </>
        )}
      </button>
    </div>
  );
}

function RoleSection({
  role,
  label,
  description,
  sources,
}: {
  role: Role;
  label: string;
  description: string;
  sources: SourcesStatus | undefined;
}) {
  // Connected first, then alphabetical — so the live ones lead each category.
  const items = CATALOG.filter((item) => item.roles.includes(role))
    .map((item) => ({ item, state: statusFor(item, sources) }))
    .sort(
      (a, b) =>
        Number(b.state.connected) - Number(a.state.connected) ||
        a.item.name.localeCompare(b.item.name),
    );
  const connected = items.filter((i) => i.state.connected).length;

  return (
    <section>
      <SectionLabel count={connected > 0 ? connected : undefined}>{label}</SectionLabel>
      <p className="mb-3 mt-1 text-xs text-muted-foreground">{description}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map(({ item, state }) => (
          <IntegrationTile key={`${role}-${item.id}`} item={item} role={role} state={state} />
        ))}
      </div>
    </section>
  );
}

function ConnectedStat({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <div className="hidden h-10 items-center gap-2 rounded-xl bg-[#151518] px-3.5 text-sm ring-1 ring-white/[0.055] sm:flex">
      <Sparkles className="size-3.5 text-amend-success" />
      <span className="font-mono font-semibold tabular-nums text-foreground">{count}</span>
      <span className="text-muted-foreground">connected</span>
    </div>
  );
}

function ConnectionsToolbar({
  active,
  onChange,
}: {
  active: Role | "all";
  onChange: (role: Role | "all") => void;
}) {
  return (
    <ToolbarBar>
      <ToolbarGroup>
        <ToolbarPill active={active === "all"} onClick={() => onChange("all")}>
          All
        </ToolbarPill>
        {ROLES.map((role) => (
          <ToolbarPill key={role.key} active={active === role.key} onClick={() => onChange(role.key)}>
            {role.label}
          </ToolbarPill>
        ))}
      </ToolbarGroup>
    </ToolbarBar>
  );
}

function ConnectionsSkeleton() {
  return (
    <div className="space-y-3">
      <SkeletonBar className="h-3 w-28" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 ring-1 ring-white/[0.06] ring-inset">
            <SkeletonBar className="size-10 rounded-lg" />
            <SkeletonBar className="mt-3 h-4 w-20" />
            <SkeletonBar className="mt-2 h-3 w-28" />
            <SkeletonBar className="mt-3 h-7 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Centered, padded column inside the workspace surface — the role grids get the
 *  same elevated panel + breathing room every other page renders into. */
function Body({ children }: { children: ReactNode }) {
  return (
    <div className="amend-page-enter mx-auto w-full max-w-5xl space-y-8 px-5 py-6 md:px-8">
      {children}
    </div>
  );
}

function CenteredSurface({ children }: { children: ReactNode }) {
  return <div className="grid min-h-0 flex-1 place-items-center p-6">{children}</div>;
}

export function AmendConnectionsScreen() {
  const { data: sources, isLoading, isError } = useSourcesStatus();
  const [activeRole, setActiveRole] = useState<Role | "all">("all");

  const connectedCount = useMemo(() => {
    const ids = new Set<string>();
    for (const item of CATALOG) {
      if (statusFor(item, sources).connected) ids.add(item.id);
    }
    return ids.size;
  }, [sources]);

  const visibleRoles = ROLES.filter((role) => activeRole === "all" || activeRole === role.key);

  return (
    <>
      <PageHeader
        className="relative z-20 bg-background"
        icon={Link2}
        title="Connections"
        actions={<ConnectedStat count={connectedCount} />}
        filters={<ConnectionsToolbar active={activeRole} onChange={setActiveRole} />}
      />

      <DashboardWorkspaceSurface>
        {isError ? (
          <CenteredSurface>
            <ErrorState />
          </CenteredSurface>
        ) : isLoading ? (
          <Body>
            <ConnectionsSkeleton />
          </Body>
        ) : (
          <Body>
            {visibleRoles.map((role) => (
              <RoleSection
                key={role.key}
                role={role.key}
                label={role.label}
                description={role.description}
                sources={sources}
              />
            ))}
          </Body>
        )}
      </DashboardWorkspaceSurface>
    </>
  );
}
