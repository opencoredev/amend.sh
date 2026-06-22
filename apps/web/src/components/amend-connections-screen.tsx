/**
 * Connections — where Amend plugs into the outside world.
 *
 * Sources aren't a flat list: each integration plays a role in the loop, so the
 * page groups them by job — Listening (signal in), Ship tracking (what shipped),
 * Delivery (loop out). Each role is a compact grid of brand tiles (logos as the
 * star, not a long scroll); connected ones light up, the rest read as quiet
 * Connect targets so no category looks empty.
 *
 * Live state is REAL: it reads the workspace's `integrationConnections` straight
 * from the backend (`amend:getWorkspaceSettings → integrations`) and Connect /
 * Disconnect persist through the `amend:upsertIntegrationConnection` mutation.
 * Providers the backend doesn't model yet render as honest "Planned" tiles
 * rather than a dead button — no fake "coming soon".
 */
import { cn } from "@amend/ui/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { type ReactNode, useMemo, useState } from "react";

import { SectionLabel, SkeletonBar, agentButtonClass } from "@/components/amend-agent-shared";
import { DashboardWorkspaceSurface } from "@/components/dashboard-workspace-surface";
import { PageHeader } from "@/components/amend-agent-chrome";
import { ToolbarBar, ToolbarGroup, ToolbarPill } from "@/components/dashboard-toolbar";
import { BrandIcon, type BrandKey } from "@/components/brand-icons";
import {
  upsertIntegrationConnectionMutation,
  workspaceSettingsQuery,
} from "@/components/amend-dashboard-data";
import type { WorkspaceSettingsData } from "@/components/amend-dashboard-types";
import { fallbackWorkspace } from "@/components/amend-dashboard-utils";
import {
  Code2,
  Globe,
  LifeBuoy,
  Loader2,
  Mail,
  PlugSocket,
  Plus,
  Sparkles,
  type LucideIcon,
} from "@/lib/icons";
import { errorMessage, toast } from "@/lib/toast";

type Role = "listening" | "ships" | "delivery";

/** The providers the backend can actually persist (`integrationProviderValue`). */
type IntegrationProvider =
  | "github"
  | "linear"
  | "slack"
  | "discord"
  | "x"
  | "posthog"
  | "databuddy"
  | "support";

type IntegrationDirection = "inbound" | "outbound" | "bidirectional";
type IntegrationRecord = WorkspaceSettingsData["integrations"][number];
type TileStatus = "connected" | "attention" | "disconnected" | "planned";

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
  /** Backend provider key. Absent → not yet persistable (renders as "Planned"). */
  provider?: IntegrationProvider;
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
// each section (connect once, used in many). `provider` ties the tile to a real
// backend connection record; entries without one are roadmapped, not wired.
const CATALOG: Integration[] = [
  {
    id: "github",
    name: "GitHub",
    brand: "github",
    provider: "github",
    roles: ["listening", "ships"],
    blurb: "Issues & discussions as signal",
    blurbByRole: { ships: "Pull requests & releases" },
  },
  {
    id: "discord",
    name: "Discord",
    brand: "discord",
    provider: "discord",
    roles: ["listening", "delivery"],
    blurb: "Watch community channels",
    blurbByRole: { delivery: "Post updates back to channels" },
  },
  {
    id: "slack",
    name: "Slack",
    brand: "slack",
    provider: "slack",
    roles: ["listening", "delivery"],
    blurb: "Read feedback from channels",
    blurbByRole: { delivery: "Notify requesters in-channel" },
  },
  {
    id: "support-inbox",
    name: "Support inbox",
    glyph: LifeBuoy,
    provider: "support",
    roles: ["listening"],
    blurb: "Forward support@ to Amend",
  },
  {
    id: "linear",
    name: "Linear",
    brand: "linear",
    provider: "linear",
    roles: ["listening", "ships"],
    blurb: "Requests triaged in Linear",
    blurbByRole: { ships: "Completed issues & cycles" },
  },
  {
    id: "posthog",
    name: "PostHog",
    brand: "posthog",
    provider: "posthog",
    roles: ["listening"],
    blurb: "Surveys & feedback events",
  },
  {
    id: "x",
    name: "X",
    brand: "x",
    provider: "x",
    roles: ["listening"],
    blurb: "Mentions of your product",
  },
  // Roadmapped — visible, but the backend can't persist these yet.
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
    roles: ["listening"],
    blurb: "Drop-in in-app feedback button",
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

const INBOUND_ROLES: Role[] = ["listening", "ships"];

/** A provider's overall direction = the union of the jobs it does. */
function directionFor(roles: Role[]): IntegrationDirection {
  const hasInbound = roles.some((role) => INBOUND_ROLES.includes(role));
  const hasOutbound = roles.includes("delivery");
  return hasInbound && hasOutbound ? "bidirectional" : hasOutbound ? "outbound" : "inbound";
}

const STATUS_RANK: Record<TileStatus, number> = {
  connected: 3,
  attention: 2,
  disconnected: 1,
  planned: 0,
};

function tileStatusFor(item: Integration, byProvider: Map<string, IntegrationRecord>): TileStatus {
  if (!item.provider) return "planned";
  const record = byProvider.get(item.provider);
  if (!record) return "disconnected";
  if (record.state === "connected") return "connected";
  if (record.state === "attention") return "attention";
  // "disabled" / "planned" records read as re-connectable.
  return "disconnected";
}

function StatusTag({ status }: { status: TileStatus }) {
  if (status === "connected") {
    return (
      <span className="inline-flex items-center gap-1 text-[0.66rem] font-semibold text-amend-success">
        <span className="size-1.5 rounded-full bg-amend-success" />
        Live
      </span>
    );
  }
  if (status === "attention") {
    return (
      <span className="inline-flex items-center gap-1 text-[0.66rem] font-semibold text-amend-warm">
        <span className="size-1.5 rounded-full bg-amend-warm" />
        Attention
      </span>
    );
  }
  return null;
}

function TileAction({
  status,
  pending,
  onConnect,
  onDisconnect,
}: {
  status: TileStatus;
  pending: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  if (status === "planned") {
    return (
      <span className="mt-3 inline-flex h-7 w-full items-center justify-center rounded-lg text-[0.72rem] font-medium text-muted-foreground/45 ring-1 ring-white/[0.04] ring-inset">
        Planned
      </span>
    );
  }
  if (status === "connected") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={onDisconnect}
        className={agentButtonClass(
          "secondary",
          "sm",
          "mt-3 w-full hover:bg-destructive/10 hover:text-destructive hover:ring-destructive/25",
        )}
      >
        {pending ? <Loader2 className="animate-spin" /> : null}
        Disconnect
      </button>
    );
  }
  // disconnected | attention → connect (attention re-arms a record that exists).
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onConnect}
      className={agentButtonClass("secondary", "sm", "mt-3 w-full")}
    >
      {pending ? <Loader2 className="animate-spin" /> : <Plus />}
      {status === "attention" ? "Reconnect" : "Connect"}
    </button>
  );
}

function IntegrationTile({
  item,
  role,
  status,
  pending,
  onConnect,
  onDisconnect,
}: {
  item: Integration;
  role: Role;
  status: TileStatus;
  pending: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const connected = status === "connected";
  const sub =
    status === "attention" ? "Needs reconnecting" : (item.blurbByRole?.[role] ?? item.blurb);

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
        <StatusTag status={status} />
      </div>

      <p className="mt-3 text-sm font-semibold text-foreground">{item.name}</p>
      <p className="mt-0.5 line-clamp-2 min-h-[2.25rem] text-xs leading-relaxed text-muted-foreground">
        {sub}
      </p>

      <TileAction
        status={status}
        pending={pending}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
      />
    </div>
  );
}

function RoleSection({
  role,
  label,
  description,
  byProvider,
  pendingProviders,
  onConnect,
  onDisconnect,
}: {
  role: Role;
  label: string;
  description: string;
  byProvider: Map<string, IntegrationRecord>;
  pendingProviders: Set<string>;
  onConnect: (item: Integration) => void;
  onDisconnect: (item: Integration) => void;
}) {
  // Connected first, then attention/disconnected, planned last — alphabetical
  // within a tier — so live sources lead each category.
  const items = CATALOG.filter((item) => item.roles.includes(role))
    .map((item) => ({ item, status: tileStatusFor(item, byProvider) }))
    .sort(
      (a, b) =>
        STATUS_RANK[b.status] - STATUS_RANK[a.status] || a.item.name.localeCompare(b.item.name),
    );
  const connectedCount = items.filter((entry) => entry.status === "connected").length;

  return (
    <section>
      <SectionLabel count={connectedCount > 0 ? connectedCount : undefined}>{label}</SectionLabel>
      <p className="mb-3 mt-1 text-xs text-muted-foreground">{description}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map(({ item, status }) => (
          <IntegrationTile
            key={`${role}-${item.id}`}
            item={item}
            role={role}
            status={status}
            pending={item.provider ? pendingProviders.has(item.provider) : false}
            onConnect={() => onConnect(item)}
            onDisconnect={() => onDisconnect(item)}
          />
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
          <ToolbarPill
            key={role.key}
            active={active === role.key}
            onClick={() => onChange(role.key)}
          >
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

export function AmendConnectionsScreen({ workspaceId }: { workspaceId: string }) {
  const isRealWorkspace = workspaceId !== fallbackWorkspace.id;
  const queryArgs = isRealWorkspace ? { workspaceSlug: workspaceId } : {};
  const settings = useQuery(workspaceSettingsQuery, queryArgs) as WorkspaceSettingsData | undefined;
  const upsertIntegration = useMutation(upsertIntegrationConnectionMutation);

  const [activeRole, setActiveRole] = useState<Role | "all">("all");
  const [pendingProviders, setPendingProviders] = useState<Set<string>>(() => new Set());

  const byProvider = useMemo(() => {
    const map = new Map<string, IntegrationRecord>();
    for (const record of settings?.integrations ?? []) map.set(record.provider, record);
    return map;
  }, [settings]);

  const connectedCount = useMemo(
    () => CATALOG.filter((item) => tileStatusFor(item, byProvider) === "connected").length,
    [byProvider],
  );

  async function applyState(item: Integration, nextState: "connected" | "disabled") {
    if (!item.provider) return;
    const provider = item.provider;
    setPendingProviders((prev) => new Set(prev).add(provider));
    try {
      await upsertIntegration({
        ...(isRealWorkspace ? { workspaceSlug: workspaceId } : {}),
        provider,
        direction: directionFor(item.roles),
        displayName: item.name,
        state: nextState,
      });
      if (nextState === "connected") {
        toast.success({
          title: `${item.name} connected`,
          description: "Amend will start using this source.",
        });
      } else {
        toast.success({
          title: `${item.name} disconnected`,
          description: "Amend will stop using this source.",
          button: { title: "Undo", onClick: () => void applyState(item, "connected") },
        });
      }
    } catch (error) {
      toast.error(errorMessage(error, `Couldn't update ${item.name}. Please try again.`));
    } finally {
      setPendingProviders((prev) => {
        const next = new Set(prev);
        next.delete(provider);
        return next;
      });
    }
  }

  const visibleRoles = ROLES.filter((role) => activeRole === "all" || activeRole === role.key);

  return (
    <>
      <PageHeader
        className="relative z-20 bg-background"
        icon={PlugSocket}
        title="Connections"
        actions={<ConnectedStat count={connectedCount} />}
        filters={<ConnectionsToolbar active={activeRole} onChange={setActiveRole} />}
      />

      <DashboardWorkspaceSurface>
        {settings === undefined ? (
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
                byProvider={byProvider}
                pendingProviders={pendingProviders}
                onConnect={(item) => void applyState(item, "connected")}
                onDisconnect={(item) => void applyState(item, "disabled")}
              />
            ))}
          </Body>
        )}
      </DashboardWorkspaceSurface>
    </>
  );
}
