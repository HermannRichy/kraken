// Icônes animées issues de lucide-animated (https://lucide-animated.com, licence MIT,
// voir LICENSE-lucide-animated). Chaque icône expose startAnimation / stopAnimation.
import { ArrowRightIcon } from "./arrow-right";
import { ArrowUpRightIcon } from "./arrow-up-right";
import { CalendarDaysIcon } from "./calendar-days";
import { CheckIcon } from "./check";
import { CircleHelpIcon } from "./circle-help";
import { CopyIcon } from "./copy";
import { CpuIcon } from "./cpu";
import { FileTextIcon } from "./file-text";
import { FolderCodeIcon } from "./folder-code";
import { GitCommitHorizontalIcon } from "./git-commit-horizontal";
import { LockIcon } from "./lock";
import { MenuIcon } from "./menu";
import { PartyPopperIcon } from "./party-popper";
import { SendIcon } from "./send";
import { ServerCrashIcon } from "./server-crash";
import { ShieldCheckIcon } from "./shield-check";
import { SparklesIcon } from "./sparkles";
import { TerminalIcon } from "./terminal";
import { TicketIcon } from "./ticket";
import { TimerIcon } from "./timer";
import { UsersIcon } from "./users";
import { WebhookIcon } from "./webhook";
import { XIcon } from "./x";
import { ZapIcon } from "./zap";

export const ICONS = {
  "arrow-right": ArrowRightIcon,
  "arrow-up-right": ArrowUpRightIcon,
  "calendar-days": CalendarDaysIcon,
  check: CheckIcon,
  "circle-help": CircleHelpIcon,
  copy: CopyIcon,
  cpu: CpuIcon,
  "file-text": FileTextIcon,
  "folder-code": FolderCodeIcon,
  "git-commit": GitCommitHorizontalIcon,
  lock: LockIcon,
  menu: MenuIcon,
  "party-popper": PartyPopperIcon,
  send: SendIcon,
  "server-crash": ServerCrashIcon,
  "shield-check": ShieldCheckIcon,
  sparkles: SparklesIcon,
  terminal: TerminalIcon,
  ticket: TicketIcon,
  timer: TimerIcon,
  users: UsersIcon,
  webhook: WebhookIcon,
  x: XIcon,
  zap: ZapIcon,
} as const;

export type IconName = keyof typeof ICONS;

export type AnimatedIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};
