/**
 * App icon set — Hugeicons behind lucide-compatible names.
 *
 * Every component imports its icons from here instead of `lucide-react`, so the
 * existing `<Inbox className="size-4" />` JSX keeps working while the underlying
 * glyphs come from Hugeicons (https://hugeicons.com). Add a new icon by mapping
 * a lucide-style name to a Hugeicons `*Icon` export below.
 */
import {
  Activity03Icon,
  Add01Icon,
  AiMagicIcon,
  Alert02Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  ArrowUpRight01Icon,
  Attachment01Icon,
  BookOpen01Icon,
  BotIcon,
  BrainIcon,
  Calendar01Icon,
  Calendar03Icon,
  Cancel01Icon,
  ChartBarLineIcon,
  ChartUpIcon,
  CheckmarkCircle02Icon,
  CircleIcon,
  Clock01Icon,
  Copy01Icon,
  DashedLineCircleIcon,
  Database01Icon,
  DiscordIcon,
  Download04Icon,
  DragDropVerticalIcon,
  File01Icon,
  FilterHorizontalIcon,
  Folder01Icon,
  FolderAddIcon,
  FolderOpenIcon,
  GitBranchIcon,
  GitCommitIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  Github01Icon,
  GlobalIcon,
  Heading1Icon,
  Heading2Icon,
  Idea01Icon,
  Image02Icon,
  InboxIcon,
  InformationCircleIcon,
  KanbanIcon,
  Key01Icon,
  LayoutGridIcon,
  LeftToRightListNumberIcon,
  LifebuoyIcon,
  Link01Icon,
  LinkSquare02Icon,
  ListViewIcon,
  Loading03Icon,
  Location01Icon,
  Logout01Icon,
  Mail01Icon,
  MapsIcon,
  Megaphone01Icon,
  Message01Icon,
  Message02Icon,
  MoreHorizontalIcon,
  News01Icon,
  Notification01Icon,
  PencilEdit02Icon,
  PlugSocketIcon,
  PlusSignIcon,
  QuoteDownIcon,
  Radio01Icon,
  Road01Icon,
  RssIcon,
  Route01Icon,
  Search01Icon,
  SecurityCheckIcon,
  SentIcon,
  Settings01Icon,
  Settings02Icon,
  SidebarRight01Icon,
  SlidersHorizontalIcon,
  SmileIcon,
  SourceCodeIcon,
  SparklesIcon,
  Tag01Icon,
  Task01Icon,
  TextBoldIcon,
  TextFontIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
  Tick02Icon,
  Undo02Icon,
  UnfoldMoreIcon,
  UserCircleIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { forwardRef, type ComponentPropsWithoutRef, type ComponentType } from "react";

export type IconProps = Omit<ComponentPropsWithoutRef<typeof HugeiconsIcon>, "icon">;
/** Drop-in replacement for lucide-react's `LucideIcon` type. */
export type LucideIcon = ComponentType<IconProps>;

const DEFAULT_STROKE = 2;

function icon(svg: IconSvgElement, displayName: string) {
  const Icon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <HugeiconsIcon ref={ref} icon={svg} strokeWidth={DEFAULT_STROKE} {...props} />
  ));
  Icon.displayName = displayName;
  return Icon;
}

export const Activity = icon(Activity03Icon, "Activity");
export const AiMagic = icon(AiMagicIcon, "AiMagic");
export const AlertCircle = icon(Alert02Icon, "AlertCircle");
export const ArrowLeft = icon(ArrowLeft01Icon, "ArrowLeft");
export const ArrowRight = icon(ArrowRight01Icon, "ArrowRight");
export const ArrowUpRight = icon(ArrowUpRight01Icon, "ArrowUpRight");
export const Bell = icon(Notification01Icon, "Bell");
export const Brain = icon(BrainIcon, "Brain");
export const Bold = icon(TextBoldIcon, "Bold");
export const BookOpen = icon(BookOpen01Icon, "BookOpen");
export const Bot = icon(BotIcon, "Bot");
export const CalendarClock = icon(Calendar03Icon, "CalendarClock");
export const CalendarDays = icon(Calendar01Icon, "CalendarDays");
export const Check = icon(Tick02Icon, "Check");
export const ChevronDown = icon(ArrowDown01Icon, "ChevronDown");
export const ChevronLeft = icon(ArrowLeft01Icon, "ChevronLeft");
export const ChevronRight = icon(ArrowRight01Icon, "ChevronRight");
export const ChevronUp = icon(ArrowUp01Icon, "ChevronUp");
export const ChevronsUpDown = icon(UnfoldMoreIcon, "ChevronsUpDown");
export const Circle = icon(CircleIcon, "Circle");
export const CircleCheckBig = icon(CheckmarkCircle02Icon, "CircleCheckBig");
export const Clock = icon(Clock01Icon, "Clock");
export const CircleDashed = icon(DashedLineCircleIcon, "CircleDashed");
export const ChartNoAxesCombined = icon(ChartBarLineIcon, "ChartNoAxesCombined");
export const ClipboardList = icon(Task01Icon, "ClipboardList");
export const Code2 = icon(SourceCodeIcon, "Code2");
export const Copy = icon(Copy01Icon, "Copy");
export const DatabaseZap = icon(Database01Icon, "DatabaseZap");
export const Download = icon(Download04Icon, "Download");
export const ExternalLink = icon(LinkSquare02Icon, "ExternalLink");
export const FileImage = icon(Image02Icon, "FileImage");
export const FileText = icon(File01Icon, "FileText");
export const FolderOpen = icon(FolderOpenIcon, "FolderOpen");
export const Folder = icon(Folder01Icon, "Folder");
export const FolderPlus = icon(FolderAddIcon, "FolderPlus");
export const GitBranch = icon(GitBranchIcon, "GitBranch");
export const GitPullRequestArrow = icon(GitPullRequestIcon, "GitPullRequestArrow");
export const Globe = icon(GlobalIcon, "Globe");
export const GripVertical = icon(DragDropVerticalIcon, "GripVertical");
export const Heading1 = icon(Heading1Icon, "Heading1");
export const Heading2 = icon(Heading2Icon, "Heading2");
export const Inbox = icon(InboxIcon, "Inbox");
export const Italic = icon(TextItalicIcon, "Italic");
export const KeyRound = icon(Key01Icon, "KeyRound");
export const Lightbulb = icon(Idea01Icon, "Lightbulb");
export const Link2 = icon(Link01Icon, "Link2");
export const List = icon(ListViewIcon, "List");
export const ListOrdered = icon(LeftToRightListNumberIcon, "ListOrdered");
export const Loader2 = icon(Loading03Icon, "Loader2");
export const LogOut = icon(Logout01Icon, "LogOut");
export const Mail = icon(Mail01Icon, "Mail");
export const Map = icon(MapsIcon, "Map");
export const MapPin = icon(Location01Icon, "MapPin");
export const Megaphone = icon(Megaphone01Icon, "Megaphone");
export const MessageSquare = icon(Message01Icon, "MessageSquare");
export const MessageSquareText = icon(Message02Icon, "MessageSquareText");
export const MoreHorizontal = icon(MoreHorizontalIcon, "MoreHorizontal");
export const Newspaper = icon(News01Icon, "Newspaper");
export const PanelRightOpen = icon(SidebarRight01Icon, "PanelRightOpen");
export const Paperclip = icon(Attachment01Icon, "Paperclip");
export const PlugSocket = icon(PlugSocketIcon, "PlugSocket");
export const Plus = icon(PlusSignIcon, "Plus");
export const PlusSquare = icon(Add01Icon, "PlusSquare");
export const Quote = icon(QuoteDownIcon, "Quote");
export const Radio = icon(Radio01Icon, "Radio");
export const RadioTower = icon(RssIcon, "RadioTower");
export const Road = icon(Road01Icon, "Road");
export const Route = icon(Route01Icon, "Route");
export const Search = icon(Search01Icon, "Search");
export const Send = icon(SentIcon, "Send");
export const Settings = icon(Settings01Icon, "Settings");
export const Settings2 = icon(Settings02Icon, "Settings2");
export const Smile = icon(SmileIcon, "Smile");
export const Sparkles = icon(SparklesIcon, "Sparkles");
export const Strikethrough = icon(TextStrikethroughIcon, "Strikethrough");
export const Tag = icon(Tag01Icon, "Tag");
export const Type = icon(TextFontIcon, "Type");
export const Underline = icon(TextUnderlineIcon, "Underline");
export const UserRound = icon(UserCircleIcon, "UserRound");
export const Users = icon(UserGroupIcon, "Users");
export const X = icon(Cancel01Icon, "X");

// — Proactive-agent console additions —
export const Discord = icon(DiscordIcon, "Discord");
export const Filter = icon(FilterHorizontalIcon, "Filter");
export const GitCommit = icon(GitCommitIcon, "GitCommit");
export const GitMerge = icon(GitMergeIcon, "GitMerge");
export const Github = icon(Github01Icon, "Github");
export const Info = icon(InformationCircleIcon, "Info");
export const Kanban = icon(KanbanIcon, "Kanban");
export const LayoutGrid = icon(LayoutGridIcon, "LayoutGrid");
export const LifeBuoy = icon(LifebuoyIcon, "LifeBuoy");
export const ShieldCheck = icon(SecurityCheckIcon, "ShieldCheck");
export const SlidersHorizontal = icon(SlidersHorizontalIcon, "SlidersHorizontal");
export const SquarePen = icon(PencilEdit02Icon, "SquarePen");
export const TrendingUp = icon(ChartUpIcon, "TrendingUp");
export const Undo2 = icon(Undo02Icon, "Undo2");
