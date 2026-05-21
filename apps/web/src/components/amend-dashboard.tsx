import { Button } from "@amend/ui/components/button";
import { Input } from "@amend/ui/components/input";
import { cn } from "@amend/ui/lib/utils";
import { Link, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import {
  BookOpen,
  CalendarClock,
  Check,
  ChevronDown,
  Circle,
  CircleDashed,
  ClipboardList,
  Code2,
  Copy,
  DatabaseZap,
  ExternalLink,
  GitPullRequestArrow,
  Globe,
  Inbox,
  Megaphone,
  MessageSquareText,
  Plus,
  Radio,
  Search,
  Settings,
  Sparkles,
  Tag as TagIcon,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  DragEvent as ReactDragEvent,
  KeyboardEvent as ReactKeyboardEvent,
  ReactElement,
  ReactNode,
} from "react";

import AmendLogo from "@/components/amend-logo";
import { BrandMark } from "@/components/brand-mark";
import DashboardAuthShell from "@/components/dashboard-auth-shell";
import {
  ComposerModal,
  type ComposerSubmitPayload,
  type StatusItem,
} from "@/components/post-composer-demo";
import { authClient } from "@/lib/auth-client";
import { errorMessage, toast } from "@/lib/toast";

type RoadmapStatus = "backlog" | "next" | "progress" | "done";
type ChangelogStatusFilter = "all" | "draft" | "in_review" | "scheduled" | "published";
type DashboardView = "posts" | "roadmap" | "changelog" | "settings" | "setup";
type SettingsSection = "accounts" | "automation" | "general" | "portal" | "services";
type BoardId = "feature" | "bug" | "changelog" | "feedback";
type WorkspaceId = string;
type RoadmapViewId = string;

type PortalSettings = {
  accentColor?: string;
  changelogVisibility: "private" | "public";
  feedbackMode: "authenticated" | "closed" | "open";
  headline?: string;
  intro?: string;
  roadmapVisibility: "private" | "public";
};

type Workspace = {
  description?: string;
  id: WorkspaceId;
  initials: string;
  name: string;
  plan: string;
  portalSettings?: PortalSettings;
  repo: string;
  portal: string;
  visibility?: "private" | "public";
};

type ProjectMenuItem = {
  description?: string;
  id: string;
  initials: string;
  logoUrl?: string;
  name: string;
  plan: string;
  portal: string;
  repo: string;
  sourceReady: boolean;
  websiteUrl?: string;
};

type Board = {
  id: BoardId;
  name: string;
  description: string;
  icon: ReactElement;
};

type Post = {
  authorName: string;
  body: string;
  id: string;
  title: string;
  boardId: BoardId;
  status: RoadmapStatus;
  source: string;
  labels: string[];
  linkedChangelogCount: number;
  linkedRoadmapCount: number;
  sourceLinks: SourceLink[];
  sourceRoadmapKey?: string;
  stableKey: string;
  updatedAt: number;
  voters: number;
  date: string;
};

type ProjectSuggestion = {
  description?: string;
  logoUrl?: string;
  name: string;
  slug: string;
  websiteUrl: string;
};

type WebsiteLookupStatus = "idle" | "checking" | "valid" | "invalid";

type CreatedProject = {
  slug: string;
  workspaceSlug?: string;
};

type RepositoryDraft = {
  owner: string;
  repo: string;
  repositoryUrl: string;
};

type GitHubInstalledRepository = {
  defaultBranch?: string;
  description?: string;
  fullName: string;
  htmlUrl: string;
  id: number;
  owner: string;
  private: boolean;
  repo: string;
  updatedAt?: string;
};

type GitHubInstallationAccount = {
  avatarUrl?: string;
  id: number;
  login: string;
  repositories: GitHubInstalledRepository[];
  type: string;
};

type GitHubInstallationDirectory = {
  accounts: GitHubInstallationAccount[];
  configured: boolean;
  error?: string;
  installUrl?: string;
  missing?: string[];
  workspaceSlug?: string;
};

type SourceLink = {
  externalId?: string;
  kind?: string;
  number?: number;
  provider?: string;
  title?: string;
  url?: string;
};

type DashboardFeedback = {
  authorName: string;
  body: string;
  labels: string[];
  linkedChangelogCount: number;
  linkedRoadmapCount: number;
  recordId: string | null;
  source: string;
  sourceLinks: SourceLink[];
  stableKey: string;
  status: string;
  title: string;
  updatedAt: number;
  votes: number;
};

type DashboardRoadmap = {
  changelogCount: number;
  description: string;
  feedbackCount: number;
  impact: string;
  priority: string;
  recordId: string | null;
  sourceLinks: SourceLink[];
  stableKey: string;
  status: string;
  target?: string;
  title: string;
  updatedAt: number;
};

type RoadmapView = {
  description: string;
  entries: DashboardRoadmap[];
  id: RoadmapViewId;
  name: string;
};

type DashboardChangelog = {
  authorName: string;
  body: string;
  category: string;
  publishedAt?: number;
  recordId: string | null;
  scheduledFor?: number;
  sourceLinks: SourceLink[];
  stableKey: string;
  status: string;
  summary: string;
  tags: string[];
  title: string;
  updatedAt: number;
  version?: string;
};

type DashboardReview = {
  kind: string;
  recordId: string | null;
  sourceLinks: SourceLink[];
  stableKey: string;
  status: string;
  summary: string;
  targetKey: string;
  title: string;
  updatedAt: number;
};

type DashboardAutomationDecision = {
  action: string;
  confidence: number;
  needsReview: boolean;
  outcome: string;
  recordId: string | null;
  sourceLinks: SourceLink[];
  stableKey: string;
  summary: string;
  targetKey: string;
  targetKind: string;
  updatedAt: number;
};

type DashboardSourceEvent = {
  author?: string;
  externalId: string;
  kind: string;
  labels: string[];
  number?: number;
  observedAt: number;
  owner?: string;
  provider: string;
  recordId: string | null;
  repo?: string;
  state?: string;
  title: string;
  url: string;
};

type DashboardChannel = {
  detail: string;
  health: string;
  id: string;
  kind: "context" | "input";
  label: string;
  lastEventAt?: number;
  provider: string;
  signalCount: number;
  state: string;
};

type DashboardAgentActivity = {
  confidence?: number;
  id: string;
  kind: "decision" | "notification" | "review" | "source_event";
  needsReview?: boolean;
  sourceLinks: SourceLink[];
  state: string;
  summary: string;
  timestamp: number;
  title: string;
};

type DashboardNotification = {
  body: string;
  channel: string;
  priority: string;
  recordId: string | null;
  relatedKey: string;
  sourceLinks: SourceLink[];
  stableKey: string;
  status: string;
  title: string;
};

type DashboardOverview = {
  agentActivity: DashboardAgentActivity[];
  automationDecisions: DashboardAutomationDecision[];
  channels: DashboardChannel[];
  feedback: DashboardFeedback[];
  github?: {
    owner?: string;
    repo?: string;
    repositoryUrl?: string;
  };
  notifications: DashboardNotification[];
  recentChangelog: DashboardChangelog[];
  reviewQueue: DashboardReview[];
  roadmap: DashboardRoadmap[];
  sourceEvents: DashboardSourceEvent[];
  workspace?: {
    description?: string;
    name?: string;
    portalSettings?: PortalSettings;
    recordId?: string | null;
    slug?: string;
    visibility?: "private" | "public";
  };
};

type DashboardProject = {
  description?: string;
  logoUrl?: string;
  name: string;
  recordId: string | null;
  repositories?: Array<{
    owner?: string;
    repo?: string;
    repositoryUrl?: string;
  }>;
  slug: string;
  sourceMode?: "feedback" | "github";
  updatedAt?: number;
  websiteUrl?: string;
};

type WorkspaceSettingsData = {
  automationRules?: {
    autoDraftChangelog: boolean;
    autoNotifyUsers: boolean;
    autoPublishChangelog: boolean;
    autoUpdateFeedbackStatus: boolean;
    autoUpdateRoadmapStatus: boolean;
    byokConfigured: boolean;
    byokProvider?: string;
    mode: "manual" | "mostly_auto" | "review_first";
    recordId: string | null;
    requireReviewBelowConfidence: number;
    requireReviewForHighImpact: boolean;
    requireReviewForPublicCopy: boolean;
    updatedAt: number;
  };
  customDomains: Array<{
    domain: string;
    purpose: string;
    recordId: string | null;
    status: string;
    updatedAt: number;
  }>;
  integrations: Array<{
    direction: string;
    displayName: string;
    provider: string;
    recordId: string | null;
    state: string;
    updatedAt: number;
  }>;
  members: Array<{
    email: string;
    name?: string;
    permissions: string[];
    recordId: string | null;
    role: "admin" | "member" | "owner" | "reviewer" | "viewer";
    updatedAt: number;
  }>;
  notificationPreferences: Array<unknown>;
  projects: DashboardProject[];
  rateLimits?: {
    projectWebsiteLookup?: {
      capacity: number;
      period: string;
      rate: number;
    };
  };
};

const suggestFromWebsite = makeFunctionReference<"action">("projects:suggestFromWebsite");
const createWorkspaceProject = makeFunctionReference<"mutation">("amend:createProject");
const connectProjectRepository = makeFunctionReference<"mutation">(
  "amend:connectProjectRepository",
);
const markProjectFeedbackSource = makeFunctionReference<"mutation">(
  "amend:markProjectFeedbackSource",
);
const listGitHubAppRepositoriesAction = makeFunctionReference<"action">(
  "amend:listGitHubAppRepositories",
);
const dashboardOverviewQuery = makeFunctionReference<"query">("amend:getDashboardOverview");
const projectsQuery = makeFunctionReference<"query">("amend:getProjects");
const workspaceSettingsQuery = makeFunctionReference<"query">("amend:getWorkspaceSettings");
const updatePortalSettingsMutation = makeFunctionReference<"mutation">(
  "amend:updatePortalSettings",
);
const updateAutomationRulesMutation = makeFunctionReference<"mutation">(
  "amend:updateAutomationRules",
);
const updateReviewStatusMutation = makeFunctionReference<"mutation">("amend:updateReviewStatus");
const revertAutomationDecisionMutation = makeFunctionReference<"mutation">(
  "amend:revertAutomationDecision",
);
const createFeedbackMutation = makeFunctionReference<"mutation">("amend:createFeedback");
const recordFeedbackInteractionMutation = makeFunctionReference<"mutation">(
  "amend:recordFeedbackInteraction",
);
const upsertChangelogEntryMutation = makeFunctionReference<"mutation">(
  "amend:upsertChangelogEntry",
);
const upsertRoadmapItemMutation = makeFunctionReference<"mutation">("amend:upsertRoadmapItem");
const voteRoadmapItemMutation = makeFunctionReference<"mutation">("amend:voteRoadmapItem");
const updateProjectMutation = makeFunctionReference<"mutation">("amend:updateProject");
const generateProjectLogoUploadUrlMutation = makeFunctionReference<"mutation">(
  "amend:generateProjectLogoUploadUrl",
);
const upsertWorkspaceMemberMutation = makeFunctionReference<"mutation">(
  "amend:upsertWorkspaceMember",
);
const upsertIntegrationConnectionMutation = makeFunctionReference<"mutation">(
  "amend:upsertIntegrationConnection",
);
const runProactiveAgentAction = makeFunctionReference<"action">(
  "amend:runProactiveAgentForWorkspace",
);

const viewValues: DashboardView[] = ["posts", "roadmap", "changelog", "settings", "setup"];
const boardValues: BoardId[] = ["feature", "bug", "changelog", "feedback"];
const statusValues: Array<RoadmapStatus | "all"> = ["all", "backlog", "next", "progress", "done"];

const fallbackWorkspace: Workspace = {
  id: "workspace",
  initials: "AM",
  name: "Amend",
  plan: "Workspace",
  repo: "Connect GitHub",
  portal: "Portal not configured",
};

const feedbackBoard: Board = {
  id: "feedback",
  name: "Feedback",
  description:
    "Feedback, roadmap evidence, and shipped updates from the connected Amend workspace.",
  icon: <MessageSquareText />,
};

const fallbackRoadmapView: RoadmapView = {
  id: "main",
  name: "Main roadmap",
  description:
    "Every roadmap item Amend knows about, tied back to feedback, GitHub source, and changelog evidence.",
  entries: [],
};

const statusMeta: Record<
  RoadmapStatus,
  { label: string; short: string; icon: ReactElement; dot: string }
> = {
  backlog: {
    label: "Under Review",
    short: "Review",
    icon: <Circle />,
    dot: "bg-muted-foreground",
  },
  next: {
    label: "Planned",
    short: "Planned",
    icon: <CalendarClock />,
    dot: "bg-muted-foreground",
  },
  progress: {
    label: "In Progress",
    short: "Progress",
    icon: <Radio />,
    dot: "bg-foreground",
  },
  done: {
    label: "Done",
    short: "Done",
    icon: <Check />,
    dot: "bg-foreground",
  },
};

function dashboardCacheKey(workspaceId: string, projectSlug?: string) {
  return `amend.dashboard.${workspaceId || "workspace"}.${projectSlug || "workspace"}`;
}

function projectsCacheKey(workspaceId: string) {
  return `amend.projects.${workspaceId || "workspace"}`;
}

function readStoredJson<T>(key: string): T | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : undefined;
  } catch {
    return undefined;
  }
}

function writeStoredJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota/private-mode failures; live Convex data still renders.
  }
}

export default function AmendDashboard() {
  const params = useParams({ strict: false }) as { view?: string };
  const search = useSearch({ strict: false }) as {
    board?: string;
    project?: string;
    q?: string;
    roadmap?: string;
    status?: string;
    view?: string;
    workspace?: string;
  };
  const navigate = useNavigate();
  const session = authClient.useSession();
  const hasSession = Boolean(session.data?.user);
  const activeView = normalizeView(params.view ?? search.view);
  const activeBoardId = normalizeBoard(search.board);
  const activeProjectId = search.project ?? "";
  const activeRoadmapId = normalizeRoadmapView(search.roadmap);
  const searchQuery = search.q ?? "";
  const activeStatus = normalizeStatus(search.status);
  const workspaceId = normalizeWorkspace(search.workspace);
  const activeProjectSlug =
    activeProjectId && activeProjectId !== "new-project" ? activeProjectId : undefined;
  const workspaceQueryArgs =
    workspaceId === fallbackWorkspace.id ? {} : { workspaceSlug: workspaceId };
  const dashboardQueryArgs = activeProjectSlug
    ? { ...workspaceQueryArgs, projectSlug: activeProjectSlug }
    : workspaceQueryArgs;
  const authenticatedDashboardQueryArgs = hasSession ? dashboardQueryArgs : "skip";
  const authenticatedProjectsQueryArgs = hasSession ? workspaceQueryArgs : "skip";
  const dashboard = useQuery(dashboardOverviewQuery, authenticatedDashboardQueryArgs) as
    | DashboardOverview
    | undefined;
  const projects = useQuery(projectsQuery, authenticatedProjectsQueryArgs) as
    | DashboardProject[]
    | undefined;
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspaceQuery, setWorkspaceQuery] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [activeChangelogStatus, setActiveChangelogStatus] = useState<ChangelogStatusFilter>("all");
  const [activeChangelogCategory, setActiveChangelogCategory] = useState("all");
  const [activeSettingsSection, setActiveSettingsSection] = useState<SettingsSection>("general");
  const [roadmapCreateStatus, setRoadmapCreateStatus] = useState<RoadmapStatus | null>(null);
  const [selectedFeedbackKey, setSelectedFeedbackKey] = useState<string | null>(null);
  const [selectedChangelogKey, setSelectedChangelogKey] = useState<string | null>(null);
  const [selectedRoadmapKey, setSelectedRoadmapKey] = useState<string | null>(null);
  const workspaceMenuRef = useRef<HTMLDivElement | null>(null);
  const [cachedDashboard, setCachedDashboard] = useState<DashboardOverview | undefined>(() =>
    readStoredJson<DashboardOverview>(dashboardCacheKey(workspaceId, activeProjectSlug)),
  );
  const [cachedProjects, setCachedProjects] = useState<DashboardProject[] | undefined>(() =>
    readStoredJson<DashboardProject[]>(projectsCacheKey(workspaceId)),
  );
  const effectiveDashboard = dashboard ?? cachedDashboard;
  const effectiveProjects = projects ?? cachedProjects;
  const projectsReady = effectiveProjects !== undefined;
  const createFeedback = useMutation(createFeedbackMutation);
  const recordFeedbackInteraction = useMutation(recordFeedbackInteractionMutation);
  const upsertChangelog = useMutation(upsertChangelogEntryMutation);
  const upsertRoadmap = useMutation(upsertRoadmapItemMutation);
  const voteRoadmap = useMutation(voteRoadmapItemMutation);

  useEffect(() => {
    setCachedDashboard(
      readStoredJson<DashboardOverview>(dashboardCacheKey(workspaceId, activeProjectSlug)),
    );
    setCachedProjects(readStoredJson<DashboardProject[]>(projectsCacheKey(workspaceId)));
  }, [activeProjectSlug, workspaceId]);

  useEffect(() => {
    if (!dashboard) return;
    setCachedDashboard(dashboard);
    writeStoredJson(dashboardCacheKey(workspaceId, activeProjectSlug), dashboard);
  }, [activeProjectSlug, dashboard, workspaceId]);

  useEffect(() => {
    if (!projects) return;
    setCachedProjects(projects);
    writeStoredJson(projectsCacheKey(workspaceId), projects);
  }, [projects, workspaceId]);

  useEffect(() => {
    if (session.isPending || hasSession) return;

    void navigate({
      to: "/sign-in",
    });
  }, [hasSession, navigate, session.isPending]);

  const workspace = useMemo(
    () => workspaceFromDashboard(effectiveDashboard, workspaceId),
    [effectiveDashboard, workspaceId],
  );
  const mutationScope = {
    ...(workspace.id === fallbackWorkspace.id ? {} : { workspaceSlug: workspace.id }),
    ...(activeProjectSlug ? { projectSlug: activeProjectSlug } : {}),
  };
  const activeBoard = feedbackBoard;
  const feedbackPosts = useMemo(
    () => buildSyncedPosts(effectiveDashboard?.feedback ?? [], effectiveDashboard?.roadmap ?? []),
    [effectiveDashboard?.feedback, effectiveDashboard?.roadmap],
  );
  const syncedRoadmapEntries = useMemo(
    () => buildSyncedRoadmapEntries(effectiveDashboard?.roadmap ?? [], feedbackPosts),
    [effectiveDashboard?.roadmap, feedbackPosts],
  );
  const roadmapViews = useMemo(
    () => buildRoadmapViews(syncedRoadmapEntries),
    [syncedRoadmapEntries],
  );
  const activeRoadmap =
    roadmapViews.find((roadmap) => roadmap.id === activeRoadmapId) ??
    roadmapViews[0] ??
    fallbackRoadmapView;
  const changelogEntries = effectiveDashboard?.recentChangelog ?? [];
  const selectedFeedback =
    feedbackPosts.find(
      (post) =>
        !post.sourceRoadmapKey &&
        (post.stableKey === selectedFeedbackKey || post.id === selectedFeedbackKey),
    ) ?? null;
  const selectedRoadmap =
    syncedRoadmapEntries.find((entry) => entry.stableKey === selectedRoadmapKey) ?? null;
  const selectedChangelog =
    changelogEntries.find(
      (entry) =>
        entry.stableKey === selectedChangelogKey || entry.recordId === selectedChangelogKey,
    ) ?? null;
  const projectItems = useMemo(
    () => projectsToMenuItems(effectiveProjects, workspace),
    [effectiveProjects, workspace],
  );
  const requiresProjectSetup =
    hasSession && projectsReady && !activeProjectSlug && (effectiveProjects?.length ?? 0) === 0;

  const projectMatches = useMemo(() => {
    const query = workspaceQuery.trim().toLowerCase();
    if (!query) return projectItems;
    return projectItems.filter((item) =>
      [item.name, item.repo, item.portal].join(" ").toLowerCase().includes(query),
    );
  }, [projectItems, workspaceQuery]);
  const activeProject = useMemo(() => {
    return (
      projectItems.find((item) => item.id === activeProjectId) ??
      (activeProjectSlug
        ? optimisticProjectMenuItem(activeProjectSlug, workspace, effectiveDashboard)
        : null) ??
      projectItems[0] ?? {
        id: "new-project",
        initials: workspace.initials,
        name: workspace.name,
        plan: "No project",
        repo: workspace.repo,
        portal: workspace.portal,
        sourceReady: false,
      }
    );
  }, [activeProjectId, activeProjectSlug, effectiveDashboard, projectItems, workspace]);
  const activeProjectNeedsSource =
    hasSession && projectsReady && activeProject.id !== "new-project" && !activeProject.sourceReady;

  const setRoute = (
    next: Partial<{
      board: BoardId;
      project: string;
      roadmap: RoadmapViewId;
      status: RoadmapStatus | "all";
      view: DashboardView;
      workspace: WorkspaceId;
      q: string;
    }>,
  ) => {
    const nextView = next.view ?? activeView;
    void navigate({
      params: { view: nextView },
      search: {
        board: next.board ?? activeBoardId,
        project: next.project ?? activeProjectId,
        q: next.q ?? searchQuery,
        roadmap: next.roadmap ?? activeRoadmap.id,
        status: next.status ?? activeStatus,
        workspace: next.workspace ?? workspaceId,
      },
      to: "/dashboard/$view",
    });
  };

  useEffect(() => {
    if (activeProjectId || !projectsReady || requiresProjectSetup || activeView === "setup") return;
    if (activeProject.id === "new-project") return;
    setRoute({ project: activeProject.id });
  }, [
    activeProject.id,
    activeProjectId,
    activeView,
    projectsReady,
    requiresProjectSetup,
    setRoute,
  ]);

  useEffect(() => {
    if (!requiresProjectSetup || activeView === "setup") return;

    void navigate({
      params: { view: "setup" },
      search: {
        board: activeBoardId,
        project: "",
        q: searchQuery,
        roadmap: activeRoadmap.id,
        status: activeStatus,
        workspace: workspaceId,
      },
      to: "/dashboard/$view",
    });
  }, [
    activeBoardId,
    activeRoadmap.id,
    activeStatus,
    activeView,
    navigate,
    requiresProjectSetup,
    searchQuery,
    workspaceId,
  ]);

  useEffect(() => {
    if (!activeProjectNeedsSource || activeView === "setup") return;

    void navigate({
      params: { view: "setup" },
      search: {
        board: activeBoardId,
        project: activeProject.id,
        q: searchQuery,
        roadmap: activeRoadmap.id,
        status: activeStatus,
        workspace: workspaceId,
      },
      to: "/dashboard/$view",
    });
  }, [
    activeBoardId,
    activeProject.id,
    activeProjectNeedsSource,
    activeRoadmap.id,
    activeStatus,
    activeView,
    navigate,
    searchQuery,
    workspaceId,
  ]);

  useEffect(() => {
    if (!workspaceOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (!workspaceMenuRef.current?.contains(event.target as Node)) {
        setWorkspaceOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setWorkspaceOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [workspaceOpen]);

  const scopedPosts = filterPosts(
    feedbackPosts.filter((post) => activeStatus === "all" || post.status === activeStatus),
    searchQuery,
  );
  const scopedRoadmapEntries = filterRoadmapEntries(
    activeRoadmap.entries.filter(
      (item) =>
        activeStatus === "all" || roadmapStatusToRoadmapStatus(item.status) === activeStatus,
    ),
    searchQuery,
  );
  const scopedChangelogEntries = filterChangelogEntries(
    changelogEntries.filter(
      (entry) =>
        (activeChangelogStatus === "all" || entry.status === activeChangelogStatus) &&
        (activeChangelogCategory === "all" || entry.category === activeChangelogCategory),
    ),
    searchQuery,
  );
  const focusChangelogEditor = Boolean(selectedChangelog && activeView === "changelog");

  async function handleComposerSubmit(payload: ComposerSubmitPayload) {
    if (workspace.id === fallbackWorkspace.id) {
      throw new Error("Create a project before adding dashboard items.");
    }

    const text = payload.description || payload.title;
    const labels = [payload.board, payload.status, payload.tag].filter(Boolean) as string[];

    if (payload.board === "Changelog" || activeView === "changelog") {
      await upsertChangelog({
        body: text,
        category: payload.tag === "High Priority" ? "added" : "changed",
        status: composerStatusToChangelogStatus(payload.status),
        summary: text,
        tags: labels,
        title: payload.title,
        ...mutationScope,
        ...(payload.status === "Completed" ? { publishedAt: Date.now() } : {}),
      });
      toast.success("Changelog draft saved");
      return;
    }

    if (payload.board === "Feature Request" || activeView === "roadmap") {
      await upsertRoadmap({
        description: text,
        impact: text,
        priority: payload.tag === "High Priority" ? "P1" : "P2",
        status: roadmapCreateStatus
          ? roadmapStatusToPortalStatus(roadmapCreateStatus)
          : composerStatusToRoadmapStatus(payload.status),
        title: payload.title,
        ...mutationScope,
        ...(payload.dueDate ? { target: payload.dueDate } : {}),
      });
      toast.success("Roadmap item saved");
      setRoadmapCreateStatus(null);
      return;
    }

    await createFeedback({
      authorName: "Dashboard",
      body: text,
      labels,
      title: payload.title,
      ...mutationScope,
    });
    toast.success("Feedback item saved");
  }

  if (!session.isPending && !hasSession) {
    return <DashboardAuthShell showSignIn />;
  }

  if (requiresProjectSetup) {
    return (
      <ProjectSetupShell
        workspace={workspace}
        onCreated={(projectSlug: string, workspaceSlug?: string) =>
          setRoute({
            project: projectSlug,
            view: "posts",
            workspace: workspaceSlug ?? workspace.id,
          })
        }
      />
    );
  }

  return (
    <main className="dark min-h-svh overflow-hidden bg-background font-mono text-foreground">
      <div
        className={cn(
          "grid min-h-svh",
          focusChangelogEditor
            ? "lg:grid-cols-[3.75rem_minmax(0,1fr)]"
            : "lg:grid-cols-[3.75rem_17.5rem_minmax(0,1fr)]",
        )}
      >
        <IconRail activeView={activeView} onViewChange={(view) => setRoute({ view })} />

        <aside
          className={cn(
            "hidden border-b border-border bg-card/30 lg:border-b-0 lg:border-r",
            focusChangelogEditor ? "lg:hidden" : "lg:block",
          )}
        >
          <div className="flex h-full min-h-0 flex-col">
            <WorkspaceSwitcher
              menuRef={workspaceMenuRef}
              onAddProject={() => {
                setRoute({ view: "setup" });
                setWorkspaceOpen(false);
                setWorkspaceQuery("");
              }}
              onOpenChange={setWorkspaceOpen}
              onQueryChange={setWorkspaceQuery}
              onProjectChange={(id) => {
                if (id === "new-project") {
                  setRoute({ project: "", view: "setup" });
                } else {
                  setRoute({ project: id });
                }
                setWorkspaceOpen(false);
                setWorkspaceQuery("");
              }}
              open={workspaceOpen}
              query={workspaceQuery}
              project={activeProject}
              projectMatches={projectMatches}
            />

            <ModuleSidebar
              activeChangelogCategory={activeChangelogCategory}
              activeChangelogStatus={activeChangelogStatus}
              activeStatus={activeStatus}
              activeView={activeView}
              changelogEntries={changelogEntries}
              feedbackPosts={feedbackPosts}
              onChangelogCategoryChange={setActiveChangelogCategory}
              onChangelogStatusChange={(status) => setActiveChangelogStatus(status)}
              onStatusChange={(status) => setRoute({ status, view: activeView })}
              onViewChange={(view) => setRoute({ view })}
              activeRoadmap={activeRoadmap}
              activeSettingsSection={activeSettingsSection}
              onRoadmapChange={(roadmap) => setRoute({ roadmap, status: "all", view: "roadmap" })}
              onSettingsSectionChange={(section) => setActiveSettingsSection(section)}
              roadmapViews={roadmapViews}
            />
          </div>
        </aside>

        <section className="min-h-0 overflow-auto">
          {selectedRoadmap && (activeView === "posts" || activeView === "roadmap") ? (
            <RoadmapDetailWorkspace
              item={selectedRoadmap}
              onBack={() => setSelectedRoadmapKey(null)}
              onOpenFeedback={(stableKey) => {
                setSelectedRoadmapKey(null);
                setSelectedFeedbackKey(stableKey);
              }}
              onVote={async (item) => {
                if (workspace.id === fallbackWorkspace.id) {
                  throw new Error("Create a project before voting on roadmap items.");
                }
                await voteRoadmap({
                  roadmapKey: item.stableKey,
                  ...mutationScope,
                });
              }}
            />
          ) : selectedFeedback && (activeView === "posts" || activeView === "roadmap") ? (
            <FeedbackDetailWorkspace
              post={selectedFeedback}
              onBack={() => setSelectedFeedbackKey(null)}
              onAddNote={async (note) => {
                if (workspace.id === fallbackWorkspace.id) {
                  throw new Error("Create a project before adding notes.");
                }
                await recordFeedbackInteraction({
                  body: note,
                  feedbackKey: selectedFeedback.stableKey,
                  kind: "comment",
                  source: "rest",
                  ...mutationScope,
                });
                toast.success("Feedback note added");
              }}
            />
          ) : selectedChangelog && activeView === "changelog" ? (
            <ChangelogEditorWorkspace
              entry={selectedChangelog}
              onClose={() => setSelectedChangelogKey(null)}
              onSave={async (payload) => {
                if (workspace.id === fallbackWorkspace.id) {
                  throw new Error("Create a project before editing changelogs.");
                }
                await upsertChangelog({
                  ...payload,
                  ...mutationScope,
                });
                toast.success("Changelog updated");
                setSelectedChangelogKey(null);
              }}
            />
          ) : (
            <>
              <DashboardHeader
                activeBoard={activeBoard}
                activeChangelogCategory={activeChangelogCategory}
                activeChangelogStatus={activeChangelogStatus}
                activeRoadmap={activeRoadmap}
                activeStatus={activeStatus}
                activeView={activeView}
                changelogCategories={changelogCategoryFilters(changelogEntries)}
                itemCount={
                  activeView === "posts"
                    ? scopedPosts.length
                    : activeView === "roadmap"
                      ? scopedRoadmapEntries.length
                      : activeView === "changelog"
                        ? scopedChangelogEntries.length
                        : undefined
                }
                onSearchChange={(q) => setRoute({ q })}
                onCreate={() => setComposerOpen(true)}
                onChangelogCategoryChange={setActiveChangelogCategory}
                onChangelogStatusChange={setActiveChangelogStatus}
                onStatusChange={(status) => setRoute({ status, view: activeView })}
                project={activeProject}
                searchQuery={searchQuery}
                workspace={workspace}
              />

              {activeView === "posts" ? (
                <PostsWorkspace
                  activeBoard={activeBoard}
                  activeStatus={activeStatus}
                  onOpenFeedback={(post) => {
                    if (post.sourceRoadmapKey) {
                      setSelectedRoadmapKey(post.sourceRoadmapKey);
                      return;
                    }
                    setSelectedFeedbackKey(post.stableKey);
                  }}
                  posts={scopedPosts}
                />
              ) : null}
              {activeView === "roadmap" ? (
                <RoadmapWorkspace
                  activeStatus={activeStatus}
                  entries={scopedRoadmapEntries}
                  onAdd={(status) => {
                    setRoadmapCreateStatus(status);
                    setComposerOpen(true);
                  }}
                  onMove={(item, status) => {
                    if (workspace.id === fallbackWorkspace.id) {
                      toast.error({
                        title: "Choose a project first",
                        description:
                          "Roadmap changes need a real project so the item can be saved to the right data set.",
                      });
                      return;
                    }
                    const nextStatus = roadmapStatusToPortalStatus(status);
                    void upsertRoadmap({
                      description: item.description || item.impact || item.title,
                      impact: item.impact || item.description || item.title,
                      priority: normalizedPriority(item.priority),
                      stableKey: persistedRoadmapKey(item),
                      status: nextStatus,
                      title: item.title,
                      ...mutationScope,
                      ...(item.target ? { target: item.target } : {}),
                    }).catch((error: unknown) =>
                      toast.error({
                        title: "Could not move roadmap item",
                        description: errorMessage(
                          error,
                          `The item "${item.title}" could not be moved to ${statusMeta[status].label}. Refresh the project and try again.`,
                        ),
                      }),
                    );
                  }}
                  onOpenItem={(item) => {
                    const feedbackKey = sourceFeedbackKey(item);
                    if (feedbackKey) {
                      setSelectedFeedbackKey(feedbackKey);
                      return;
                    }
                    setSelectedRoadmapKey(item.stableKey);
                  }}
                  onVote={(item) => {
                    const feedbackKey = sourceFeedbackKey(item);
                    if (feedbackKey) {
                      return recordFeedbackInteraction({
                        feedbackKey,
                        kind: "vote",
                        source: "rest",
                        ...mutationScope,
                      });
                    }
                    return voteRoadmap({
                      roadmapKey: item.stableKey,
                      ...mutationScope,
                    });
                  }}
                />
              ) : null}
              {activeView === "changelog" ? (
                <ChangelogWorkspace
                  entries={scopedChangelogEntries}
                  onOpen={(entry) => setSelectedChangelogKey(entry.stableKey)}
                />
              ) : null}
              {activeView === "settings" ? (
                <SettingsWorkspace
                  activeProject={activeProject}
                  activeSection={activeSettingsSection}
                  workspace={workspace}
                />
              ) : null}
              {activeView === "setup" ? (
                <OnboardingWorkspace
                  existingProject={activeProjectNeedsSource ? activeProject : undefined}
                  workspace={workspace}
                  onCreated={(projectSlug: string, workspaceSlug?: string) =>
                    setRoute({
                      project: projectSlug,
                      view: "posts",
                      workspace: workspaceSlug ?? workspace.id,
                    })
                  }
                />
              ) : null}
            </>
          )}
        </section>
      </div>

      <ComposerModal
        initialBoard={
          activeView === "changelog"
            ? "Changelog"
            : activeView === "roadmap"
              ? "Feature Request"
              : "Customer Feedback"
        }
        initialStatus={roadmapStatusToComposerStatus(roadmapCreateStatus)}
        open={composerOpen}
        onClose={() => {
          setComposerOpen(false);
          setRoadmapCreateStatus(null);
        }}
        onSubmit={handleComposerSubmit}
      />
    </main>
  );
}

function WorkspaceSwitcher({
  menuRef,
  onAddProject,
  onOpenChange,
  onProjectChange,
  onQueryChange,
  open,
  project,
  projectMatches,
  query,
}: {
  menuRef: React.RefObject<HTMLDivElement | null>;
  onAddProject: () => void;
  onOpenChange: (open: boolean) => void;
  onProjectChange: (id: string) => void;
  onQueryChange: (query: string) => void;
  open: boolean;
  project: ProjectMenuItem;
  projectMatches: ProjectMenuItem[];
  query: string;
}) {
  return (
    <div ref={menuRef} className="relative border-b border-border p-3">
      <button
        type="button"
        className="flex min-h-10 w-full items-center justify-between gap-3 p-2 text-left transition-[background-color,scale] duration-200 hover:bg-muted/40 active:scale-[0.96]"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        <span className="grid size-9 shrink-0 place-items-center overflow-hidden border border-border bg-muted text-xs font-semibold">
          {project.logoUrl ? (
            <img alt="" className="size-full object-cover" src={project.logoUrl} />
          ) : (
            project.initials
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{project.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{project.repo}</span>
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>

      {open ? (
        <div
          className="t-dropdown is-open absolute left-3 right-3 top-[calc(100%-0.25rem)] z-40 border border-border bg-popover p-2 shadow-[0_18px_60px_rgb(0_0_0/0.55)]"
          data-origin="top-left"
        >
          <label className="relative block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search projects"
              className="h-9 border-border bg-background pl-8 text-xs"
            />
          </label>
          <div className="mt-2 grid gap-1">
            {projectMatches.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "grid min-h-10 gap-1 px-2 py-2 text-left text-xs text-muted-foreground transition-[background-color,color,scale] duration-200 hover:bg-muted hover:text-foreground active:scale-[0.96]",
                  item.id === project.id && "bg-muted text-foreground",
                )}
                onClick={() => onProjectChange(item.id)}
              >
                <span className="font-semibold">{item.name}</span>
                <span className="truncate">{item.repo}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 flex h-9 w-full items-center gap-2 border border-border px-2 text-xs font-semibold text-muted-foreground transition-[background-color,color,scale] duration-200 hover:bg-muted hover:text-foreground active:scale-[0.96]"
            onClick={onAddProject}
          >
            <Plus className="size-3.5" />
            Add project
          </button>
        </div>
      ) : null}
    </div>
  );
}

function IconRail({
  activeView,
  onViewChange,
}: {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}) {
  const railItems: Array<[DashboardView, ReactElement, string]> = [
    ["posts", <Inbox />, "Feedback"],
    ["roadmap", <ClipboardList />, "Roadmap"],
    ["changelog", <Megaphone />, "Changelog"],
  ];

  return (
    <aside className="hidden border-r border-border bg-background lg:flex lg:flex-col lg:items-center lg:py-3">
      <button
        type="button"
        aria-label="Dashboard"
        className="grid size-9 place-items-center border border-border bg-muted text-foreground transition-[background-color,scale] duration-200 hover:bg-foreground hover:text-background active:scale-[0.96]"
        onClick={() => onViewChange("posts")}
      >
        <BrandMark decorative size="sm" variant="mono" />
      </button>
      <nav className="mt-6 grid gap-2">
        {railItems.map(([view, icon, label]) => (
          <RailButton
            key={view}
            active={activeView === view}
            icon={icon}
            label={label}
            onClick={() => onViewChange(view)}
          />
        ))}
      </nav>
      <div className="mt-auto grid gap-2">
        <RailButton
          active={activeView === "settings"}
          icon={<Settings />}
          label="Settings"
          onClick={() => onViewChange("settings")}
        />
      </div>
    </aside>
  );
}

function RailButton({
  active,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: ReactElement;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "group relative grid size-10 place-items-center text-muted-foreground transition-[background-color,color,scale] duration-200 hover:bg-muted hover:text-foreground active:scale-[0.96] [&_svg]:size-4",
        active && "bg-muted text-foreground",
      )}
      onClick={onClick}
    >
      {icon}
      <span className="pointer-events-none absolute left-[calc(100%+0.5rem)] top-1/2 z-50 -translate-y-1/2 scale-95 border border-border bg-popover px-2 py-1 text-xs font-semibold text-foreground opacity-0 shadow-[0_12px_40px_rgb(0_0_0/0.4)] transition-[opacity,scale] duration-150 group-hover:scale-100 group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}

function ModuleSidebar({
  activeChangelogCategory,
  activeChangelogStatus,
  activeRoadmap,
  activeSettingsSection,
  activeStatus,
  activeView,
  changelogEntries,
  feedbackPosts,
  onChangelogCategoryChange,
  onChangelogStatusChange,
  onRoadmapChange,
  onSettingsSectionChange,
  onStatusChange,
  onViewChange,
  roadmapViews,
}: {
  activeChangelogCategory: string;
  activeChangelogStatus: ChangelogStatusFilter;
  activeRoadmap: RoadmapView;
  activeSettingsSection: SettingsSection;
  activeStatus: RoadmapStatus | "all";
  activeView: DashboardView;
  changelogEntries: DashboardChangelog[];
  feedbackPosts: Post[];
  onChangelogCategoryChange: (category: string) => void;
  onChangelogStatusChange: (status: ChangelogStatusFilter) => void;
  onRoadmapChange: (roadmap: RoadmapViewId) => void;
  onSettingsSectionChange: (section: SettingsSection) => void;
  onStatusChange: (status: RoadmapStatus | "all") => void;
  onViewChange: (view: DashboardView) => void;
  roadmapViews: RoadmapView[];
}) {
  if (activeView === "roadmap") {
    return (
      <SidebarFrame>
        <SidebarTitle title="Roadmap" />
        <SidebarSection title="Roadmaps">
          {roadmapViews.map((roadmap) => (
            <SidebarItem
              key={roadmap.id}
              active={activeRoadmap.id === roadmap.id}
              icon={<ClipboardList />}
              label={roadmap.name}
              value={String(roadmap.entries.length)}
              onClick={() => onRoadmapChange(roadmap.id)}
            />
          ))}
        </SidebarSection>
        <SidebarSection title="Columns">
          <SidebarItem
            active={activeStatus === "all"}
            icon={<CircleDashed />}
            label="All columns"
            value={String(activeRoadmap.entries.length)}
            onClick={() => onStatusChange("all")}
          />
          {Object.entries(statusMeta).map(([status, meta]) => (
            <SidebarItem
              key={status}
              active={activeStatus === status}
              icon={meta.icon}
              label={meta.label}
              value={String(
                activeRoadmap.entries.filter(
                  (item) => roadmapStatusToRoadmapStatus(item.status) === status,
                ).length,
              )}
              onClick={() => onStatusChange(status as RoadmapStatus)}
            />
          ))}
        </SidebarSection>
      </SidebarFrame>
    );
  }

  if (activeView === "changelog") {
    const allCount = changelogEntries.length;
    const publishedCount = changelogEntries.filter((entry) => entry.status === "published").length;
    const draftCount = changelogEntries.filter((entry) => entry.status === "draft").length;
    const reviewCount = changelogEntries.filter((entry) => entry.status === "in_review").length;
    const scheduledCount = changelogEntries.filter((entry) => entry.status === "scheduled").length;
    return (
      <SidebarFrame>
        <SidebarTitle title="Changelog" />
        <SidebarSection title="Status">
          <SidebarItem
            active={activeChangelogStatus === "all"}
            icon={<CircleDashed />}
            label="All changelogs"
            value={String(allCount)}
            onClick={() => onChangelogStatusChange("all")}
          />
          <SidebarItem
            active={activeChangelogStatus === "published"}
            icon={<Radio />}
            label="Published"
            value={String(publishedCount)}
            onClick={() => onChangelogStatusChange("published")}
          />
          <SidebarItem
            active={activeChangelogStatus === "draft"}
            icon={<BookOpen />}
            label="Draft"
            value={String(draftCount)}
            onClick={() => onChangelogStatusChange("draft")}
          />
          <SidebarItem
            active={activeChangelogStatus === "in_review"}
            icon={<Circle />}
            label="In review"
            value={String(reviewCount)}
            onClick={() => onChangelogStatusChange("in_review")}
          />
          <SidebarItem
            active={activeChangelogStatus === "scheduled"}
            icon={<CalendarClock />}
            label="Scheduled"
            value={String(scheduledCount)}
            onClick={() => onChangelogStatusChange("scheduled")}
          />
        </SidebarSection>
        <SidebarSection title="Categories">
          <SidebarItem
            active={activeChangelogCategory === "all"}
            icon={<CircleDashed />}
            label="All categories"
            value={String(changelogEntries.length)}
            onClick={() => onChangelogCategoryChange("all")}
          />
          {changelogCategories(changelogEntries).map(({ label, value }) => (
            <SidebarItem
              key={label}
              active={activeChangelogCategory === stateValue(label)}
              icon={<Circle />}
              label={label}
              value={String(value)}
              onClick={() => onChangelogCategoryChange(stateValue(label))}
            />
          ))}
        </SidebarSection>
      </SidebarFrame>
    );
  }

  if (activeView === "settings" || activeView === "setup") {
    if (activeView === "setup") {
      return (
        <SidebarFrame>
          <SidebarTitle title="Setup" />
          <SidebarSection title="Project">
            <SidebarItem
              active
              icon={<GitPullRequestArrow />}
              label="Connect source"
              onClick={() => onViewChange("setup")}
            />
          </SidebarSection>
        </SidebarFrame>
      );
    }

    return (
      <SidebarFrame>
        <SidebarTitle title="Settings" />
        <SidebarSection title="Project settings">
          <SidebarItem
            active={activeSettingsSection === "general"}
            icon={<Settings />}
            label="General"
            onClick={() => onSettingsSectionChange("general")}
          />
          <SidebarItem
            active={activeSettingsSection === "services"}
            icon={<GitPullRequestArrow />}
            label="Connected services"
            onClick={() => onSettingsSectionChange("services")}
          />
          <SidebarItem
            active={activeSettingsSection === "portal"}
            icon={<Globe />}
            label="Public portal"
            onClick={() => onSettingsSectionChange("portal")}
          />
          <SidebarItem
            active={activeSettingsSection === "automation"}
            icon={<DatabaseZap />}
            label="Automation"
            onClick={() => onSettingsSectionChange("automation")}
          />
          <SidebarItem
            active={activeSettingsSection === "accounts"}
            icon={<Users />}
            label="Accounts"
            onClick={() => onSettingsSectionChange("accounts")}
          />
        </SidebarSection>
      </SidebarFrame>
    );
  }

  return (
    <SidebarFrame>
      <SidebarTitle title="Feedback" />
      <SidebarSection title="Statuses">
        <SidebarItem
          active={activeStatus === "all"}
          icon={<CircleDashed />}
          label="All feedback"
          value={String(feedbackPosts.length)}
          onClick={() => onStatusChange("all")}
        />
        {Object.entries(statusMeta).map(([status, meta]) => (
          <SidebarItem
            key={status}
            active={activeStatus === status}
            icon={meta.icon}
            label={meta.label}
            value={String(feedbackPosts.filter((post) => post.status === status).length)}
            onClick={() => onStatusChange(status as RoadmapStatus)}
          />
        ))}
      </SidebarSection>
      <SidebarSection title="Board">
        <SidebarItem
          active
          icon={<MessageSquareText />}
          label="Feedback"
          value={String(feedbackPosts.length)}
          onClick={() => onStatusChange("all")}
        />
      </SidebarSection>
    </SidebarFrame>
  );
}

function SidebarFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex-1">{children}</div>
    </div>
  );
}

function SidebarTitle({ action, title }: { action?: ReactNode; title: string }) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-3 border-b border-border px-4">
      <h2 className="truncate text-xl font-semibold">{title}</h2>
      {action ? (
        <button
          type="button"
          className="grid size-9 place-items-center border border-border text-muted-foreground transition-[border-color,color,scale] duration-200 hover:border-foreground hover:text-foreground active:scale-[0.96]"
          aria-label={`${title} action`}
        >
          {action}
        </button>
      ) : null}
    </div>
  );
}

function DashboardHeader({
  activeBoard,
  activeChangelogCategory,
  activeChangelogStatus,
  activeRoadmap,
  activeStatus,
  activeView,
  changelogCategories,
  itemCount,
  onSearchChange,
  onCreate,
  onChangelogCategoryChange,
  onChangelogStatusChange,
  onStatusChange,
  project,
  searchQuery,
  workspace,
}: {
  activeBoard: Board;
  activeChangelogCategory: string;
  activeChangelogStatus: ChangelogStatusFilter;
  activeRoadmap: RoadmapView;
  activeStatus: RoadmapStatus | "all";
  activeView: DashboardView;
  changelogCategories: string[];
  itemCount?: number;
  onSearchChange: (query: string) => void;
  onCreate: () => void;
  onChangelogCategoryChange: (category: string) => void;
  onChangelogStatusChange: (status: ChangelogStatusFilter) => void;
  onStatusChange: (status: RoadmapStatus | "all") => void;
  project: ProjectMenuItem;
  searchQuery: string;
  workspace: Workspace;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchableViews = new Set<DashboardView>(["posts", "roadmap", "changelog"]);
  const showSearch = searchableViews.has(activeView);
  const sourceLabel = project.sourceReady ? project.repo : workspace.repo;
  const portalLabel = project.id === "new-project" ? workspace.portal : project.portal;
  const title =
    activeView === "posts"
      ? activeStatus === "all"
        ? "Posts"
        : statusTitle(activeStatus)
      : activeView === "roadmap"
        ? activeRoadmap.name
        : activeView === "changelog"
          ? "Changelogs"
          : activeView === "setup"
            ? "Create project"
            : viewTitle(activeView);
  const titleWithCount =
    typeof itemCount === "number" && activeView !== "settings" && activeView !== "setup"
      ? `${title} (${itemCount})`
      : title;
  const sortLabel =
    activeView === "roadmap"
      ? "Top upvoted"
      : activeView === "changelog"
        ? "Recent changelogs"
        : "Recent posts";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold leading-tight">{titleWithCount}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{sourceLabel}</span>
            <span>{portalLabel}</span>
            {activeView === "posts" ? <span>{activeBoard.name}</span> : null}
          </div>
        </div>

        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center">
          {showSearch ? (
            <label className="relative min-w-0 sm:w-52">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`Search ${viewTitle(activeView).toLowerCase()}`}
                className="h-10 pl-9 text-xs"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </label>
          ) : null}
          {showSearch ? (
            <>
              <button
                type="button"
                className={cn(
                  "inline-flex h-10 items-center gap-2 border px-3 text-xs font-semibold transition-[border-color,color,scale] hover:border-foreground hover:text-foreground active:scale-[0.96]",
                  filtersOpen
                    ? "border-foreground text-foreground"
                    : "border-border text-muted-foreground",
                )}
                onClick={() => setFiltersOpen((open) => !open)}
              >
                <CircleDashed className="size-3.5" />
                Filters
              </button>
              <button
                type="button"
                className="inline-flex h-10 min-w-40 items-center justify-between gap-3 border border-border px-3 text-xs font-semibold text-muted-foreground transition-[border-color,color,scale] hover:border-foreground hover:text-foreground active:scale-[0.96]"
              >
                {sortLabel}
                <ChevronDown className="size-3.5" />
              </button>
            </>
          ) : null}
          {showSearch && filtersOpen ? (
            <FilterMenu
              activeChangelogCategory={activeChangelogCategory}
              activeChangelogStatus={activeChangelogStatus}
              activeStatus={activeStatus}
              activeView={activeView}
              categories={changelogCategories}
              onChangelogCategoryChange={(category) => {
                onChangelogCategoryChange(category);
                setFiltersOpen(false);
              }}
              onChangelogStatusChange={(status) => {
                onChangelogStatusChange(status);
                setFiltersOpen(false);
              }}
              onStatusChange={(status) => {
                onStatusChange(status);
                setFiltersOpen(false);
              }}
            />
          ) : null}
          {activeView === "posts" ? (
            <Button
              type="button"
              className="h-10 border border-foreground bg-foreground px-4 text-xs font-semibold text-background transition-[background-color,color,scale] duration-200 hover:bg-background hover:text-foreground active:scale-[0.96]"
              onClick={onCreate}
            >
              <Plus data-icon="inline-start" />
              New feedback
            </Button>
          ) : null}
          {activeView === "changelog" ? (
            <Button
              type="button"
              className="h-10 border border-foreground bg-foreground px-4 text-xs font-semibold text-background transition-[background-color,color,scale] duration-200 hover:bg-background hover:text-foreground active:scale-[0.96]"
              onClick={onCreate}
            >
              <Plus data-icon="inline-start" />
              New changelog
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function FilterMenu({
  activeChangelogCategory,
  activeChangelogStatus,
  activeStatus,
  activeView,
  categories,
  onChangelogCategoryChange,
  onChangelogStatusChange,
  onStatusChange,
}: {
  activeChangelogCategory: string;
  activeChangelogStatus: ChangelogStatusFilter;
  activeStatus: RoadmapStatus | "all";
  activeView: DashboardView;
  categories: string[];
  onChangelogCategoryChange: (category: string) => void;
  onChangelogStatusChange: (status: ChangelogStatusFilter) => void;
  onStatusChange: (status: RoadmapStatus | "all") => void;
}) {
  const changelogStatuses: Array<[ChangelogStatusFilter, string, ReactElement]> = [
    ["all", "All changelogs", <CircleDashed key="all" />],
    ["published", "Published", <Radio key="published" />],
    ["draft", "Draft", <BookOpen key="draft" />],
    ["in_review", "In review", <Circle key="in_review" />],
    ["scheduled", "Scheduled", <CalendarClock key="scheduled" />],
  ];

  return (
    <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-72 border border-border bg-popover p-2 shadow-[0_18px_60px_rgb(0_0_0/0.45)]">
      {activeView === "changelog" ? (
        <div className="grid gap-2">
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Status
          </p>
          {changelogStatuses.map(([status, label, icon]) => (
            <FilterMenuItem
              key={status}
              active={activeChangelogStatus === status}
              icon={icon}
              label={label}
              onClick={() => onChangelogStatusChange(status)}
            />
          ))}
          <div className="my-1 border-t border-border" />
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Category
          </p>
          <FilterMenuItem
            active={activeChangelogCategory === "all"}
            icon={<CircleDashed />}
            label="All categories"
            onClick={() => onChangelogCategoryChange("all")}
          />
          {categories.map((category) => (
            <FilterMenuItem
              key={category}
              active={activeChangelogCategory === category}
              icon={<TagIcon />}
              label={formatState(category)}
              onClick={() => onChangelogCategoryChange(category)}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-2">
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Status
          </p>
          <FilterMenuItem
            active={activeStatus === "all"}
            icon={<CircleDashed />}
            label={activeView === "roadmap" ? "All columns" : "All feedback"}
            onClick={() => onStatusChange("all")}
          />
          {Object.entries(statusMeta).map(([status, meta]) => (
            <FilterMenuItem
              key={status}
              active={activeStatus === status}
              icon={meta.icon}
              label={meta.label}
              onClick={() => onStatusChange(status as RoadmapStatus)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterMenuItem({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactElement;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-9 items-center gap-3 px-2 text-left text-xs font-semibold transition-[background-color,color,scale] hover:bg-muted hover:text-foreground active:scale-[0.98]",
        active ? "bg-muted text-foreground" : "text-muted-foreground",
      )}
      onClick={onClick}
    >
      <span className="[&_svg]:size-3.5">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function AgentWorkspace({
  dashboard,
  workspace,
}: {
  dashboard: DashboardOverview | undefined;
  workspace: Workspace;
}) {
  const runAgent = useAction(runProactiveAgentAction);
  const upsertIntegration = useMutation(upsertIntegrationConnectionMutation);
  const updateReview = useMutation(updateReviewStatusMutation);
  const revertDecision = useMutation(revertAutomationDecisionMutation);
  const [running, setRunning] = useState(false);
  const [savingChannel, setSavingChannel] = useState("");
  const [savingReview, setSavingReview] = useState("");
  const [revertingDecision, setRevertingDecision] = useState(false);
  const channels = dashboard?.channels ?? [];
  const activity = dashboard?.agentActivity ?? [];
  const decisions = dashboard?.automationDecisions ?? [];
  const reviews = dashboard?.reviewQueue ?? [];
  const sources = dashboard?.sourceEvents ?? [];
  const latestReview = reviews.find((item) => item.status === "needs_review") ?? reviews[0];
  const latestDecision = decisions[0];
  const connectedChannels = channels.filter((channel) => channel.state === "connected").length;
  const inputChannels = channels.filter((channel) => channel.kind === "input");
  const canRun = workspace.id !== fallbackWorkspace.id;
  const agentScope = workspace.id === fallbackWorkspace.id ? {} : { workspaceSlug: workspace.id };

  return (
    <div className="t-panel-slide min-h-[calc(100svh-5.5rem)]" data-open="true">
      <div className="grid min-h-[calc(100svh-5.5rem)] xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="min-w-0 border-r border-border">
          <div className="grid border-b border-border md:grid-cols-4">
            <AgentMetric label="Input channels" value={inputChannels.length} />
            <AgentMetric label="Connected" value={connectedChannels} />
            <AgentMetric label="Decisions" value={decisions.length} />
            <AgentMetric
              label="Needs review"
              value={reviews.filter((review) => review.status === "needs_review").length}
            />
          </div>

          <div className="border-b border-border p-4 md:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Proactive agent
                </p>
                <h2 className="mt-3 text-2xl font-semibold leading-tight">
                  Watch channels, link source evidence, queue risky work.
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  This is the working surface for the background agent. Channels bring in signals;
                  integrations provide context or delivery; every automated move lands in the ledger
                  before public changes go out.
                </p>
              </div>
              <Button
                className="h-10 border border-foreground bg-foreground px-4 text-xs font-semibold text-background transition-[background-color,color,scale] duration-200 hover:bg-background hover:text-foreground active:scale-[0.96]"
                disabled={!canRun || running}
                onClick={() => {
                  setRunning(true);
                  void runAgent(agentScope)
                    .then((result) => {
                      const count =
                        typeof result === "object" && result && "count" in result
                          ? Number((result as { count?: number }).count ?? 0)
                          : 0;
                      const run = result as {
                        error?: string;
                        provider?: string;
                        providerConfigured?: boolean;
                      };
                      const providerLabel = run.providerConfigured
                        ? (run.provider ?? "configured provider")
                        : "local fallback";
                      const fallbackNote = run.error ? `, fallback used: ${run.error}` : "";
                      toast.success(
                        `Agent run saved ${count} decision${count === 1 ? "" : "s"} via ${providerLabel}${fallbackNote}`,
                      );
                    })
                    .catch((error: unknown) => {
                      toast.error({
                        title: "Agent run failed",
                        description: errorMessage(
                          error,
                          "The proactive agent could not read this workspace or save its decisions. Check the connected source and try again.",
                        ),
                      });
                    })
                    .finally(() => setRunning(false));
                }}
              >
                <Sparkles data-icon="inline-start" />
                {running ? "Running agent..." : "Run agent"}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 p-4 md:p-6">
            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">Channels and integrations</h3>
                <span className="text-xs text-muted-foreground">{channels.length} configured</span>
              </div>
              <div className="grid overflow-hidden border border-border bg-card lg:grid-cols-2">
                {channels.length > 0 ? (
                  channels.map((channel) => (
                    <div
                      key={channel.id}
                      className="grid gap-2 border-b border-border p-4 last:border-b-0 lg:border-r lg:[&:nth-child(even)]:border-r-0"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{channel.label}</p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                            {channel.detail}
                          </p>
                        </div>
                        <span className="shrink-0 border border-border bg-muted/25 px-2 py-1 text-xs text-muted-foreground">
                          {channel.kind}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="border border-border bg-background px-2 py-1">
                          {formatState(channel.state)}
                        </span>
                        <span className="border border-border bg-background px-2 py-1">
                          {formatState(channel.health)}
                        </span>
                        <span className="border border-border bg-background px-2 py-1">
                          {channel.signalCount} signals
                        </span>
                      </div>
                      {isConfigurableProvider(channel.provider) ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            className="h-8 border border-border px-2 text-xs font-semibold text-muted-foreground transition-[border-color,color,scale] hover:border-foreground hover:text-foreground active:scale-[0.96]"
                            disabled={savingChannel === channel.id || !canRun}
                            onClick={() => {
                              setSavingChannel(channel.id);
                              void upsertIntegration({
                                direction: channel.kind === "context" ? "inbound" : "bidirectional",
                                displayName: channel.label,
                                provider: channel.provider,
                                state: channel.state === "connected" ? "attention" : "connected",
                                workspaceSlug: workspace.id,
                              })
                                .then(() =>
                                  toast.success(
                                    `${channel.label} marked ${channel.state === "connected" ? "attention" : "connected"}`,
                                  ),
                                )
                                .catch((error: unknown) =>
                                  toast.error({
                                    title: "Channel update failed",
                                    description: errorMessage(
                                      error,
                                      `${channel.label} could not be marked ${channel.state === "connected" ? "attention" : "connected"}. Refresh the workspace and try again.`,
                                    ),
                                  }),
                                )
                                .finally(() => setSavingChannel(""));
                            }}
                          >
                            {channel.state === "connected" ? "Needs attention" : "Mark connected"}
                          </button>
                          <button
                            type="button"
                            className="h-8 border border-border px-2 text-xs font-semibold text-muted-foreground transition-[border-color,color,scale] hover:border-foreground hover:text-foreground active:scale-[0.96]"
                            disabled={savingChannel === channel.id || !canRun}
                            onClick={() => {
                              setSavingChannel(channel.id);
                              void upsertIntegration({
                                direction: channel.kind === "context" ? "inbound" : "bidirectional",
                                displayName: channel.label,
                                provider: channel.provider,
                                state: "disabled",
                                workspaceSlug: workspace.id,
                              })
                                .then(() => toast.success(`${channel.label} disabled`))
                                .catch((error: unknown) =>
                                  toast.error({
                                    title: "Channel update failed",
                                    description: errorMessage(
                                      error,
                                      `${channel.label} could not be disabled. Refresh the workspace and try again.`,
                                    ),
                                  }),
                                )
                                .finally(() => setSavingChannel(""));
                            }}
                          >
                            Disable
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <EmptyModule
                    action="Create project"
                    copy="Create a project and connect the first channel before the agent can observe signals."
                    icon={<PlugIcon />}
                    onAction={() => undefined}
                    title="No channels yet"
                  />
                )}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">Agent activity</h3>
                <span className="text-xs text-muted-foreground">
                  {activity.length} recent events
                </span>
              </div>
              <div className="overflow-hidden border border-border bg-card">
                {activity.length > 0 ? (
                  activity.map((item) => (
                    <article
                      key={`${item.kind}-${item.id}`}
                      className="grid gap-3 border-b border-border p-4 last:border-b-0 md:grid-cols-[8rem_minmax(0,1fr)_9rem] md:items-center"
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ActivityIcon kind={item.kind} />
                        {formatState(item.kind)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {item.summary}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground md:text-right">
                        <p>{formatState(item.state)}</p>
                        <p className="mt-1">{formatDate(item.timestamp)}</p>
                      </div>
                    </article>
                  ))
                ) : (
                  <EmptyModule
                    copy="The agent ledger will fill as channels receive feedback, GitHub work ships, or you run the agent."
                    icon={<Sparkles />}
                    title="No agent activity yet"
                  />
                )}
              </div>
            </section>
          </div>
        </section>

        <aside className="grid h-fit gap-4 p-4 md:p-6">
          <SettingsPanel icon={<ClipboardList />} title="Current review">
            {latestReview ? (
              <div className="grid gap-4">
                <InspectorBlock
                  meta={formatState(latestReview.status)}
                  sourceLinks={latestReview.sourceLinks}
                  summary={latestReview.summary}
                  title={latestReview.title}
                />
                <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                  {(["approved", "changes_requested", "published"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      className="h-9 border border-border px-3 text-xs font-semibold text-muted-foreground transition-[border-color,color,scale] hover:border-foreground hover:text-foreground active:scale-[0.96]"
                      disabled={!latestReview.recordId || savingReview === status}
                      onClick={() => {
                        setSavingReview(status);
                        void updateReview({
                          note:
                            status === "changes_requested"
                              ? "Needs another pass before the agent can apply this."
                              : "Approved from the agent command center.",
                          reviewItemId: latestReview.recordId,
                          reviewerName: "Dashboard reviewer",
                          status,
                          workspaceSlug: workspace.id,
                        })
                          .then(() => toast.success(`Review marked ${formatState(status)}`))
                          .catch((error: unknown) =>
                            toast.error({
                              title: "Review update failed",
                              description: errorMessage(
                                error,
                                "The review status could not be saved. Open the review again and retry.",
                              ),
                            }),
                          )
                          .finally(() => setSavingReview(""));
                      }}
                    >
                      {formatState(status)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                Public copy, low-confidence matches, and notification blasts will appear here before
                they ship.
              </p>
            )}
          </SettingsPanel>

          <SettingsPanel icon={<DatabaseZap />} title="Latest decision">
            {latestDecision ? (
              <div className="grid gap-4">
                <InspectorBlock
                  meta={`${Math.round(latestDecision.confidence * 100)}% confidence / ${formatState(latestDecision.outcome)}`}
                  sourceLinks={latestDecision.sourceLinks}
                  summary={latestDecision.summary}
                  title={formatState(latestDecision.action)}
                />
                {latestDecision.recordId && latestDecision.outcome === "applied" ? (
                  <button
                    type="button"
                    className="h-9 border border-border px-3 text-xs font-semibold text-muted-foreground transition-[border-color,color,scale] hover:border-foreground hover:text-foreground active:scale-[0.96]"
                    disabled={revertingDecision}
                    onClick={() => {
                      if (!latestDecision.recordId) return;
                      setRevertingDecision(true);
                      void revertDecision({
                        decisionId: latestDecision.recordId,
                        workspaceSlug: workspace.id,
                      })
                        .then(() => toast.success("Decision reverted to review state"))
                        .catch((error: unknown) =>
                          toast.error({
                            title: "Decision revert failed",
                            description: errorMessage(
                              error,
                              "The automation decision could not be reverted. It may have already changed or been removed.",
                            ),
                          }),
                        )
                        .finally(() => setRevertingDecision(false));
                    }}
                  >
                    {revertingDecision ? "Reverting..." : "Revert decision"}
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                Run the agent after a channel has source evidence or customer signals.
              </p>
            )}
          </SettingsPanel>

          <SettingsPanel icon={<GitPullRequestArrow />} title="Source evidence">
            <div className="grid gap-2">
              {sources.slice(0, 4).map((source) => (
                <a
                  key={source.recordId ?? source.externalId}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="grid gap-1 border border-border bg-background p-3 text-xs transition-[border-color,color] hover:border-foreground"
                >
                  <span className="truncate font-semibold">{source.title}</span>
                  <span className="truncate text-muted-foreground">
                    {providerLabel(source.provider)} / {formatState(source.kind)}
                  </span>
                </a>
              ))}
              {sources.length === 0 ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  Connect GitHub or submit channel feedback to give the agent evidence.
                </p>
              ) : null}
            </div>
          </SettingsPanel>

          <SettingsPanel icon={<Code2 />} title="Setup checklist">
            <StatusRow label="GitHub source channel" value="Connect repo or app install" />
            <StatusRow label="Feedback board" value="Built in channel" />
            <StatusRow label="SDK install" value="Customer app channel" />
            <StatusRow label="Side panel" value="Embed channel" />
            <StatusRow label="Crof / Kimi" value="Server-side provider" />
            <StatusRow label="Email delivery" value="Outbound integration" />
            <StatusRow label="Custom domains" value="Portal and API hosts" />
            <StatusRow label="API security" value="Owner token and webhooks" />
            <StatusRow label="Launch gate" value="Readiness before production" />
          </SettingsPanel>
        </aside>
      </div>
    </div>
  );
}

function AgentMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-h-20 items-center justify-between gap-3 border-b border-border px-4 md:border-r md:border-b-0 md:last:border-r-0">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-2xl font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function ActivityIcon({ kind }: { kind: DashboardAgentActivity["kind"] }) {
  if (kind === "decision") return <DatabaseZap className="size-3.5" />;
  if (kind === "review") return <ClipboardList className="size-3.5" />;
  if (kind === "notification") return <Radio className="size-3.5" />;
  return <GitPullRequestArrow className="size-3.5" />;
}

function PlugIcon() {
  return <DatabaseZap />;
}

function isConfigurableProvider(provider: string) {
  return ["discord", "github", "linear", "posthog", "slack", "support", "x"].includes(provider);
}

function InspectorBlock({
  meta,
  sourceLinks,
  summary,
  title,
}: {
  meta: string;
  sourceLinks: SourceLink[];
  summary: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {meta}
      </p>
      <h4 className="mt-2 text-sm font-semibold leading-5">{title}</h4>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{summary}</p>
      <div className="mt-4 grid gap-2">
        {sourceLinks.slice(0, 3).map((link) => (
          <a
            key={link.externalId ?? link.url}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-9 items-center justify-between gap-3 border border-border bg-background px-3 text-xs text-muted-foreground transition-[border-color,color] hover:border-foreground hover:text-foreground"
          >
            <span className="truncate">{link.title}</span>
            <ExternalLink className="size-3" />
          </a>
        ))}
      </div>
    </div>
  );
}

function PostsWorkspace({
  activeBoard,
  activeStatus,
  onOpenFeedback,
  posts: scopedPosts,
}: {
  activeBoard: Board;
  activeStatus: RoadmapStatus | "all";
  onOpenFeedback: (post: Post) => void;
  posts: Post[];
}) {
  return (
    <div className="t-panel-slide min-h-[calc(100svh-5.5rem)] bg-card/40" data-open="true">
      <div className="divide-y divide-border border-b border-border">
        {scopedPosts.length > 0 ? (
          scopedPosts.map((post) => (
            <article
              key={post.id}
              className="group grid min-h-[3.75rem] gap-3 px-4 py-3 text-sm transition-[background-color] duration-150 hover:bg-muted/20 md:grid-cols-[4.25rem_minmax(0,1fr)_7rem_11rem_7rem] md:items-center md:px-6"
            >
              <span className="inline-flex items-center gap-2 text-muted-foreground tabular-nums md:border-r md:border-border">
                <ChevronDown className="size-3 rotate-180 transition-transform group-hover:-translate-y-0.5" />
                <span>{post.voters}</span>
              </span>
              <button
                type="button"
                className="min-w-0 text-left transition-[color,transform] duration-200 hover:text-foreground active:scale-[0.99]"
                onClick={() => onOpenFeedback(post)}
              >
                <span className="block truncate text-base font-semibold leading-6">
                  {post.title}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {post.source}
                </span>
              </button>
              <p className="text-muted-foreground">{post.date}</p>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/25 px-3 py-1 text-xs text-muted-foreground">
                {activeBoard.icon}
                {activeBoard.name}
              </span>
              <span className="w-fit rounded-full border border-border bg-muted/25 px-3 py-1 text-xs font-semibold text-muted-foreground">
                {statusTitle(post.status)}
              </span>
            </article>
          ))
        ) : (
          <EmptyModule
            copy={`No ${activeStatus === "all" ? activeBoard.name.toLowerCase() : statusTitle(activeStatus).toLowerCase()} yet.`}
            icon={<Inbox />}
            title="Start from real feedback"
          />
        )}
      </div>
    </div>
  );
}

function RoadmapWorkspace({
  activeStatus,
  entries,
  onAdd,
  onOpenItem,
  onMove,
  onVote,
}: {
  activeStatus: RoadmapStatus | "all";
  entries: DashboardRoadmap[];
  onAdd: (status: RoadmapStatus) => void;
  onOpenItem: (item: DashboardRoadmap) => void;
  onMove: (item: DashboardRoadmap, status: RoadmapStatus) => void;
  onVote: (item: DashboardRoadmap) => Promise<unknown>;
}) {
  const [draggingKey, setDraggingKey] = useState("");
  const [dropStatus, setDropStatus] = useState<RoadmapStatus | null>(null);
  const visibleStatuses =
    activeStatus === "all"
      ? (Object.keys(statusMeta) as RoadmapStatus[])
      : ([activeStatus] as RoadmapStatus[]);

  return (
    <div
      className="t-panel-slide min-h-[calc(100svh-5.5rem)] bg-card/40 p-3 md:p-5"
      data-open="true"
    >
      <div
        className={cn(
          "grid min-h-[calc(100svh-8rem)] gap-3",
          activeStatus === "all" ? "md:grid-cols-2 xl:grid-cols-4" : "grid-cols-1",
        )}
      >
        {visibleStatuses.map((columnStatus) => {
          const meta = statusMeta[columnStatus];
          const cards = entries.filter(
            (entry) => roadmapStatusToRoadmapStatus(entry.status) === columnStatus,
          );
          const isDropTarget = dropStatus === columnStatus;
          return (
            <section
              key={columnStatus}
              className={cn(
                "flex min-h-40 min-w-0 flex-col border border-border bg-background/60 transition-[background-color,border-color] duration-150 md:min-h-[calc(100svh-8rem)]",
                isDropTarget && "border-foreground/60 bg-muted/20",
              )}
              onDragEnter={(event) => {
                event.preventDefault();
                setDropStatus(columnStatus);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setDropStatus(columnStatus);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setDropStatus(null);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                const stableKey = event.dataTransfer.getData("text/plain") || draggingKey;
                setDropStatus(null);
                setDraggingKey("");
                const item = entries.find((entry) => entry.stableKey === stableKey);
                if (!item || roadmapStatusToRoadmapStatus(item.status) === columnStatus) return;
                onMove(item, columnStatus);
              }}
            >
              <div className="flex min-h-12 items-center justify-between gap-3 border-b border-border px-3">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                  {meta.icon}
                  {meta.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-muted text-xs text-muted-foreground tabular-nums">
                    {cards.length}
                  </span>
                  <button
                    type="button"
                    aria-label={`Add to ${meta.label}`}
                    className="grid size-7 place-items-center rounded-full border border-border text-muted-foreground transition-[border-color,color,scale] duration-200 hover:border-foreground hover:text-foreground active:scale-[0.96]"
                    onClick={() => onAdd(columnStatus)}
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid content-start gap-2 overflow-y-auto p-2.5">
                {cards.length > 0 ? (
                  cards.map((entry) => (
                    <RoadmapCard
                      key={entry.recordId ?? entry.stableKey}
                      dragging={draggingKey === entry.stableKey}
                      item={entry}
                      onDragEnd={() => {
                        setDraggingKey("");
                        setDropStatus(null);
                      }}
                      onDragStart={(itemKey, event) => {
                        setDraggingKey(itemKey);
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", itemKey);
                      }}
                      onOpenItem={onOpenItem}
                      onVote={onVote}
                    />
                  ))
                ) : (
                  <div
                    className={cn(
                      "grid min-h-40 place-items-center border border-dashed border-transparent text-center text-sm text-muted-foreground transition-[border-color,background-color]",
                      isDropTarget && "border-border bg-muted/10",
                    )}
                  >
                    <div className="text-wrap-balance">
                      <Inbox className="mx-auto size-7 opacity-50" />
                      <p className="mt-2">No {meta.label.toLowerCase()} posts</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function RoadmapCard({
  dragging,
  item,
  onDragEnd,
  onDragStart,
  onOpenItem,
  onVote,
}: {
  dragging: boolean;
  item: DashboardRoadmap;
  onDragEnd: () => void;
  onDragStart: (stableKey: string, event: ReactDragEvent<HTMLElement>) => void;
  onOpenItem: (item: DashboardRoadmap) => void;
  onVote: (item: DashboardRoadmap) => Promise<unknown>;
}) {
  const primarySource = item.sourceLinks[0];
  const [voting, setVoting] = useState(false);

  return (
    <article
      className={cn(
        "group cursor-grab border border-border bg-card p-3 transition-[background-color,border-color,opacity,transform] duration-150 hover:-translate-y-0.5 hover:border-foreground/50 hover:bg-muted/25 active:cursor-grabbing",
        dragging && "opacity-45",
      )}
      draggable
      onDragEnd={onDragEnd}
      onDragStart={(event) => onDragStart(item.stableKey, event)}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          className="min-w-0 text-left text-sm font-semibold leading-5 transition-[color,scale] duration-200 hover:text-foreground active:scale-[0.99]"
          onClick={() => onOpenItem(item)}
        >
          {item.title}
        </button>
        <button
          type="button"
          className="flex h-7 shrink-0 items-center gap-1.5 border border-border px-2 text-xs text-muted-foreground tabular-nums transition-[border-color,color,scale] hover:border-foreground hover:text-foreground active:scale-[0.96]"
          disabled={voting}
          aria-label={`Upvote ${item.title}`}
          onClick={(event) => {
            event.stopPropagation();
            setVoting(true);
            void onVote(item)
              .catch((error: unknown) =>
                toast.error({
                  title: "Vote was not saved",
                  description: errorMessage(
                    error,
                    "The roadmap vote could not be saved. Refresh the project and try again.",
                  ),
                }),
              )
              .finally(() => setVoting(false));
          }}
        >
          <ChevronDown className="size-3 rotate-180" />
          {item.feedbackCount}
        </button>
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
        {item.description || item.impact || "No description yet."}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2 border border-border bg-muted/25 px-2 py-1">
          <Sparkles className="size-3" />
          {priorityLabel(item.priority)}
        </span>
        {item.target ? (
          <span className="border border-border bg-muted/25 px-2 py-1">{item.target}</span>
        ) : null}
        <span className="w-full min-w-0 truncate sm:w-auto">
          {primarySource?.title ?? "No linked evidence"}
        </span>
      </div>
    </article>
  );
}

function ChangelogWorkspace({
  entries,
  onOpen,
}: {
  entries: DashboardChangelog[];
  onOpen: (entry: DashboardChangelog) => void;
}) {
  return (
    <div className="t-panel-slide min-h-[calc(100svh-5.5rem)] bg-card/40" data-open="true">
      <div className="divide-y divide-border border-b border-border">
        {entries.map((entry) => (
          <button
            key={entry.stableKey}
            type="button"
            className="group grid w-full gap-4 px-4 py-5 text-left transition-[background-color] duration-150 hover:bg-muted/20 active:scale-[0.995] md:grid-cols-[18rem_minmax(0,1fr)_8rem] md:items-center md:px-6"
            onClick={() => onOpen(entry)}
          >
            <div className="grid aspect-[16/9] place-items-center rounded-lg border border-border bg-muted/25 text-sm font-semibold text-muted-foreground">
              No featured image
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold">{entry.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {entry.summary}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-md border border-border bg-muted/25 px-2 py-1">
                  {formatState(entry.category)}
                </span>
                <span className="rounded-md border border-border bg-muted/25 px-2 py-1">
                  {entry.publishedAt ? formatDate(entry.publishedAt) : formatDate(entry.updatedAt)}
                </span>
              </div>
            </div>
            <span className="h-fit w-fit rounded-full border border-border bg-muted/25 px-3 py-1 text-xs font-semibold text-muted-foreground md:justify-self-end">
              {formatState(entry.status)}
            </span>
          </button>
        ))}
        {entries.length === 0 ? (
          <EmptyModule
            copy="Use this when a shipped update needs review, targeting, and subscriber delivery."
            icon={<Megaphone />}
            title="Publish the first reviewed update"
          />
        ) : null}
      </div>
    </div>
  );
}

function FeedbackDetailWorkspace({
  onAddNote,
  onBack,
  post,
}: {
  onAddNote: (note: string) => Promise<void>;
  onBack: () => void;
  post: Post;
}) {
  const [activeTab, setActiveTab] = useState<"comments" | "details" | "sources">("comments");
  const [noteDraft, setNoteDraft] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const [savingNote, setSavingNote] = useState(false);

  function addNote() {
    const nextNote = noteDraft.trim();
    if (!nextNote) return;
    setSavingNote(true);
    void onAddNote(nextNote)
      .then(() => {
        setNotes((current) => [nextNote, ...current]);
        setNoteDraft("");
      })
      .catch((error: unknown) =>
        toast.error({
          title: "Note was not saved",
          description: errorMessage(
            error,
            "The feedback note could not be saved to this project. Keep the note text and try again.",
          ),
        }),
      )
      .finally(() => setSavingNote(false));
  }

  return (
    <div className="t-panel-slide min-h-svh bg-card/40" data-open="true">
      <div className="border-b border-border bg-background/70 px-4 py-4 backdrop-blur md:px-6">
        <button
          type="button"
          className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-[color,scale] duration-200 hover:text-foreground active:scale-[0.96]"
          onClick={onBack}
        >
          <ChevronDown className="size-3 rotate-90" />
          Back to feedback
        </button>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border bg-muted/25 px-3 py-1 font-semibold">
                {statusTitle(post.status)}
              </span>
              <span>{post.source}</span>
              <span>{formatDate(post.updatedAt)}</span>
            </div>
            <h1 className="mt-3 max-w-4xl text-balance text-2xl font-semibold leading-tight md:text-3xl">
              {post.title}
            </h1>
          </div>
          <div className="flex min-h-10 items-center gap-2 border border-border bg-background px-3 text-sm text-muted-foreground">
            <ChevronDown className="size-3 rotate-180" />
            <span className="font-semibold tabular-nums text-foreground">{post.voters}</span>
            <span>votes</span>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="min-w-0 border-b border-border bg-background/45 lg:border-b-0 lg:border-r">
          <div className="mx-auto grid max-w-4xl gap-6 px-4 py-6 md:px-6 md:py-8">
            <section className="grid gap-4">
              <h2 className="text-sm font-semibold">Description</h2>
              <p className="max-w-3xl whitespace-pre-wrap text-pretty text-sm leading-7 text-muted-foreground">
                {post.body || "No description was added."}
              </p>
              <div className="flex flex-wrap gap-2">
                {post.labels.length > 0 ? (
                  post.labels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-border bg-muted/25 px-3 py-1 text-xs text-muted-foreground"
                    >
                      {label}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-border bg-muted/25 px-3 py-1 text-xs text-muted-foreground">
                    No tags
                  </span>
                )}
              </div>
            </section>

            <div className="border-b border-border">
              <div className="flex flex-wrap gap-1">
                {(["comments", "details", "sources"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={cn(
                      "min-h-10 px-3 text-sm font-semibold capitalize text-muted-foreground transition-[background-color,color,scale] duration-200 hover:bg-muted/25 hover:text-foreground active:scale-[0.96]",
                      activeTab === tab && "bg-muted/30 text-foreground",
                    )}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "comments" ? (
              <section className="grid gap-4">
                <div className="border border-border bg-background p-4">
                  <textarea
                    className="min-h-28 w-full resize-y bg-transparent text-sm leading-6 outline-none placeholder:text-muted-foreground"
                    placeholder="Add an internal note or customer reply..."
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                  />
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground">
                      Replies will attach to this feedback item.
                    </p>
                    <Button
                      className="h-9 border border-foreground bg-foreground px-3 text-xs font-semibold text-background transition-[background-color,color,scale] hover:bg-background hover:text-foreground active:scale-[0.96]"
                      disabled={!noteDraft.trim() || savingNote}
                      type="button"
                      onClick={addNote}
                    >
                      {savingNote ? "Adding..." : "Add note"}
                    </Button>
                  </div>
                </div>
                {notes.length > 0 ? (
                  <div className="grid gap-2">
                    {notes.map((note, index) => (
                      <article
                        key={`${note}-${index}`}
                        className="border border-border bg-background p-4 text-sm leading-6 text-muted-foreground"
                      >
                        {note}
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyInline
                    copy="No comments have been captured for this item yet."
                    icon={<MessageSquareText />}
                    title="No comments yet"
                  />
                )}
              </section>
            ) : null}

            {activeTab === "details" ? (
              <section className="grid gap-3 sm:grid-cols-2">
                <DetailStat label="Status" value={statusTitle(post.status)} />
                <DetailStat label="Votes" value={String(post.voters)} />
                <DetailStat label="Roadmap links" value={String(post.linkedRoadmapCount)} />
                <DetailStat label="Changelog links" value={String(post.linkedChangelogCount)} />
                <DetailStat label="Author" value={post.authorName || "Dashboard"} />
                <DetailStat label="Updated" value={formatDate(post.updatedAt)} />
              </section>
            ) : null}

            {activeTab === "sources" ? <SourceEvidenceList links={post.sourceLinks} /> : null}
          </div>
        </article>

        <aside className="grid min-w-0 content-start gap-4 bg-card/35 p-4 md:p-6">
          <section className="grid gap-3">
            <h2 className="text-sm font-semibold">Workflow</h2>
            <DetailStat label="Roadmap links" value={String(post.linkedRoadmapCount)} />
            <DetailStat label="Changelog links" value={String(post.linkedChangelogCount)} />
            <p className="text-pretty text-xs leading-5 text-muted-foreground">
              This feedback is available to the roadmap view without creating a duplicate post.
            </p>
          </section>
          <section className="grid gap-3">
            <h2 className="text-sm font-semibold">Source evidence</h2>
            <SourceEvidenceList compact links={post.sourceLinks} />
          </section>
        </aside>
      </div>
    </div>
  );
}

function RoadmapDetailWorkspace({
  item,
  onBack,
  onOpenFeedback,
  onVote,
}: {
  item: DashboardRoadmap;
  onBack: () => void;
  onOpenFeedback: (stableKey: string) => void;
  onVote: (item: DashboardRoadmap) => Promise<unknown>;
}) {
  const feedbackKey = sourceFeedbackKey(item);
  const [voting, setVoting] = useState(false);

  return (
    <div className="t-panel-slide min-h-svh bg-card/40" data-open="true">
      <div className="border-b border-border bg-background/70 px-4 py-4 backdrop-blur md:px-6">
        <button
          type="button"
          className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-[color,scale] duration-200 hover:text-foreground active:scale-[0.96]"
          onClick={onBack}
        >
          <ChevronDown className="size-3 rotate-90" />
          Back to roadmap
        </button>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border bg-muted/25 px-3 py-1 font-semibold">
                {statusTitle(roadmapStatusToRoadmapStatus(item.status))}
              </span>
              <span>{priorityLabel(item.priority)}</span>
              <span>{formatDate(item.updatedAt)}</span>
            </div>
            <h1 className="mt-3 max-w-4xl text-balance text-2xl font-semibold leading-tight md:text-3xl">
              {item.title}
            </h1>
          </div>
          <button
            type="button"
            className="flex min-h-10 items-center gap-2 border border-border bg-background px-3 text-sm text-muted-foreground transition-[border-color,color,scale] hover:border-foreground hover:text-foreground active:scale-[0.96]"
            disabled={voting}
            onClick={() => {
              setVoting(true);
              void onVote(item)
                .catch((error: unknown) =>
                  toast.error({
                    title: "Vote was not saved",
                    description: errorMessage(
                      error,
                      "The roadmap vote could not be saved. Refresh the project and try again.",
                    ),
                  }),
                )
                .finally(() => setVoting(false));
            }}
          >
            <ChevronDown className="size-3 rotate-180" />
            <span className="font-semibold tabular-nums text-foreground">{item.feedbackCount}</span>
            <span>votes</span>
          </button>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="min-w-0 border-b border-border bg-background/45 lg:border-b-0 lg:border-r">
          <div className="mx-auto grid max-w-4xl gap-6 px-4 py-6 md:px-6 md:py-8">
            <section className="grid gap-4">
              <h2 className="text-sm font-semibold">Roadmap item</h2>
              <p className="max-w-3xl whitespace-pre-wrap text-pretty text-sm leading-7 text-muted-foreground">
                {item.description || item.impact || "No description was added."}
              </p>
            </section>
            <section className="grid gap-3 sm:grid-cols-2">
              <DetailStat
                label="Status"
                value={statusTitle(roadmapStatusToRoadmapStatus(item.status))}
              />
              <DetailStat label="Priority" value={priorityLabel(item.priority)} />
              <DetailStat label="Votes" value={String(item.feedbackCount)} />
              <DetailStat label="Changelog links" value={String(item.changelogCount)} />
              <DetailStat label="Target" value={item.target ?? "No target"} />
              <DetailStat label="Updated" value={formatDate(item.updatedAt)} />
            </section>
            <SourceEvidenceList links={item.sourceLinks} />
          </div>
        </article>

        <aside className="grid min-w-0 content-start gap-4 bg-card/35 p-4 md:p-6">
          <section className="grid gap-3">
            <h2 className="text-sm font-semibold">Linked feedback</h2>
            {feedbackKey ? (
              <Button
                className="h-10 border border-foreground bg-foreground px-3 text-xs font-semibold text-background transition-[background-color,color,scale] hover:bg-background hover:text-foreground active:scale-[0.96]"
                type="button"
                onClick={() => onOpenFeedback(feedbackKey)}
              >
                Open feedback
              </Button>
            ) : (
              <p className="text-pretty text-xs leading-5 text-muted-foreground">
                This was created directly on the roadmap. It is also listed on the feedback screen
                so the board and roadmap stay aligned.
              </p>
            )}
          </section>
          <section className="grid gap-3">
            <h2 className="text-sm font-semibold">Source evidence</h2>
            <SourceEvidenceList compact links={item.sourceLinks} />
          </section>
        </aside>
      </div>
    </div>
  );
}

function ChangelogEditorWorkspace({
  entry,
  onClose,
  onSave,
}: {
  entry: DashboardChangelog;
  onClose: () => void;
  onSave: (payload: {
    body: string;
    category: string;
    stableKey: string;
    status: string;
    summary: string;
    tags: string[];
    title: string;
    version?: string;
  }) => Promise<void>;
}) {
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("changed");
  const [confirmClose, setConfirmClose] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [showPublicly, setShowPublicly] = useState(true);
  const [status, setStatus] = useState("draft");
  const [summary, setSummary] = useState("");
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("");
  const editorRef = useRef<HTMLDivElement | null>(null);
  const isDirty =
    body !== entry.body ||
    category !== entry.category ||
    status !== entry.status ||
    summary !== entry.summary ||
    title !== entry.title ||
    version !== (entry.version ?? "");

  useEffect(() => {
    setBody(entry.body);
    setCategory(entry.category);
    setStatus(entry.status);
    setSummary(entry.summary);
    setTitle(entry.title);
    setVersion(entry.version ?? "");
    setConfirmClose(false);
    if (editorRef.current) editorRef.current.innerText = entry.body;
  }, [entry]);

  function requestClose() {
    if (isDirty) {
      setConfirmClose(true);
      return;
    }
    onClose();
  }

  function applyEditorCommand(command: string) {
    editorRef.current?.focus();
    document.execCommand(command);
    setBody(editorRef.current?.innerText ?? "");
  }

  return (
    <div className="t-panel-slide min-h-svh bg-card/40" data-open="true">
      <form
        className="grid min-h-svh grid-rows-[auto_minmax(0,1fr)]"
        onKeyDown={(event: ReactKeyboardEvent<HTMLFormElement>) => {
          if (event.key === "Escape") {
            event.preventDefault();
            requestClose();
          }
          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
            event.preventDefault();
            document.getElementById("amend-changelog-save")?.click();
          }
        }}
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim()) return;
          setSaving(true);
          void onSave({
            body: body.trim() || summary.trim() || title.trim(),
            category,
            stableKey: entry.stableKey,
            status,
            summary: summary.trim() || body.trim() || title.trim(),
            tags: entry.tags,
            title: title.trim(),
            ...(version.trim() ? { version: version.trim() } : {}),
          })
            .catch((error: unknown) =>
              toast.error({
                title: "Changelog save failed",
                description: errorMessage(
                  error,
                  "The changelog draft could not be saved. Check the title and body, then try again.",
                ),
              }),
            )
            .finally(() => setSaving(false));
        }}
      >
        <header className="border-b border-border bg-background/70 px-4 py-4 backdrop-blur md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <button
                type="button"
                className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-[color,scale] duration-200 hover:text-foreground active:scale-[0.96]"
                onClick={requestClose}
              >
                <ChevronDown className="size-3 rotate-90" />
                Back to changelog
              </button>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <span>Changelog</span>
                <span>/</span>
                <span>{title.trim() || "Untitled"}</span>
                <span>/</span>
                <span>{formatState(status)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="h-10 border border-border bg-background px-3 text-xs font-semibold text-muted-foreground transition-[border-color,color,scale] hover:border-foreground hover:text-foreground active:scale-[0.96]"
                type="button"
                onClick={requestClose}
              >
                Close
              </Button>
              <Button
                id="amend-changelog-save"
                className="h-10 border border-foreground bg-foreground px-3 text-xs font-semibold text-background transition-[background-color,color,scale] hover:bg-background hover:text-foreground active:scale-[0.96]"
                disabled={saving || !title.trim()}
                type="submit"
              >
                {saving ? "Saving..." : "Save changelog"}
              </Button>
            </div>
          </div>

          {confirmClose ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-border bg-muted/20 p-3">
              <p className="text-sm text-muted-foreground">Discard unsaved changelog edits?</p>
              <div className="flex items-center gap-2">
                <Button
                  className="h-9 border border-border bg-background px-3 text-xs font-semibold text-muted-foreground transition-[border-color,color,scale] hover:border-foreground hover:text-foreground active:scale-[0.96]"
                  type="button"
                  onClick={() => setConfirmClose(false)}
                >
                  Keep editing
                </Button>
                <Button
                  className="h-9 border border-foreground bg-foreground px-3 text-xs font-semibold text-background transition-[background-color,color,scale] hover:bg-background hover:text-foreground active:scale-[0.96]"
                  type="button"
                  onClick={onClose}
                >
                  Discard
                </Button>
              </div>
            </div>
          ) : null}
        </header>

        <div className="min-h-0 overflow-auto bg-background/45">
          <div className="grid min-h-full lg:grid-cols-[minmax(0,1fr)_24rem]">
            <main className="min-w-0 border-b border-border p-4 md:p-6 lg:border-b-0 lg:border-r">
              <div className="mx-auto grid max-w-5xl gap-6">
                <button
                  type="button"
                  className="grid min-h-36 place-items-center border border-border bg-card/60 text-sm font-semibold text-muted-foreground transition-[background-color,border-color,color,scale] duration-200 hover:border-foreground hover:bg-muted/20 hover:text-foreground active:scale-[0.995]"
                >
                  <span className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                    <Globe className="size-4" />
                    Add featured image
                  </span>
                </button>

                <textarea
                  className="min-h-20 w-full resize-none bg-transparent text-balance text-3xl font-semibold leading-tight outline-none placeholder:text-muted-foreground md:text-4xl"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Changelog title"
                />

                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Summary
                  </span>
                  <Input
                    className="h-11 border-border bg-background text-sm"
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    placeholder="Short user-facing summary"
                  />
                </label>

                <div className="border border-border bg-background">
                  <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
                    <EditorButton label="Bold" onClick={() => applyEditorCommand("bold")}>
                      <strong>B</strong>
                    </EditorButton>
                    <EditorButton label="Italic" onClick={() => applyEditorCommand("italic")}>
                      <em>I</em>
                    </EditorButton>
                    <EditorButton
                      label="Bullet list"
                      onClick={() => applyEditorCommand("insertUnorderedList")}
                    >
                      <ClipboardList className="size-3.5" />
                    </EditorButton>
                  </div>
                  <div className="relative min-h-[30rem] p-4 md:p-6">
                    <div
                      ref={editorRef}
                      aria-label="Changelog body"
                      className="amend-composer-editor min-h-[27rem] text-base leading-8 text-foreground outline-none"
                      contentEditable
                      role="textbox"
                      spellCheck
                      onInput={(event) => setBody(event.currentTarget.innerText ?? "")}
                    />
                    {!body.trim() ? (
                      <p className="pointer-events-none absolute left-4 top-4 text-sm text-muted-foreground">
                        Write the changelog body...
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </main>

            <aside className="grid min-w-0 content-start gap-5 bg-card/35 p-4 md:p-6">
              <section className="grid gap-3">
                <h2 className="text-sm font-semibold">Publishing</h2>
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Status
                  </span>
                  <select
                    className="h-10 border border-border bg-background px-3 text-xs outline-none"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="in_review">In review</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Category
                  </span>
                  <select
                    className="h-10 border border-border bg-background px-3 text-xs outline-none"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    <option value="added">New</option>
                    <option value="changed">Improved</option>
                    <option value="fixed">Fixed</option>
                    <option value="removed">Removed</option>
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Version
                  </span>
                  <Input
                    className="h-10 border-border bg-background text-xs"
                    value={version}
                    onChange={(event) => setVersion(event.target.value)}
                    placeholder="Optional"
                  />
                </label>
                <DetailStat
                  label="Updated"
                  value={
                    entry.publishedAt ? formatDate(entry.publishedAt) : formatDate(entry.updatedAt)
                  }
                />
              </section>
              <section className="grid gap-3">
                <h2 className="text-sm font-semibold">Distribution</h2>
                <label className="flex min-h-11 items-center gap-3 border border-border bg-background px-3 text-sm text-muted-foreground">
                  <input
                    checked={showPublicly}
                    className="size-4 accent-foreground"
                    type="checkbox"
                    onChange={(event) => setShowPublicly(event.target.checked)}
                  />
                  <span>Show on portal and widgets</span>
                </label>
                <label className="flex min-h-11 items-center gap-3 border border-border bg-background px-3 text-sm text-muted-foreground">
                  <input
                    checked={sendEmail}
                    className="size-4 accent-foreground"
                    type="checkbox"
                    onChange={(event) => setSendEmail(event.target.checked)}
                  />
                  <span>Email subscribers on publish</span>
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Audience
                  </span>
                  <select className="h-10 border border-border bg-background px-3 text-xs outline-none">
                    <option>Everyone</option>
                    <option>Voters and commenters</option>
                    <option>Admins only</option>
                  </select>
                </label>
              </section>
              <section className="grid gap-3">
                <h2 className="text-sm font-semibold">Source evidence</h2>
                <SourceEvidenceList compact links={entry.sourceLinks} />
              </section>
              <section className="grid gap-3">
                <h2 className="text-sm font-semibold">Review</h2>
                <p className="text-pretty text-xs leading-5 text-muted-foreground">
                  Save drafts here before publishing updates to the public changelog.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </form>
    </div>
  );
}

function SourceEvidenceList({
  compact = false,
  links,
}: {
  compact?: boolean;
  links: SourceLink[];
}) {
  if (links.length === 0) {
    return (
      <p className="border border-border bg-background p-3 text-sm leading-6 text-muted-foreground">
        No source link has been attached yet.
      </p>
    );
  }

  return (
    <div className="grid min-w-0 gap-2">
      {links.map((link) => (
        <a
          key={link.externalId ?? link.url}
          className={cn(
            "flex min-w-0 items-center justify-between gap-3 border border-border bg-background text-muted-foreground transition-[border-color,color,scale] duration-200 hover:border-foreground hover:text-foreground active:scale-[0.99]",
            compact ? "min-h-10 px-3 text-xs" : "min-h-12 px-4 text-sm",
          )}
          href={link.url}
          rel="noreferrer"
          target="_blank"
        >
          <span className="min-w-0 truncate">{link.title ?? link.url}</span>
          <ExternalLink className="size-3.5 shrink-0" />
        </a>
      ))}
    </div>
  );
}

function EmptyInline({ copy, icon, title }: { copy: string; icon: ReactElement; title: string }) {
  return (
    <div className="grid min-h-36 place-items-center border border-dashed border-border bg-background/60 p-5 text-center">
      <div>
        <span className="mx-auto grid size-8 place-items-center text-muted-foreground [&_svg]:size-7">
          {icon}
        </span>
        <h3 className="mt-3 text-sm font-semibold">{title}</h3>
        <p className="mt-2 max-w-sm text-pretty text-sm leading-6 text-muted-foreground">{copy}</p>
      </div>
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border border-border bg-background p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-sm font-semibold">{value}</span>
    </div>
  );
}

function EditorButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="grid size-9 place-items-center border border-transparent text-xs text-muted-foreground transition-[background-color,border-color,color,scale] hover:border-border hover:bg-muted/30 hover:text-foreground active:scale-[0.96]"
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function ShareWorkspace({
  changelogCount,
  feedbackCount,
  roadmapCount,
  workspace,
}: {
  changelogCount: number;
  feedbackCount: number;
  roadmapCount: number;
  workspace: Workspace;
}) {
  const portalHref =
    workspace.id === fallbackWorkspace.id ? "/dashboard/setup" : `/portal/${workspace.id}`;
  return (
    <div className="t-panel-slide mx-auto grid max-w-5xl gap-6 p-4 py-8 md:p-8" data-open="true">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Public surfaces
          </p>
          <h2 className="mt-3 text-2xl font-semibold">Share the loop users can follow.</h2>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{workspace.portal}</p>
      </div>

      <section className="grid gap-4 border border-border bg-card p-5 md:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="grid content-center">
          <p className="font-semibold">{workspace.name} portal</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            One link for feedback, roadmap, and changelog. It uses the same source-linked records
            shown in this dashboard, so there is no duplicate content to maintain.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              className="h-9 border border-foreground bg-foreground text-xs text-background hover:bg-background hover:text-foreground"
              onClick={() => {
                void navigator.clipboard?.writeText(`${window.location.origin}${portalHref}`);
                toast.success("Portal link copied");
              }}
            >
              Copy link
            </Button>
            <a
              href={portalHref}
              className="inline-flex h-9 items-center border border-border px-3 text-xs font-semibold text-muted-foreground transition-[border-color,color,scale] duration-200 hover:border-foreground hover:text-foreground active:scale-[0.96]"
            >
              Open portal
            </a>
          </div>
        </div>
        <div className="grid border border-border bg-background">
          <ShareMetric label="Feedback" value={feedbackCount} />
          <ShareMetric label="Roadmap" value={roadmapCount} />
          <ShareMetric label="Changelog" value={changelogCount} />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">Feedback widget</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Embed the request launcher in your app or docs, connected to this workspace.
              </p>
            </div>
            <Code2 className="size-5 text-muted-foreground" />
          </div>
          <pre className="mt-5 overflow-x-auto border border-border bg-background p-4 text-xs text-muted-foreground">
            {`<script src="https://cdn.amend.sh/widget.js" data-workspace="${workspace.id}" async></script>`}
          </pre>
        </section>
        <section className="border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">Email signature</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                A small invitation for support replies and release emails.
              </p>
            </div>
            <Copy className="size-5 text-muted-foreground" />
          </div>
          <div className="mt-5 border border-border bg-background p-4 text-sm">
            <p>{workspace.name} updates</p>
            <a className="mt-2 inline-block font-semibold text-foreground" href={portalHref}>
              Follow feedback and shipped work -&gt;
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

function ShareMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-h-16 items-center justify-between border-b border-border px-4 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function MembersWorkspace({ workspace }: { workspace: Workspace }) {
  const queryArgs = workspace.id === fallbackWorkspace.id ? {} : { workspaceSlug: workspace.id };
  const settings = useQuery(workspaceSettingsQuery, queryArgs) as WorkspaceSettingsData | undefined;
  const upsertMember = useMutation(upsertWorkspaceMemberMutation);
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const members = settings?.members ?? [];

  return (
    <div className="t-panel-slide mx-auto grid max-w-5xl gap-6 p-4 py-8 md:p-8" data-open="true">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Accounts
          </p>
          <h2 className="mt-3 text-2xl font-semibold">Workspace members</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Give reviewers and maintainers access to review generated copy, publish changelogs, and
            manage the feedback loop.
          </p>
        </div>
      </div>

      <section className="grid gap-3 border border-border bg-card p-4 md:grid-cols-[minmax(0,1fr)_12rem_8rem]">
        <Input
          className="h-10 bg-background text-sm"
          placeholder="teammate@company.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <select className="h-10 border border-border bg-background px-3 text-sm text-foreground">
          <option value="reviewer">Reviewer</option>
        </select>
        <Button
          className="h-10 bg-foreground text-background hover:bg-background hover:text-foreground"
          disabled={workspace.id === fallbackWorkspace.id || !email.includes("@") || saving}
          onClick={() => {
            setSaving(true);
            void upsertMember({
              email,
              role: "reviewer",
              workspaceSlug: workspace.id,
            })
              .then(() => {
                toast.success("Member saved");
                setEmail("");
              })
              .catch((error: unknown) => {
                toast.error({
                  title: "Member invite failed",
                  description: errorMessage(
                    error,
                    `The invite for "${email}" could not be saved. Check the email address and try again.`,
                  ),
                });
              })
              .finally(() => setSaving(false));
          }}
        >
          Invite
        </Button>
      </section>

      <section className="border border-border bg-card">
        {members.length > 0 ? (
          members.map((member) => (
            <div
              key={member.recordId ?? member.email}
              className="grid gap-2 border-b border-border px-4 py-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_9rem_14rem] md:items-center"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{member.name ?? member.email}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{member.email}</p>
              </div>
              <span className="w-fit border border-border bg-muted/25 px-2 py-1 text-xs text-muted-foreground">
                {formatState(member.role)}
              </span>
              <p className="truncate text-xs text-muted-foreground">
                {member.permissions.slice(0, 2).join(", ") || "workspace:view"}
              </p>
            </div>
          ))
        ) : (
          <EmptyModule
            copy="Create a project first, then invite reviewers and workspace operators."
            icon={<Users />}
            title="No members yet"
          />
        )}
      </section>
    </div>
  );
}

void AgentWorkspace;
void ShareWorkspace;
void MembersWorkspace;

function SettingsWorkspace({
  activeProject,
  activeSection,
  workspace,
}: {
  activeProject: ProjectMenuItem;
  activeSection: SettingsSection;
  workspace: Workspace;
}) {
  const queryArgs = workspace.id === fallbackWorkspace.id ? {} : { workspaceSlug: workspace.id };
  const settings = useQuery(workspaceSettingsQuery, queryArgs) as WorkspaceSettingsData | undefined;
  const suggestProject = useAction(suggestFromWebsite);
  const updateProject = useMutation(updateProjectMutation);
  const generateLogoUploadUrl = useMutation(generateProjectLogoUploadUrlMutation);
  const updatePortal = useMutation(updatePortalSettingsMutation);
  const updateRules = useMutation(updateAutomationRulesMutation);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState(activeProject.name);
  const [description, setDescription] = useState(activeProject.description ?? "");
  const [logoUrl, setLogoUrl] = useState(activeProject.logoUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(activeProject.websiteUrl ?? "");
  const [headline, setHeadline] = useState(
    workspace.portalSettings?.headline ?? `${activeProject.name} updates`,
  );
  const [intro, setIntro] = useState(
    workspace.portalSettings?.intro ??
      "Feedback, roadmap moves, and shipped updates with source evidence.",
  );
  const [saving, setSaving] = useState<"automation" | "portal" | "project" | null>(null);
  const [logoAction, setLogoAction] = useState<"upload" | "website" | null>(null);
  const rules = settings?.automationRules;

  useEffect(() => {
    setName(activeProject.name);
    setDescription(activeProject.description ?? "");
    setLogoUrl(activeProject.logoUrl ?? "");
    setWebsiteUrl(activeProject.websiteUrl ?? "");
    setHeadline(workspace.portalSettings?.headline ?? `${activeProject.name} updates`);
    setIntro(
      workspace.portalSettings?.intro ??
        "Feedback, roadmap moves, and shipped updates with source evidence.",
    );
  }, [
    activeProject.description,
    activeProject.logoUrl,
    activeProject.name,
    activeProject.websiteUrl,
    workspace.portalSettings?.headline,
    workspace.portalSettings?.intro,
  ]);

  const canSave = workspace.id !== fallbackWorkspace.id && activeProject.id !== "new-project";
  const serviceRows = [
    {
      label: "GitHub source",
      value:
        activeProject.sourceReady && activeProject.repo !== "Feedback board only"
          ? activeProject.repo
          : "Connect repository",
      state:
        activeProject.sourceReady && activeProject.repo !== "Feedback board only"
          ? "Connected"
          : "Required",
    },
    {
      label: "Feedback board",
      value: activeProject.portal,
      state: "Enabled",
    },
    {
      label: "Discord",
      value: "Signal channel",
      state: "Planned",
    },
    {
      label: "Slack",
      value: "Signal and update channel",
      state: "Planned",
    },
    {
      label: "Linear",
      value: "Roadmap signal",
      state: "Planned",
    },
  ];
  const saveProject = (overrides: Record<string, unknown> = {}) =>
    updateProject({
      description,
      logoUrl,
      name,
      projectKey: activeProject.id,
      visibility: workspace.visibility ?? "private",
      websiteUrl,
      workspaceSlug: workspace.id,
      ...overrides,
    });
  const uploadLogoFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error({
        title: "Logo was not uploaded",
        description: "Choose an image file like PNG, JPG, SVG, or WebP.",
      });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error({
        title: "Logo is too large",
        description: "Use an image smaller than 4 MB.",
      });
      return;
    }
    setLogoAction("upload");
    try {
      const uploadUrl = (await generateLogoUploadUrl({
        projectKey: activeProject.id,
        workspaceSlug: workspace.id,
      })) as string;
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!response.ok) {
        throw new Error("Convex storage rejected the uploaded image.");
      }
      const { storageId } = (await response.json()) as { storageId: string };
      const saved = (await saveProject({ logoStorageId: storageId })) as {
        logoUrl?: string;
      };
      if (saved.logoUrl) {
        setLogoUrl(saved.logoUrl);
      }
      toast.success("Logo uploaded");
    } catch (error) {
      toast.error({
        title: "Logo was not uploaded",
        description: errorMessage(
          error,
          "The image could not be stored. Try a smaller image or use a logo URL instead.",
        ),
      });
    } finally {
      setLogoAction(null);
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = "";
      }
    }
  };
  const loadLogoFromWebsite = async () => {
    const trimmed = websiteUrl.trim();
    if (!trimmed) {
      toast.error({
        title: "Website URL is missing",
        description: "Enter the project website URL first.",
      });
      return;
    }
    setLogoAction("website");
    try {
      const suggestion = (await suggestProject({ websiteUrl: trimmed })) as ProjectSuggestion;
      setWebsiteUrl(suggestion.websiteUrl);
      if (suggestion.logoUrl) {
        setLogoUrl(suggestion.logoUrl);
        toast.success("Logo loaded from website");
        return;
      }
      toast.warning({
        title: "No logo found",
        description: "The website was reachable, but it did not expose a logo or favicon.",
      });
    } catch (error) {
      toast.error({
        title: "Logo was not loaded",
        description: errorMessage(
          error,
          "We could not read that website. Check the URL and try again.",
        ),
      });
    } finally {
      setLogoAction(null);
    }
  };

  return (
    <div className="t-panel-slide mx-auto grid max-w-6xl gap-6 p-4 py-6 md:p-8" data-open="true">
      <div className="min-w-0">
        <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 gap-4">
            <span className="grid size-14 shrink-0 place-items-center overflow-hidden border border-border bg-card text-lg font-semibold">
              {logoUrl ? (
                <img alt="" className="size-full object-cover" src={logoUrl} />
              ) : (
                activeProject.initials
              )}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Project settings
              </p>
              <h2 className="mt-2 truncate text-2xl font-semibold">
                Configure {activeProject.name}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Settings apply to the selected project. Workspace membership, billing, and shared
                limits stay separate from product identity.
              </p>
            </div>
          </div>
          <StatusRow label="Repository" value={activeProject.repo} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            {activeSection === "general" ? (
              <SettingsPanel
                action={
                  <Button
                    className="h-9 bg-foreground text-xs text-background hover:bg-background hover:text-foreground"
                    disabled={!canSave || saving === "project"}
                    onClick={() => {
                      setSaving("project");
                      void saveProject()
                        .then(() => toast.success("Project saved"))
                        .catch((error: unknown) =>
                          toast.error({
                            title: "Project was not saved",
                            description: errorMessage(
                              error,
                              "The selected project could not be updated. Check the values and try again.",
                            ),
                          }),
                        )
                        .finally(() => setSaving(null));
                    }}
                  >
                    Save
                  </Button>
                }
                icon={<Settings />}
                title="General"
              >
                <SettingsField label="Project name">
                  <Input
                    className="h-10 bg-background text-sm"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </SettingsField>
                <SettingsField label="Project description">
                  <Input
                    className="h-10 bg-background text-sm"
                    placeholder="What this product is and who it serves."
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </SettingsField>
                <div className="grid gap-3 md:grid-cols-2">
                  <SettingsField label="Website URL">
                    <Input
                      className="h-10 bg-background text-sm"
                      placeholder="https://example.com"
                      value={websiteUrl}
                      onChange={(event) => setWebsiteUrl(event.target.value)}
                    />
                  </SettingsField>
                  <SettingsField label="Logo URL">
                    <div className="grid gap-2">
                      <Input
                        className="h-10 bg-background text-sm"
                        placeholder="https://example.com/logo.png"
                        value={logoUrl}
                        onChange={(event) => setLogoUrl(event.target.value)}
                      />
                      <input
                        ref={logoFileInputRef}
                        className="sr-only"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          void uploadLogoFile(event.target.files?.[0]);
                        }}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          className="h-9 border border-border bg-background px-3 text-xs text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                          disabled={!canSave || logoAction !== null}
                          onClick={() => logoFileInputRef.current?.click()}
                        >
                          <Plus className="size-3.5" />
                          {logoAction === "upload" ? "Uploading..." : "Upload logo"}
                        </Button>
                        <Button
                          className="h-9 border border-border bg-background px-3 text-xs text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                          disabled={!canSave || logoAction !== null}
                          onClick={() => {
                            void loadLogoFromWebsite();
                          }}
                        >
                          <Sparkles className="size-3.5" />
                          {logoAction === "website" ? "Loading..." : "Load from website"}
                        </Button>
                      </div>
                    </div>
                  </SettingsField>
                </div>
                <SettingsField label="Portal URL">
                  <Input
                    className="h-10 bg-background text-sm"
                    readOnly
                    value={activeProject.portal}
                  />
                </SettingsField>
              </SettingsPanel>
            ) : null}

            {activeSection === "services" ? (
              <SettingsPanel icon={<GitPullRequestArrow />} title="Connected services">
                <div className="grid gap-2">
                  {serviceRows.map((service) => (
                    <div
                      key={service.label}
                      className="grid gap-3 border border-border bg-background p-3 md:grid-cols-[1fr_auto]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{service.label}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {service.value}
                        </p>
                      </div>
                      <span className="w-fit border border-border bg-muted/25 px-2 py-1 text-xs text-muted-foreground">
                        {service.state}
                      </span>
                    </div>
                  ))}
                </div>
              </SettingsPanel>
            ) : null}

            {activeSection === "portal" ? (
              <SettingsPanel
                action={
                  <Button
                    className="h-9 bg-foreground text-xs text-background hover:bg-background hover:text-foreground"
                    disabled={!canSave || saving === "portal"}
                    onClick={() => {
                      setSaving("portal");
                      void updatePortal({
                        changelogVisibility: "public",
                        feedbackMode: "open",
                        headline,
                        intro,
                        roadmapVisibility: "public",
                        workspaceSlug: workspace.id,
                      })
                        .then(() => toast.success("Portal settings saved"))
                        .catch((error: unknown) =>
                          toast.error({
                            title: "Portal settings were not saved",
                            description: errorMessage(
                              error,
                              "The public portal copy could not be updated. Check the fields and try again.",
                            ),
                          }),
                        )
                        .finally(() => setSaving(null));
                    }}
                  >
                    Save
                  </Button>
                }
                icon={<Globe />}
                title="Public portal"
              >
                <SettingsField label="Headline">
                  <Input
                    className="h-10 bg-background text-sm"
                    value={headline}
                    onChange={(event) => setHeadline(event.target.value)}
                  />
                </SettingsField>
                <SettingsField label="Intro">
                  <Input
                    className="h-10 bg-background text-sm"
                    value={intro}
                    onChange={(event) => setIntro(event.target.value)}
                  />
                </SettingsField>
              </SettingsPanel>
            ) : null}

            {activeSection === "automation" ? (
              <SettingsPanel
                action={
                  <Button
                    className="h-9 bg-foreground text-xs text-background hover:bg-background hover:text-foreground"
                    disabled={!canSave || saving === "automation"}
                    onClick={() => {
                      setSaving("automation");
                      void updateRules({
                        autoDraftChangelog: true,
                        autoNotifyUsers: true,
                        autoPublishChangelog: false,
                        autoUpdateFeedbackStatus: true,
                        autoUpdateRoadmapStatus: true,
                        mode: "review_first",
                        requireReviewBelowConfidence: 0.82,
                        requireReviewForHighImpact: true,
                        requireReviewForPublicCopy: true,
                        workspaceSlug: workspace.id,
                      })
                        .then(() => toast.success("Automation rules saved"))
                        .catch((error: unknown) =>
                          toast.error({
                            title: "Automation settings were not saved",
                            description: errorMessage(
                              error,
                              "The automation rules could not be updated. Refresh the settings page and try again.",
                            ),
                          }),
                        )
                        .finally(() => setSaving(null));
                    }}
                  >
                    Save
                  </Button>
                }
                icon={<DatabaseZap />}
                title="Automation guardrails"
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <BooleanRow
                    checked={rules?.autoDraftChangelog ?? false}
                    label="Draft changelogs"
                  />
                  <BooleanRow
                    checked={rules?.autoUpdateFeedbackStatus ?? false}
                    label="Update feedback status"
                  />
                  <BooleanRow
                    checked={rules?.autoUpdateRoadmapStatus ?? false}
                    label="Move roadmap items"
                  />
                  <BooleanRow
                    checked={rules?.requireReviewForPublicCopy ?? true}
                    label="Require public copy review"
                  />
                </div>
              </SettingsPanel>
            ) : null}

            {activeSection === "accounts" ? (
              <SettingsPanel icon={<Users />} title="Accounts">
                <StatusRow label="Members" value={String(settings?.members.length ?? 0)} />
                <StatusRow
                  label="Owner"
                  value={
                    settings?.members.find((member) => member.role === "owner")?.email ?? "Not set"
                  }
                />
              </SettingsPanel>
            ) : null}
          </div>

          <aside className="grid h-fit gap-4">
            <SettingsPanel icon={<Globe />} title="Domains">
              <StatusRow label="Project portal" value={activeProject.portal} />
            </SettingsPanel>
            <SettingsPanel icon={<DatabaseZap />} title="Rate limits">
              <StatusRow
                label="Website lookup"
                value={
                  settings?.rateLimits?.projectWebsiteLookup
                    ? `${settings.rateLimits.projectWebsiteLookup.rate}/${settings.rateLimits.projectWebsiteLookup.period}`
                    : "12/minute"
                }
              />
              <StatusRow
                label="Burst capacity"
                value={String(settings?.rateLimits?.projectWebsiteLookup?.capacity ?? 4)}
              />
            </SettingsPanel>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({
  action,
  children,
  icon,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  icon: ReactElement;
  title: string;
}) {
  return (
    <section className="border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center border border-border bg-muted/30 text-muted-foreground [&_svg]:size-4">
            {icon}
          </span>
          <h3 className="truncate text-sm font-semibold">{title}</h3>
        </div>
        {action}
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function SettingsField({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function BooleanRow({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-3 border border-border bg-background px-3">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span
        className={cn(
          "grid size-5 place-items-center border border-border text-[0.65rem]",
          checked ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
        )}
      >
        {checked ? "Y" : "N"}
      </span>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-3 border border-border bg-background px-3">
      <span className="truncate text-xs font-semibold">{label}</span>
      <span className="truncate text-xs text-muted-foreground">{value}</span>
    </div>
  );
}

function ProjectSetupShell({
  onCreated,
  workspace,
}: {
  onCreated: (projectSlug: string, workspaceSlug?: string) => void;
  workspace: Workspace;
}) {
  return (
    <main className="grid min-h-svh bg-background text-foreground lg:grid-cols-2">
      <section className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <AmendLogo markVariant="mono" size="md" />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <OnboardingWorkspace onCreated={onCreated} surface="first-run" workspace={workspace} />
          </div>
        </div>
      </section>
      <section className="relative hidden overflow-hidden bg-black lg:block" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_40%,rgba(255,255,255,0.09),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.92),rgba(0,0,0,0.12)_34%,rgba(0,0,0,0.36))]" />
        <img
          src="/images/project-setup-dashboard.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-80 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35" />
      </section>
    </main>
  );
}

function OnboardingWorkspace({
  existingProject,
  onCreated,
  surface = "dashboard",
  workspace,
}: {
  existingProject?: ProjectMenuItem;
  onCreated: (projectSlug: string, workspaceSlug?: string) => void;
  surface?: "dashboard" | "first-run";
  workspace: Workspace;
}) {
  const suggestProject = useAction(suggestFromWebsite);
  const listGitHubRepositories = useAction(listGitHubAppRepositoriesAction);
  const create = useMutation(createWorkspaceProject);
  const connectRepository = useMutation(connectProjectRepository);
  const markFeedbackSource = useMutation(markProjectFeedbackSource);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectSlug, setProjectSlug] = useState("");
  const [description, setDescription] = useState("");
  const [repositoryInput, setRepositoryInput] = useState("");
  const [repoSearch, setRepoSearch] = useState("");
  const [connectionMode, setConnectionMode] = useState<"feedback" | "github">("github");
  const [visibility, setVisibility] = useState<"private" | "public">(
    surface === "first-run" ? "public" : "private",
  );
  const [suggestion, setSuggestion] = useState<ProjectSuggestion | null>(null);
  const [message, setMessage] = useState(
    "Add a website to prefill details, then choose a first source.",
  );
  const [websiteStatus, setWebsiteStatus] = useState<WebsiteLookupStatus>("idle");
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [githubDirectory, setGithubDirectory] = useState<GitHubInstallationDirectory | null>(null);
  const [githubDirectoryLoading, setGithubDirectoryLoading] = useState(false);
  const [githubDirectoryError, setGithubDirectoryError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [setupStep, setSetupStep] = useState(0);
  const nameEditedRef = useRef(false);
  const slugEditedRef = useRef(false);
  const descriptionEditedRef = useRef(false);
  const repositoryDraft = useMemo(() => parseRepositoryInput(repositoryInput), [repositoryInput]);
  const repositoryDirectory = useMemo(() => {
    const query = repoSearch.trim().toLowerCase();
    const accounts = githubDirectory?.accounts ?? [];
    if (!query) return accounts;
    return accounts
      .map((account) => ({
        ...account,
        repositories: account.repositories.filter((repository) => {
          const haystack = [
            account.login,
            repository.fullName,
            repository.description ?? "",
            repository.private ? "private" : "public",
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(query);
        }),
      }))
      .filter(
        (account) => account.login.toLowerCase().includes(query) || account.repositories.length > 0,
      );
  }, [githubDirectory, repoSearch]);
  const repositoryCount = useMemo(
    () =>
      (githubDirectory?.accounts ?? []).reduce(
        (count, account) => count + account.repositories.length,
        0,
      ),
    [githubDirectory],
  );
  const hasFirstSource = connectionMode === "feedback" || Boolean(repositoryDraft);
  const isRepairingProject = Boolean(existingProject);
  const canCreate =
    (isRepairingProject || projectName.trim().length >= 2) && hasFirstSource && !saving;
  const isFirstRun = surface === "first-run";
  const setupStepCount = 2;

  useEffect(() => {
    if (!existingProject) return;
    nameEditedRef.current = true;
    slugEditedRef.current = true;
    descriptionEditedRef.current = true;
    setProjectName(existingProject.name);
    setProjectSlug(existingProject.id);
    setDescription(existingProject.description ?? "");
    setRepositoryInput("");
    setConnectionMode("github");
    setMessage(
      `${existingProject.name} needs GitHub or the feedback board before the agent can run.`,
    );
  }, [existingProject]);

  useEffect(() => {
    if (connectionMode !== "github") return;
    void loadGitHubDirectory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionMode, workspace.id]);

  useEffect(() => {
    const trimmed = websiteUrl.trim();
    setSuggestion(null);
    if (!trimmed) {
      setWebsiteStatus("idle");
      setSuggestionLoading(false);
      setMessage(
        existingProject
          ? `${existingProject.name} needs GitHub or the feedback board before the agent can run.`
          : "Add a website to prefill details, then choose a first source.",
      );
      return;
    }

    if (!isCompleteDomainInput(trimmed)) {
      setWebsiteStatus("idle");
      setSuggestionLoading(false);
      setMessage("Finish the domain, like yourproduct.com.");
      return;
    }

    setWebsiteStatus("idle");
    setSuggestionLoading(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setWebsiteStatus("checking");
      setMessage("Reading website metadata.");
      void suggestProject({ websiteUrl: trimmed })
        .then((next) => {
          if (controller.signal.aborted) return;
          const nextSuggestion = next as ProjectSuggestion;
          setSuggestion(nextSuggestion);
          if (!nameEditedRef.current) {
            setProjectName(nextSuggestion.name);
          }
          if (!slugEditedRef.current) {
            setProjectSlug(nextSuggestion.slug);
          }
          if (!descriptionEditedRef.current && nextSuggestion.description) {
            setDescription(nextSuggestion.description);
          }
          setWebsiteStatus("valid");
          setMessage("Domain verified. Project surface ready.");
          setSuggestionLoading(false);
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          const text = error instanceof Error ? error.message : "Could not read that website yet.";
          setWebsiteStatus("invalid");
          setMessage(text);
          setSuggestionLoading(false);
        });
    }, 1100);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [existingProject, suggestProject, websiteUrl]);

  return (
    <div
      className={cn(
        isFirstRun
          ? "w-full"
          : "t-panel-slide grid min-h-[calc(100svh-5.5rem)] place-items-center p-4 md:p-6",
      )}
      data-open="true"
    >
      <section
        className={cn(
          isFirstRun
            ? "w-full"
            : "grid w-full max-w-4xl overflow-hidden border border-border bg-card lg:grid-cols-[0.9fr_1.1fr]",
        )}
      >
        <div className={cn(!isFirstRun && "border-b border-border p-6 lg:border-b-0 lg:border-r")}>
          {isFirstRun ? (
            <div onKeyDown={handleFirstRunKeyDown}>
              <div className="mb-16 flex items-center gap-1.5" aria-label="Project setup progress">
                {Array.from({ length: setupStepCount }, (_, index) => (
                  <span
                    key={index}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-200",
                      index === setupStep ? "w-5 bg-foreground" : "w-2 bg-muted",
                    )}
                  />
                ))}
              </div>

              <div className="grid min-h-[20rem] content-start gap-4">{renderFirstRunStep()}</div>

              <div className="mt-16 flex items-center gap-2">
                {setupStep > 0 ? (
                  <button
                    type="button"
                    className="grid h-9 min-w-9 place-items-center border border-foreground/60 bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-40"
                    disabled={saving}
                    onClick={() => setSetupStep(0)}
                  >
                    Back
                  </button>
                ) : null}
                {setupStep === 0 ? (
                  <Button
                    type="button"
                    className="h-9 px-4"
                    disabled={saving || suggestionLoading || (!!websiteUrl.trim() && !suggestion)}
                    onClick={continueFromWebsiteStep}
                  >
                    {suggestionLoading ? "Checking..." : websiteUrl.trim() ? "Continue" : "Skip"}{" "}
                    -&gt;
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="h-9 px-4"
                    disabled={!canCreate}
                    onClick={saveProject}
                  >
                    {saving ? "Creating..." : "Create project"} -&gt;
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Project setup
              </p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight">
                {isRepairingProject ? "Connect a first source." : "Create a project."}
              </h1>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {isRepairingProject
                  ? `${existingProject?.name ?? "This project"} needs GitHub or feedback before the agent command center can run.`
                  : "Set up the product the agent will watch."}
              </p>
              <div className="mt-8 grid gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground">Website URL</span>
                  <Input
                    className="mt-2 h-11 bg-background text-sm"
                    onChange={(event) => setWebsiteUrl(event.target.value)}
                    placeholder="https://yourproduct.com"
                    value={websiteUrl}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground">Project name</span>
                  <Input
                    className="mt-2 h-11 bg-background text-sm"
                    disabled={isRepairingProject}
                    onChange={(event) => {
                      const nextName = event.target.value;
                      nameEditedRef.current = true;
                      setProjectName(nextName);
                      if (!slugEditedRef.current) {
                        setProjectSlug(slugPart(nextName, "project"));
                      }
                    }}
                    placeholder="Acme"
                    value={projectName}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground">Project slug</span>
                  <Input
                    className="mt-2 h-11 bg-background text-sm"
                    disabled={isRepairingProject}
                    onChange={(event) => {
                      slugEditedRef.current = true;
                      setProjectSlug(slugPart(event.target.value, ""));
                    }}
                    placeholder="acme"
                    value={projectSlug}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground">Description</span>
                  <textarea
                    className="mt-2 min-h-20 w-full resize-none border border-border bg-background px-3 py-2 text-sm leading-6 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    disabled={isRepairingProject}
                    onChange={(event) => {
                      descriptionEditedRef.current = true;
                      setDescription(event.target.value);
                    }}
                    placeholder="What this project ships and who it serves."
                    value={description}
                  />
                </label>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Portal visibility
                  </span>
                  <div className="mt-2 grid grid-cols-2 border border-border">
                    {(["private", "public"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={cn(
                          "h-10 text-sm font-semibold capitalize transition-[background-color,color]",
                          visibility === option
                            ? "bg-foreground text-background"
                            : "bg-background text-muted-foreground hover:text-foreground",
                        )}
                        onClick={() => setVisibility(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                {renderSourceChoice()}
              </div>
              <p className="mt-3 min-h-5 text-xs text-muted-foreground">{message}</p>
              <Button
                className="mt-5 h-10 w-full bg-foreground text-background hover:bg-background hover:text-foreground"
                disabled={!canCreate}
                onClick={saveProject}
              >
                {saving
                  ? isRepairingProject
                    ? "Saving..."
                    : "Creating..."
                  : isRepairingProject
                    ? "Save source"
                    : "Create project"}
              </Button>
            </>
          )}
        </div>

        {!isFirstRun ? (
          <div className="grid content-center gap-3 bg-background p-6">
            {suggestion ? (
              <div className="border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center overflow-hidden border border-border bg-muted">
                    <ProjectLogo
                      className="size-full"
                      fallbackIconClassName="size-5"
                      logoUrl={suggestion.logoUrl}
                      websiteUrl={suggestion.websiteUrl}
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold">{suggestion.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {suggestion.websiteUrl}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-6 text-muted-foreground">
                  {suggestion.description ??
                    "A source-linked Amend project with feedback, roadmap, changelog, and widgets."}
                </p>
              </div>
            ) : (
              [
                ["Project identity", "From website"],
                ["Feedback board", "Created after save"],
                ["Roadmap", "Ready for source links"],
                ["Changelog", "Review first"],
                ["GitHub sync", "Connect next"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between border border-border bg-muted/20 p-4"
                >
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="text-xs text-muted-foreground">{value}</span>
                </div>
              ))
            )}
          </div>
        ) : null}
      </section>
    </div>
  );

  function renderSourceChoice() {
    const repositoryTrimmed = repositoryInput.trim();
    const repositoryInvalid =
      connectionMode === "github" && Boolean(repositoryTrimmed) && !repositoryDraft;
    return (
      <div className="grid gap-3">
        <div>
          <span className="text-xs font-semibold text-muted-foreground">First source</span>
          <div className="mt-2 grid grid-cols-2 border border-border">
            {[
              ["github", "GitHub repo"],
              ["feedback", "Feedback board"],
            ].map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                className={cn(
                  "h-10 text-sm font-semibold transition-[background-color,color]",
                  connectionMode === mode
                    ? "bg-foreground text-background"
                    : "bg-background text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setConnectionMode(mode as "feedback" | "github")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {connectionMode === "github" ? (
          renderGitHubRepositoryPicker(repositoryInvalid)
        ) : (
          <div className="border border-border bg-muted/20 p-3 text-xs leading-5 text-muted-foreground">
            Feedback board will be the required first source. You can connect GitHub later from
            setup.
          </div>
        )}
      </div>
    );
  }

  function renderGitHubRepositoryPicker(repositoryInvalid: boolean) {
    const installUrl = githubDirectory?.installUrl;
    const directoryUnavailable = githubDirectoryError || githubDirectory?.error;

    return (
      <div className="grid gap-3">
        <div className="border border-border bg-muted/20 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">GitHub App repositories</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {githubDirectoryLoading
                  ? "Refreshing installed organizations."
                  : repositoryCount > 0
                    ? `${repositoryCount} repositories available across ${githubDirectory?.accounts.length ?? 0} accounts.`
                    : "Install the app in an organization, then choose a repository."}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {installUrl ? (
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1.5 border border-border bg-background px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
                  onClick={() => window.open(installUrl, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink className="size-3.5" />
                  Install
                </button>
              ) : null}
              <button
                type="button"
                className="h-8 border border-border bg-background px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
                disabled={githubDirectoryLoading}
                onClick={() => void loadGitHubDirectory()}
              >
                Refresh
              </button>
            </div>
          </div>
          {directoryUnavailable ? (
            <p className="mt-3 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
              {directoryUnavailable}
            </p>
          ) : null}
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Search repositories</span>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-10 bg-background pl-9 text-sm"
              onChange={(event) => setRepoSearch(event.target.value)}
              placeholder="Search org, repo, description"
              value={repoSearch}
            />
          </div>
        </label>

        <div className="max-h-64 overflow-auto border border-border bg-background">
          {githubDirectoryLoading && !githubDirectory ? (
            <div className="grid min-h-28 place-items-center px-3 text-xs text-muted-foreground">
              Loading GitHub installs...
            </div>
          ) : repositoryDirectory.length > 0 ? (
            repositoryDirectory.map((account) => (
              <div key={account.id} className="border-b border-border last:border-b-0">
                <div className="flex items-center justify-between gap-3 bg-muted/20 px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {account.avatarUrl ? (
                      <img
                        alt=""
                        className="size-6 shrink-0 border border-border"
                        src={account.avatarUrl}
                      />
                    ) : (
                      <span className="grid size-6 shrink-0 place-items-center border border-border">
                        <Users className="size-3.5 text-muted-foreground" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{account.login}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{account.type}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {account.repositories.length} repos
                  </span>
                </div>
                {account.repositories.length > 0 ? (
                  account.repositories.map((repository) => {
                    const selected = repositoryInput.trim() === repository.fullName;
                    return (
                      <button
                        key={repository.id}
                        type="button"
                        aria-pressed={selected}
                        className={cn(
                          "grid w-full grid-cols-[1fr_auto] items-center gap-3 border-t border-border px-3 py-2 text-left transition-colors hover:bg-muted/40",
                          selected && "bg-foreground text-background hover:bg-foreground",
                        )}
                        onClick={() => selectGitHubRepository(repository)}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">
                            {repository.fullName}
                          </span>
                          <span
                            className={cn(
                              "mt-0.5 block truncate text-xs text-muted-foreground",
                              selected && "text-background/70",
                            )}
                          >
                            {repository.description ??
                              `${repository.private ? "Private" : "Public"} repository`}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "shrink-0 border border-border px-2 py-1 text-[11px] font-semibold text-muted-foreground",
                            selected && "border-background/50 text-background",
                          )}
                        >
                          {repository.private ? "private" : "public"}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className="border-t border-border px-3 py-3 text-xs text-muted-foreground">
                    No repositories matched this search.
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="grid min-h-28 place-items-center px-3 text-center text-xs leading-5 text-muted-foreground">
              {githubDirectory
                ? "No installed repositories matched. Install another organization or paste a repo below."
                : "Refresh after installing the GitHub App."}
            </div>
          )}
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">
            Manual repository fallback
          </span>
          <Input
            className="mt-2 h-11 bg-background text-sm"
            onChange={(event) => setRepositoryInput(event.target.value)}
            placeholder="owner/repo or https://github.com/owner/repo"
            value={repositoryInput}
          />
          <span
            className={cn(
              "mt-2 block min-h-5 text-xs leading-5 text-muted-foreground",
              repositoryInvalid && "text-foreground",
            )}
          >
            {repositoryInvalid
              ? "Use a GitHub owner/repo path or repository URL."
              : repositoryDraft
                ? `Will connect ${repositoryDraft.owner}/${repositoryDraft.repo}.`
                : "Choose an installed repository, install another org, or start with Feedback board."}
          </span>
        </label>
      </div>
    );
  }

  function loadGitHubDirectory() {
    setGithubDirectoryLoading(true);
    setGithubDirectoryError(null);
    const args = workspace.id === fallbackWorkspace.id ? {} : { workspaceSlug: workspace.id };
    return listGitHubRepositories(args)
      .then((directory) => {
        setGithubDirectory(directory as GitHubInstallationDirectory);
      })
      .catch((error: unknown) => {
        const text = error instanceof Error ? error.message : "Could not load GitHub installs.";
        setGithubDirectoryError(text);
      })
      .finally(() => setGithubDirectoryLoading(false));
  }

  function selectGitHubRepository(repository: GitHubInstalledRepository) {
    setRepositoryInput(repository.fullName);
    setMessage(`Selected ${repository.fullName}.`);
  }

  function saveProject() {
    if (existingProject) {
      saveExistingProjectSource(existingProject);
      return;
    }
    createProject();
  }

  function saveExistingProjectSource(project: ProjectMenuItem) {
    if (!hasFirstSource || saving) {
      setMessage("Connect a repository or choose Feedback board as the first source.");
      return;
    }

    setSaving(true);
    const task =
      connectionMode === "github" && repositoryDraft
        ? connectRepository({
            defaultBranch: "main",
            owner: repositoryDraft.owner,
            projectKey: project.id,
            repo: repositoryDraft.repo,
            repositoryUrl: repositoryDraft.repositoryUrl,
            workspaceSlug: workspace.id,
          })
        : markFeedbackSource({
            projectKey: project.id,
            workspaceSlug: workspace.id,
          });

    void task
      .then(() => {
        toast.success(
          connectionMode === "github" ? "Repository connected" : "Feedback board source saved",
        );
        onCreated(project.id, workspace.id);
      })
      .catch((error: unknown) => {
        toast.error({
          title: "Source connection failed",
          description: errorMessage(
            error,
            connectionMode === "github"
              ? "The selected GitHub repository could not be connected. Check the GitHub installation and try again."
              : "The feedback board source could not be saved. Refresh the project setup page and try again.",
          ),
        });
      })
      .finally(() => setSaving(false));
  }

  function createProject() {
    const name = projectName.trim();
    if (!name) return;
    if (!hasFirstSource) {
      setMessage("Connect a repository or choose Feedback board as the first source.");
      return;
    }
    const slug = slugPart(projectSlug || projectName || websiteUrl, "project");
    const normalizedWebsiteUrl = normalizeOptionalUrl(websiteUrl);
    setSaving(true);
    void create({
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(suggestion?.logoUrl ? { logoUrl: suggestion.logoUrl } : {}),
      ...(connectionMode === "feedback" ? { sourceMode: "feedback" as const } : {}),
      ...(normalizedWebsiteUrl ? { websiteUrl: normalizedWebsiteUrl } : {}),
      name,
      slug,
      visibility,
      ...(workspace.id === fallbackWorkspace.id ? {} : { workspaceSlug: workspace.id }),
    })
      .then(async (created) => {
        const createdProject = created as CreatedProject;
        const projectSlug = createdProject.slug || slug;
        if (connectionMode === "github" && repositoryDraft) {
          try {
            await connectRepository({
              defaultBranch: "main",
              owner: repositoryDraft.owner,
              projectKey: projectSlug,
              repo: repositoryDraft.repo,
              repositoryUrl: repositoryDraft.repositoryUrl,
              workspaceSlug: createdProject.workspaceSlug ?? workspace.id,
            });
          } catch (error) {
            toast.error({
              title: "Project created, repository not connected",
              description: errorMessage(
                error,
                `Project "${name}" was created, but ${repositoryDraft.owner}/${repositoryDraft.repo} could not be connected. Open setup and reconnect the repository.`,
              ),
            });
            onCreated(projectSlug, createdProject.workspaceSlug);
            return;
          }
        }
        toast.success(
          connectionMode === "github" && repositoryDraft
            ? "Project created and repository connected"
            : "Project created with feedback board source",
        );
        onCreated(projectSlug, createdProject.workspaceSlug);
      })
      .catch((error: unknown) => {
        toast.error({
          title: "Project was not created",
          description: errorMessage(
            error,
            `Project "${name}" could not be created in this workspace. Check the slug "${slug}" and try again.`,
          ),
        });
      })
      .finally(() => setSaving(false));
  }

  function renderFirstRunStep() {
    if (setupStep === 0) {
      return (
        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <SetupStepHeader
            title="First things first."
            copy="Which website should the agent use to identify this product?"
          />
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Website URL</span>
            <Input
              className="mt-2 h-11 bg-background text-sm"
              onChange={(event) => setWebsiteUrl(event.target.value)}
              placeholder="yourproduct.com"
              value={websiteUrl}
            />
          </label>
          <div className="mt-4 min-h-14">
            <WebsiteLookupMessage message={message} status={websiteStatus} />
          </div>
        </div>
      );
    }

    return (
      <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <SetupStepHeader
          title="Project surface ready."
          copy="Confirm the identity the agent found. You can change details later in settings."
        />
        <div className="mb-5 border border-border bg-muted/20 p-5">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center overflow-hidden border border-border bg-background">
              <ProjectLogo
                className="size-full"
                fallbackIconClassName="size-6"
                logoUrl={suggestion?.logoUrl}
                websiteUrl={suggestion?.websiteUrl ?? normalizeOptionalUrl(websiteUrl)}
              />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold">{projectName || "Untitled project"}</p>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {normalizeOptionalUrl(websiteUrl) ?? "Manual setup"}
              </p>
            </div>
          </div>
        </div>
        {projectName ? null : (
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Project name</span>
            <Input
              className="mt-2 h-11 bg-background text-sm"
              onChange={(event) => {
                const nextName = event.target.value;
                nameEditedRef.current = true;
                setProjectName(nextName);
                if (!slugEditedRef.current) {
                  setProjectSlug(slugPart(nextName, "project"));
                }
              }}
              placeholder="Amend"
              value={projectName}
            />
          </label>
        )}
        <div className="mt-5">{renderSourceChoice()}</div>
      </div>
    );
  }

  function continueFromWebsiteStep() {
    if (websiteUrl.trim() && !suggestion) {
      setMessage("Wait for the domain check to finish before continuing.");
      return;
    }
    if (!projectName.trim()) {
      const fallbackName = fallbackProjectNameFromUrl(websiteUrl);
      if (fallbackName && !nameEditedRef.current) {
        setProjectName(fallbackName);
      }
      if (fallbackName && !slugEditedRef.current) {
        setProjectSlug(slugPart(fallbackName, "project"));
      }
    }
    setSetupStep(1);
  }

  function handleFirstRunKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    const target = event.target as HTMLElement;
    if (target.tagName === "TEXTAREA") return;
    event.preventDefault();
    if (setupStep === 0) {
      if (!suggestionLoading && (!websiteUrl.trim() || suggestion)) {
        continueFromWebsiteStep();
      }
      return;
    }
    if (canCreate) {
      saveProject();
    }
  }
}

function SetupStepHeader({ copy, title }: { copy: string; title: string }) {
  return (
    <div className="grid gap-2">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm leading-6 text-muted-foreground">{copy}</p>
    </div>
  );
}

function WebsiteLookupMessage({
  message,
  status,
}: {
  message: string;
  status: WebsiteLookupStatus;
}) {
  if (status === "checking") {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <CircleDashed className="size-3.5 animate-spin" />
        Checking domain and loading product details
      </div>
    );
  }

  if (status === "valid") {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
        <Check className="size-3.5" />
        Domain verified
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <p className="text-xs font-semibold leading-5 text-foreground">
        Could not verify that domain. Check the URL and try again.
      </p>
    );
  }

  return <p className="text-xs leading-5 text-muted-foreground">{message}</p>;
}

function ProjectLogo({
  className,
  fallbackIconClassName,
  logoUrl,
  websiteUrl,
}: {
  className: string;
  fallbackIconClassName: string;
  logoUrl?: string;
  websiteUrl?: string;
}) {
  const sources = useMemo(() => {
    const candidates = [
      logoUrl,
      websiteUrl ? googleFaviconUrl(websiteUrl) : undefined,
      websiteUrl ? duckDuckGoFaviconUrl(websiteUrl) : undefined,
    ];
    return candidates.filter((source, index): source is string => {
      return Boolean(source) && candidates.indexOf(source) === index;
    });
  }, [logoUrl, websiteUrl]);
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [sources]);

  const source = sources[sourceIndex];
  if (!source) {
    return <Globe className={cn(fallbackIconClassName, "text-muted-foreground")} />;
  }

  return (
    <img
      alt=""
      className={cn(className, "object-cover")}
      onError={() => setSourceIndex((index) => index + 1)}
      src={source}
    />
  );
}

function EmptyModule({
  action,
  copy,
  icon,
  onAction,
  title,
}: {
  action?: string;
  copy: string;
  icon: ReactElement;
  onAction?: () => void;
  title: string;
}) {
  return (
    <section className="grid min-h-64 place-items-center border border-border bg-card p-6 text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center border border-border bg-muted text-muted-foreground [&_svg]:size-5">
          {icon}
        </span>
        <h2 className="mt-4 text-xl font-semibold">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{copy}</p>
        {action && onAction ? (
          <Button
            className="mt-5 h-9 bg-foreground text-background hover:bg-background hover:text-foreground"
            onClick={onAction}
          >
            {action}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function SidebarSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="grid gap-1 border-t border-border p-3">
      <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </p>
      {children}
    </section>
  );
}

function SidebarItem({
  active,
  icon,
  label,
  onClick,
  value,
}: {
  active?: boolean;
  icon: ReactElement;
  label: string;
  onClick: () => void;
  value?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex min-h-10 items-center justify-between gap-3 px-3 text-left text-sm font-semibold text-muted-foreground transition-[background-color,color,scale] duration-200 hover:bg-muted/40 hover:text-foreground active:scale-[0.96] [&_svg]:size-4",
        active && "bg-muted text-foreground",
      )}
      onClick={onClick}
    >
      <span className="flex min-w-0 items-center gap-3">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      {value ? <span className="shrink-0 text-xs opacity-70 tabular-nums">{value}</span> : null}
    </button>
  );
}

function filterPosts(posts: Post[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return posts;

  return posts.filter((post) =>
    [post.title, post.source, post.date, statusTitle(post.status), post.status, post.boardId]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}

function filterChangelogEntries(entries: DashboardChangelog[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return entries;

  return entries.filter((entry) =>
    [
      entry.title,
      entry.summary,
      entry.body,
      entry.category,
      entry.status,
      entry.version ?? "",
      ...entry.tags,
      ...entry.sourceLinks.map((link) => link.title ?? ""),
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}

function filterRoadmapEntries(entries: DashboardRoadmap[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return entries;

  return entries.filter((entry) =>
    [
      entry.title,
      entry.description,
      entry.impact,
      entry.priority,
      entry.status,
      entry.target ?? "",
      ...entry.sourceLinks.map((link) => link.title ?? ""),
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}

function buildSyncedPosts(feedback: DashboardFeedback[], roadmap: DashboardRoadmap[]) {
  const feedbackPosts = feedback.map(feedbackToPost);
  const existingTitles = new Set(feedbackPosts.map((post) => post.title.trim().toLowerCase()));
  const roadmapPosts = roadmap
    .filter((item) => !existingTitles.has(item.title.trim().toLowerCase()))
    .map(roadmapItemToPost);

  return [...feedbackPosts, ...roadmapPosts].sort(
    (left, right) => right.updatedAt - left.updatedAt,
  );
}

function roadmapItemToPost(item: DashboardRoadmap): Post {
  const status = roadmapStatusToRoadmapStatus(item.status);
  return {
    authorName: "Roadmap",
    body: item.description || item.impact,
    boardId: "feedback",
    date: formatDate(item.updatedAt),
    id: item.recordId ?? item.stableKey,
    labels: [priorityLabel(item.priority), statusTitle(status)],
    linkedChangelogCount: item.changelogCount,
    linkedRoadmapCount: 1,
    source: "Roadmap",
    sourceLinks: item.sourceLinks,
    sourceRoadmapKey: item.stableKey,
    stableKey: `post-roadmap-${item.stableKey}`,
    status,
    title: item.title,
    updatedAt: item.updatedAt,
    voters: item.feedbackCount,
  };
}

function buildSyncedRoadmapEntries(roadmap: DashboardRoadmap[], feedback: Post[]) {
  const existingTitles = new Set(roadmap.map((item) => item.title.trim().toLowerCase()));
  const feedbackRoadmap = feedback
    .filter(
      (post) => !post.sourceRoadmapKey && !existingTitles.has(post.title.trim().toLowerCase()),
    )
    .map(feedbackPostToRoadmapItem);

  return [...feedbackRoadmap, ...roadmap].sort((left, right) => right.updatedAt - left.updatedAt);
}

function feedbackPostToRoadmapItem(post: Post): DashboardRoadmap {
  return {
    changelogCount: post.linkedChangelogCount,
    description: post.body,
    feedbackCount: Math.max(post.voters, 1),
    impact: post.body,
    priority: post.labels.includes("High Priority") ? "P1" : "P2",
    recordId: null,
    sourceLinks: [
      {
        externalId: `feedback:${post.stableKey}`,
        kind: "feedback",
        provider: "feedback",
        title: post.title,
        url: `/dashboard/posts?status=${post.status}`,
      },
      ...post.sourceLinks,
    ],
    stableKey: `roadmap-feedback-${post.stableKey}`,
    status: roadmapStatusToPortalStatus(post.status),
    title: post.title,
    updatedAt: post.updatedAt,
  };
}

function buildRoadmapViews(entries: DashboardRoadmap[]): RoadmapView[] {
  return [
    {
      id: "main",
      name: "Main roadmap",
      description:
        "Every roadmap item Amend knows about, tied back to feedback, GitHub source, and changelog evidence.",
      entries,
    },
  ];
}

function sourceFeedbackKey(item: DashboardRoadmap) {
  const source = item.sourceLinks.find((link) => link.externalId?.startsWith("feedback:"));
  return source?.externalId?.replace(/^feedback:/, "") ?? "";
}

function slugPart(value: string, fallback: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback
  );
}

function titleizeSlug(value: string) {
  return (
    value
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") || "Project"
  );
}

function normalizeOptionalUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function parseRepositoryInput(value: string): RepositoryDraft | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://github.com/${trimmed}`;
  try {
    const url = new URL(normalized);
    if (!["github.com", "www.github.com"].includes(url.hostname.toLowerCase())) {
      return null;
    }
    const [owner, repoPart] = url.pathname.split("/").filter(Boolean);
    const repo = repoPart?.replace(/\.git$/i, "");
    if (!owner || !repo) return null;
    if (!/^[a-z0-9_.-]+$/i.test(owner) || !/^[a-z0-9_.-]+$/i.test(repo)) {
      return null;
    }
    return {
      owner,
      repo,
      repositoryUrl: `https://github.com/${owner}/${repo}`,
    };
  } catch {
    return null;
  }
}

function isCompleteDomainInput(value: string) {
  const normalized = normalizeOptionalUrl(value);
  if (!normalized || /\s/.test(value)) return false;
  try {
    const host = new URL(normalized).hostname.toLowerCase();
    if (host === "localhost") return true;
    if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return true;
    if (host.includes("..") || !host.includes(".")) return false;
    const labels = host.split(".");
    const tld = labels[labels.length - 1] ?? "";
    return (
      labels.every((label) => /^[a-z0-9-]+$/.test(label) && label.length > 0) && tld.length >= 2
    );
  } catch {
    return false;
  }
}

function googleFaviconUrl(value: string) {
  const host = hostFromUrl(value);
  return host
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`
    : undefined;
}

function duckDuckGoFaviconUrl(value: string) {
  const host = hostFromUrl(value);
  return host ? `https://icons.duckduckgo.com/ip3/${encodeURIComponent(host)}.ico` : undefined;
}

function hostFromUrl(value: string) {
  const normalized = normalizeOptionalUrl(value);
  if (!normalized) return "";
  try {
    return new URL(normalized).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function fallbackProjectNameFromUrl(value: string) {
  const normalized = normalizeOptionalUrl(value);
  if (!normalized) return "";
  try {
    const host = new URL(normalized).hostname.replace(/^www\./, "");
    const root = host.split(".")[0] ?? "";
    return root
      .split(/[-_]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  } catch {
    return "";
  }
}

function workspaceFromDashboard(
  dashboard: DashboardOverview | undefined,
  requestedSlug: string,
): Workspace {
  if (!dashboard?.workspace) {
    if (requestedSlug && requestedSlug !== fallbackWorkspace.id) {
      return {
        ...fallbackWorkspace,
        id: requestedSlug,
        portal: `${requestedSlug}.amend.sh`,
      };
    }
    return fallbackWorkspace;
  }

  const name = dashboard.workspace.name || fallbackWorkspace.name;
  const repo =
    dashboard.github?.owner && dashboard.github.repo
      ? `${dashboard.github.owner}/${dashboard.github.repo}`
      : fallbackWorkspace.repo;
  const slug = dashboard.workspace.slug || "portal";

  return {
    description: dashboard.workspace.description,
    id: slug,
    initials: initialsFor(name),
    name,
    plan: "Workspace",
    portalSettings: dashboard.workspace.portalSettings,
    repo,
    portal: `${slug}.amend.sh`,
    visibility: dashboard.workspace.visibility,
  };
}

function projectsToMenuItems(
  projects: DashboardProject[] | undefined,
  fallback: Workspace,
): ProjectMenuItem[] {
  if (projects === undefined) {
    return [];
  }

  if (projects.length === 0) {
    return [
      {
        id: "new-project",
        initials: fallback.initials,
        name: "No project yet",
        plan: "Setup required",
        repo: fallback.repo,
        portal: fallback.portal,
        sourceReady: false,
      },
    ];
  }

  return [...projects]
    .sort((left, right) => (right.updatedAt ?? 0) - (left.updatedAt ?? 0))
    .map((project) => {
      const repository = project.repositories?.[0];
      const sourceReady = Boolean(repository) || project.sourceMode === "feedback";
      const repo =
        repository?.owner && repository.repo
          ? `${repository.owner}/${repository.repo}`
          : repository?.repositoryUrl ||
            (project.sourceMode === "feedback" ? "Feedback board only" : "Connect source");

      return {
        description: project.description,
        id: project.slug,
        initials: initialsFor(project.name),
        logoUrl: project.logoUrl,
        name: project.name,
        plan: "Project",
        repo,
        portal: `${project.slug}.amend.sh`,
        sourceReady,
        websiteUrl: project.websiteUrl,
      };
    });
}

function optimisticProjectMenuItem(
  projectSlug: string,
  workspace: Workspace,
  dashboard: DashboardOverview | undefined,
): ProjectMenuItem {
  const repo =
    dashboard?.github?.owner && dashboard.github.repo
      ? `${dashboard.github.owner}/${dashboard.github.repo}`
      : workspace.repo;
  return {
    id: projectSlug,
    initials: initialsFor(projectSlug),
    name: titleizeSlug(projectSlug),
    plan: "Project",
    portal: `${projectSlug}.amend.sh`,
    repo,
    sourceReady: repo !== fallbackWorkspace.repo,
  };
}

function feedbackToPost(item: DashboardFeedback): Post {
  return {
    authorName: item.authorName,
    body: item.body,
    boardId: "feedback",
    date: formatDate(item.updatedAt),
    id: item.recordId ?? item.stableKey,
    labels: item.labels,
    linkedChangelogCount: item.linkedChangelogCount,
    linkedRoadmapCount: item.linkedRoadmapCount,
    source: item.sourceLinks[0]?.title ?? formatState(item.source),
    sourceLinks: item.sourceLinks,
    stableKey: item.stableKey,
    status: feedbackStatusToRoadmapStatus(item.status),
    title: item.title,
    updatedAt: item.updatedAt,
    voters: item.votes,
  };
}

function feedbackStatusToRoadmapStatus(status: string): RoadmapStatus {
  if (status === "planned") return "next";
  if (status === "linked" || status === "triaged") return "progress";
  if (status === "shipped" || status === "closed") return "done";
  return "backlog";
}

function roadmapStatusToRoadmapStatus(status: string): RoadmapStatus {
  if (status === "planned") return "next";
  if (status === "in_progress") return "progress";
  if (status === "shipped" || status === "closed") return "done";
  return "backlog";
}

function roadmapStatusToPortalStatus(status: RoadmapStatus) {
  if (status === "next") return "planned";
  if (status === "progress") return "in_progress";
  if (status === "done") return "shipped";
  return "under_review";
}

function roadmapStatusToComposerStatus(status: RoadmapStatus | null): StatusItem {
  if (status === "next") return "Planned";
  if (status === "progress") return "In Progress";
  if (status === "done") return "Completed";
  return "In Review";
}

function normalizedPriority(value: string): "P0" | "P1" | "P2" | "P3" {
  return value === "P0" || value === "P1" || value === "P2" || value === "P3" ? value : "P2";
}

function priorityLabel(value: string) {
  const labels: Record<string, string> = {
    P0: "Critical",
    P1: "High priority",
    P2: "Normal priority",
    P3: "Low priority",
  };
  return labels[normalizedPriority(value)] ?? "Normal priority";
}

function persistedRoadmapKey(item: DashboardRoadmap) {
  return item.stableKey.startsWith("roadmap-feedback-")
    ? item.stableKey
    : `roadmap-${slugPart(item.title, "item")}`;
}

function composerStatusToChangelogStatus(status: ComposerSubmitPayload["status"]) {
  if (status === "Completed") return "published" as const;
  if (status === "In Review") return "in_review" as const;
  if (status === "In Progress" || status === "Planned") return "scheduled" as const;
  return "draft" as const;
}

function composerStatusToRoadmapStatus(status: ComposerSubmitPayload["status"]) {
  if (status === "Planned") return "planned" as const;
  if (status === "In Progress") return "in_progress" as const;
  if (status === "Completed") return "shipped" as const;
  if (status === "Rejected") return "closed" as const;
  return "under_review" as const;
}

function changelogCategories(entries: DashboardChangelog[]) {
  const counts = entries.reduce<Record<string, number>>((acc, entry) => {
    const label = formatState(entry.category);
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  const result = Object.entries(counts).map(([label, value]) => ({ label, value }));
  return result.length > 0 ? result : [{ label: "No categories yet", value: 0 }];
}

function changelogCategoryFilters(entries: DashboardChangelog[]) {
  return changelogCategories(entries)
    .filter((category) => category.value > 0)
    .map((category) => stateValue(category.label));
}

function initialsFor(name: string) {
  const parts = name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean);
  return (parts.slice(0, 2).join("") || "AM").toUpperCase();
}

function formatDate(value?: number) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(value);
}

function formatState(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function stateValue(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function providerLabel(provider: string) {
  const labels: Record<string, string> = {
    databuddy: "DataBuddy",
    discord: "Discord",
    github: "GitHub",
    linear: "Linear",
    posthog: "PostHog",
    slack: "Slack",
    support: "Support",
    x: "X",
  };
  return labels[provider] ?? formatState(provider);
}

function normalizeView(value?: string): DashboardView {
  if (value === "members") return "settings";
  if (value === "agent" || value === "share" || value === "board") return "posts";
  return viewValues.includes(value as DashboardView) ? (value as DashboardView) : "posts";
}

function normalizeBoard(value?: string): BoardId {
  return boardValues.includes(value as BoardId) ? (value as BoardId) : "feedback";
}

function normalizeStatus(value?: string): RoadmapStatus | "all" {
  return statusValues.includes(value as RoadmapStatus | "all")
    ? (value as RoadmapStatus | "all")
    : "all";
}

function normalizeRoadmapView(value?: string): RoadmapViewId {
  return value?.trim() || "main";
}

function normalizeWorkspace(value?: string): WorkspaceId {
  return value || fallbackWorkspace.id;
}

function statusTitle(status: RoadmapStatus | "all") {
  const titles: Record<RoadmapStatus | "all", string> = {
    all: "Posts",
    backlog: "Under Review",
    next: "Planned",
    progress: "In Progress",
    done: "Done",
  };
  return titles[status];
}

function viewTitle(view: DashboardView) {
  const titles: Record<DashboardView, string> = {
    posts: "Feedback",
    roadmap: "Roadmap",
    changelog: "Changelog",
    settings: "Settings",
    setup: "Create project",
  };
  return titles[view];
}
