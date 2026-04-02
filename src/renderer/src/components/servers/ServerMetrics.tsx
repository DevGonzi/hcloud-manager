import { useEffect, useState } from 'react'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import type { HCloudServer, MetricType } from '../../../../shared/types'

interface DataPoint { t: number; v: number }

interface Props {
  server: HCloudServer
  projectId: string | null
}

function MiniChart({ data, color }: { data: DataPoint[]; color: string }) {
  return (
    <div className="h-12 bg-bg-3 border border-border rounded-md overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          <Tooltip
            contentStyle={{ background: '#1E2230', border: '1px solid #252A38', borderRadius: 4, fontSize: 10 }}
            formatter={(v: number) => [`${v.toFixed(1)}%`]}
            labelFormatter={() => ''}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ServerMetrics({ server, projectId }: Props) {
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
      setCpuData(cpu)
      setNetData(net)
      setLoading(false)
    })
  }, [server.id, projectId])

  if (server.status !== 'running') {
    return <p className="text-xs text-text-3 text-center py-4">Server ist offline</p>
  }

  if (loading) return <p className="text-xs text-text-3 text-center py-4">Lade Metriken…</p>

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="text-[10px] font-semibold text-text-3 uppercase tracking-wider font-mono mb-1.5">CPU</div>
        <MiniChart data={cpuData} color="#D50C2D" />
      </div>
      <div>
        <div className="text-[10px] font-semibold text-text-3 uppercase tracking-wider font-mono mb-1.5">Network</div>
        <MiniChart data={netData} color="#4A9EFF" />
      </div>
    </div>
  )
}
