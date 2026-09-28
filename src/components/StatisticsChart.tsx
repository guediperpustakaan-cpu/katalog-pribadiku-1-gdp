import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react'
import type { GroupCount, YearCount } from '@/types'
import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

export type ChartType = 'bar' | 'pie' | 'line'

export interface StatisticsChartProps {
  type?: ChartType
  title: string
  description?: string
  data: GroupCount[] | YearCount[]
  /** Warna utama untuk bar/line chart */
  color?: string
  /** Label sumbu horizontal */
  xLabel?: string
  /** Label sumbu vertikal */
  yLabel?: string
  /** Tampilkan legend (default: hanya untuk pie chart) */
  showLegend?: boolean
  className?: string
  /** Mode compact untuk dashboard */
  compact?: boolean
}

/** Palet warna yang konsisten untuk diagram */
export const CHART_COLORS = [
  'hsl(var(--primary))',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#ec4899',
  '#14b8a6',
  '#84cc16',
  '#f97316',
  '#6366f1',
]

type ChartDatum = { name: string; value: number; id?: string }

function normalize(
  data: GroupCount[] | YearCount[]
): ChartDatum[] {
  return data.map((item) => ({
    name: String((item as GroupCount).name ?? (item as YearCount).year),
    value: item.count,
    id: (item as GroupCount).id,
  }))
}

interface TooltipPayload {
  active?: boolean
  payload?: { name?: string; value?: number; payload?: ChartDatum }[]
}

function ChartTooltip({ active, payload }: TooltipPayload) {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0]
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-foreground">{item.payload?.name}</p>
      <p className="text-sm font-bold text-primary">{item.value} buku</p>
    </div>
  )
}

const TYPE_ICONS = {
  bar: BarChart3,
  pie: PieChartIcon,
  line: LineChartIcon,
} as const

/**
 * Pembungkus diagram Recharts dengan tema aplikasi (warna via CSS variables),
 * label bahasa Indonesia, dan layout responsif.
 */
export function StatisticsChart({
  type = 'bar',
  title,
  description,
  data,
  color = CHART_COLORS[0],
  xLabel,
  yLabel,
  showLegend,
  className,
  compact = false,
}: StatisticsChartProps) {
  const chartData = useMemo(() => normalize(data), [data])
  const Icon = TYPE_ICONS[type]
  const hasData = chartData.length > 0

  return (
    <Card className={cn('flex flex-col p-5', className)}>
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {hasData ? (
        <div className={cn('w-full', compact ? 'h-56' : 'h-64')}>
          <ResponsiveContainer width="100%" height="100%">
            {type === 'pie' ? (
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={compact ? 62 : 78}
                  innerRadius={compact ? 34 : 44}
                  paddingAngle={2}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.id ?? index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                {(showLegend ?? true) && (
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: '11px' }}
                    formatter={(value: string) => (
                      <span className="text-muted-foreground">{value}</span>
                    )}
                  />
                )}
              </PieChart>
            ) : type === 'line' ? (
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  label={
                    xLabel
                      ? { value: xLabel, position: 'insideBottom', offset: -4, fontSize: 11 }
                      : undefined
                  }
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  label={
                    yLabel
                      ? { value: yLabel, angle: -90, position: 'insideLeft', fontSize: 11 }
                      : undefined
                  }
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  label={
                    xLabel
                      ? { value: xLabel, position: 'insideBottom', offset: -4, fontSize: 11 }
                      : undefined
                  }
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  label={
                    yLabel
                      ? { value: yLabel, angle: -90, position: 'insideLeft', fontSize: 11 }
                      : undefined
                  }
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
                <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} maxBarSize={64}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`bar-${entry.id ?? index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-center',
            compact ? 'h-56' : 'h-64'
          )}
        >
          <Icon className="h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Belum ada data untuk ditampilkan.</p>
          <p className="text-xs text-muted-foreground/70">
            Tambahkan buku agar statistik ini muncul.
          </p>
        </div>
      )}
    </Card>
  )
}
