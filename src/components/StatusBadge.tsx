import {
  AlertOctagon,
  AlertTriangle,
  Book,
  Bookmark,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  HandCoins,
  Minus,
  SearchX,
  Sparkles,
  Star,
  Tag,
  ThumbsUp,
  Wrench,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import {
  getConditionBadge,
  getConditionLabel,
  getLoanStatusBadge,
  getLoanStatusLabel,
  getOwnershipStatusBadge,
  getOwnershipStatusLabel,
  getReadingStatusBadge,
  getReadingStatusLabel,
} from '@/constants'

/** Peta ikon untuk tiap status - warna bukan satu-satunya penanda */
const ICONS: Record<string, LucideIcon> = {
  belum_dibaca: Book,
  sedang_dibaca: Bookmark,
  sudah_dibaca: CheckCircle2,
  tidak_ingin_dibaca: XCircle,
  dimiliki: Check,
  dipinjamkan: HandCoins,
  hilang: SearchX,
  ingin_dijual: Tag,
  rusak: AlertTriangle,
  baru: Sparkles,
  sangat_baik: Star,
  baik: ThumbsUp,
  cukup: Minus,
  dipinjam: Clock,
  terlambat: AlertOctagon,
  dikembalikan: CheckCheck,
}

function renderIcon(iconName?: string | null, size = 12) {
  const Icon = iconName ? ICONS[iconName] : undefined
  return Icon ? <Icon size={size} aria-hidden="true" /> : null
}

export function ReadingStatusBadge({ status }: { status?: string | null }) {
  return (
    <Badge
      className={getReadingStatusBadge(status)}
      icon={renderIcon(status ?? undefined)}
      title={`Status membaca: ${getReadingStatusLabel(status)}`}
    >
      {getReadingStatusLabel(status)}
    </Badge>
  )
}

export function OwnershipStatusBadge({ status }: { status?: string | null }) {
  return (
    <Badge
      className={getOwnershipStatusBadge(status)}
      icon={renderIcon(status ?? undefined)}
      title={`Status kepemilikan: ${getOwnershipStatusLabel(status)}`}
    >
      {getOwnershipStatusLabel(status)}
    </Badge>
  )
}

export function ConditionBadge({ condition }: { condition?: string | null }) {
  return (
    <Badge
      className={getConditionBadge(condition)}
      icon={condition === 'rusak' ? <Wrench size={12} aria-hidden="true" /> : renderIcon(condition)}
      title={`Kondisi buku: ${getConditionLabel(condition)}`}
    >
      {getConditionLabel(condition)}
    </Badge>
  )
}

export function LoanStatusBadge({ status }: { status?: string | null }) {
  return (
    <Badge
      className={getLoanStatusBadge(status)}
      icon={renderIcon(status ?? undefined)}
      title={`Status peminjaman: ${getLoanStatusLabel(status)}`}
    >
      {getLoanStatusLabel(status)}
    </Badge>
  )
}
