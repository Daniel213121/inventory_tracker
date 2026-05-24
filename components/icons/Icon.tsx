import {
  Grid2x2,
  Package,
  ArrowLeftRight,
  FileText,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Search,
  Plus,
  Download,
  Printer,
  SquarePen,
  Trash2,
  Eye,
  TriangleAlert,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Filter,
  Calendar,
  Bell,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  RefreshCw,
  Upload,
  Building2,
  Truck,
  User,
  KeyRound,
  Lock,
  Mail,
  ExternalLink,
  History,
  MoreHorizontal,
  type LucideProps,
} from 'lucide-react'
import React from 'react'

export type IconName =
  | 'grid' | 'package' | 'arrows' | 'document' | 'chart' | 'gear'
  | 'users' | 'logout' | 'search' | 'plus' | 'download' | 'print' | 'edit' | 'trash'
  | 'eye' | 'alert' | 'check' | 'x' | 'chevronRight' | 'chevronLeft' | 'chevronDown'
  | 'filter' | 'calendar' | 'bell' | 'arrowUp' | 'arrowDown' | 'arrowRight'
  | 'refresh' | 'upload' | 'building' | 'truck' | 'user' | 'key' | 'lock' | 'mail'
  | 'external' | 'history' | 'more'

interface IconProps {
  name: IconName
  size?: number
  stroke?: string
  strokeWidth?: number
  style?: React.CSSProperties
  className?: string
}

const ICON_MAP: Record<IconName, React.ComponentType<LucideProps>> = {
  grid:         Grid2x2,
  package:      Package,
  arrows:       ArrowLeftRight,
  document:     FileText,
  chart:        BarChart3,
  gear:         Settings,
  users:        Users,
  logout:       LogOut,
  search:       Search,
  plus:         Plus,
  download:     Download,
  print:        Printer,
  edit:         SquarePen,
  trash:        Trash2,
  eye:          Eye,
  alert:        TriangleAlert,
  check:        Check,
  x:            X,
  chevronRight: ChevronRight,
  chevronLeft:  ChevronLeft,
  chevronDown:  ChevronDown,
  filter:       Filter,
  calendar:     Calendar,
  bell:         Bell,
  arrowUp:      ArrowUp,
  arrowDown:    ArrowDown,
  arrowRight:   ArrowRight,
  refresh:      RefreshCw,
  upload:       Upload,
  building:     Building2,
  truck:        Truck,
  user:         User,
  key:          KeyRound,
  lock:         Lock,
  mail:         Mail,
  external:     ExternalLink,
  history:      History,
  more:         MoreHorizontal,
}

export function Icon({
  name,
  size = 20,
  stroke = 'currentColor',
  strokeWidth = 1.75,
  style,
  className,
}: IconProps) {
  const LucideIcon = ICON_MAP[name]
  if (!LucideIcon) return null

  return (
    <LucideIcon
      size={size}
      color={stroke}
      strokeWidth={strokeWidth}
      style={style}
      className={className}
    />
  )
}
