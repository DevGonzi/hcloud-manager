import { useEffect, useState } from 'react'
import { LineChart, Line, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import type { HCloudServer, MetricType } from '../../../../shared/types'
import { useT } from '../../i18n'

interface DataPoint {
  t: number
  v: number
}

interface Props {
  server: HCloudServer
  projectId: string | null
}

function MiniChart({
  data,
  color,
  maxValue
}: {
  data: DataPoint[]
  color: string
  maxValue?: number
}) {
  const yMax = maxValue || 100
  return (
    <div className="h-12 bg-bg-3 border border-border rounded-md overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 28 }}>
          <YAxis
            type="number"
            domain={[0, yMax]}
            width={20}
            tick={{ fontSize: 8, fill: 'var(--tx3)' }}
          />
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          <Tooltip
            contentStyle={{
              background: '#1E2230',
              border: '1px solid #252A38',
              borderRadius: 4,
              fontSize: 10
            }}
            formatter={(v) => [typeof v === 'number' ? `${(v as number).toFixed(1)}%` : '']}
            labelFormatter={() => ''}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ServerMetrics({ server, projectId }: Props) {
  const { t } = useT()
  const [cpuData, setCpuData] = useState<DataPoint[]>([])
  const [netData, setNetData] = useState<DataPoint[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!projectId || server.status !== 'running') return
    setLoading(true)

    const end = new Date().toISOString()
    const start = new Date(Date.now() - 30 * 60 * 1000).toISOString()

    async function fetchMetrics(type: MetricType) {
      const res = await window.hcloud.api.getMetrics(projectId!, server.id, type, start, end)
      if (!res.success) return []
      const series = Object.values(res.data.time_series)[0]
      if (!series) return []
      return series.values.map(([t, v]) => ({ t, v: parseFloat(v) }))
    }

    Promise.all([fetchMetrics('cpu'), fetchMetrics('network')]).then(([cpu, net]) => {
      // Normalize CPU metrics to 0-100% scale
      const normalizedCpu = cpu.map((point) => ({
        t: point.t,
        v: point.v / server.server_type.cores
      }))
      setCpuData(normalizedCpu)
      setNetData(net)
      setLoading(false)
    })
  }, [server.id, projectId])

  if (server.status !== 'running') {
    return <p className="text-xs text-text-3 text-center py-4">{t('metrics.offline')}</p>
  }

  if (loading) return <p className="text-xs text-text-3 text-center py-4">{t('metrics.loading')}</p>

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="text-[10px] font-semibold text-text-3 uppercase tracking-wider font-mono mb-1.5">
          {t('metrics.cpu')} ({server.server_type.cores} vCPU)
        </div>
        <MiniChart data={cpuData} color="#D50C2D" maxValue={100} />
      </div>
      <div>
        <div className="text-[10px] font-semibold text-text-3 uppercase tracking-wider font-mono mb-1.5">
          {t('metrics.network')}
        </div>
        <MiniChart data={netData} color="#4A9EFF" />
      </div>
    </div>
  )
}
