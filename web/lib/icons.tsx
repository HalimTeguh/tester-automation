import {
  Activity,
  ArrowRight,
  Bell,
  Bug,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Download,
  Eye,
  FileCheck,
  Gauge,
  Info,
  LineChart,
  Lock,
  MessageSquare,
  MousePointerClick,
  Rocket,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Trash2,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";

export const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Activity,
  ArrowRight,
  Bell,
  Bug,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Download,
  Eye,
  FileCheck,
  Gauge,
  Info,
  LineChart,
  Lock,
  MessageSquare,
  MousePointerClick,
  Rocket,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Trash2,
  User,
  Users,
  X,
  Zap,
};

export function DynamicIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}
