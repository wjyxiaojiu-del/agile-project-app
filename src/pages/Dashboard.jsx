import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { Target, CheckCircle2, ListTodo, Flame, Calendar, AlertTriangle, TrendingUp, Clock, Zap, ArrowRight, ChevronRight } from 'lucide-react';
import api from '../api';

const PROJECT_ID = 1;

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [risks, setRisks] = useState([]);
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    api.getProjectStats(PROJECT_ID).then(d => { setStats(d); setMilestones(d.milestones || []); });
    api.getSprints({ project_id: PROJECT_ID }).then(setSprints);
    api.getRisks({ project_id: PROJECT_ID }).then(setRisks);
  }, []);

  if (!stats) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  const sprintData = sprints.map((s, i) => ({
    name: `S${s.number}`,
    计划: [18, 29, 29, 19][i] || 0,
    完成: 0,
  }));

  const burndownData = Array.from({ length: 10 }, (_, i) => ({
    day: `${i + 1}`,
    理想: Math.round(95 - (95 / 10) * (i + 1)),
    实际: 95,
  }));

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">控制台</h1>
          <p className="text-sm text-slate-400 mt-1">「研途启航」项目运行状态总览</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock size={13} />
          <span>{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<Target size={20} />}
          label="总故事点"
          value={stats.totalPoints}
          sub={`已完成 ${stats.completedPoints} 点`}
          color="indigo"
          trend={stats.pointsCompletionRate}
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="故事完成率"
          value={`${stats.storyCompletionRate}%`}
          sub={`${stats.completedStories}/${stats.totalStories} 个故事`}
          color="emerald"
          trend={stats.storyCompletionRate}
        />
        <StatCard
          icon={<ListTodo size={20} />}
          label="任务进度"
          value={`${stats.doneTasks}/${stats.totalTasks}`}
          sub="已完成 / 总任务"
          color="amber"
          trend={stats.totalTasks ? Math.round(stats.doneTasks / stats.totalTasks * 100) : 0}
        />
        <StatCard
          icon={<Flame size={20} />}
          label="当前迭代"
          value={stats.activeSprint ? `S${stats.activeSprint.number}` : '—'}
          sub={stats.activeSprint?.name?.replace(/Sprint \d+：/, '') || '无活跃迭代'}
          color="rose"
          trend={null}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-5 gap-4">
        <div className="card col-span-3 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">燃尽图</h3>
              <p className="text-xs text-slate-400 mt-0.5">理想进度 vs 实际进度</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-slate-200 rounded" />理想</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-indigo-500 rounded" />实际</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={burndownData}>
              <defs>
                <linearGradient id="burndown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={.15} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,.08)', fontSize: 12 }} />
              <Line type="monotone" dataKey="理想" stroke="#cbd5e1" strokeDasharray="6 4" strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="实际" stroke="#6366f1" strokeWidth={2} fill="url(#burndown)" dot={{ r: 3, fill: '#6366f1' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card col-span-2 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">迭代故事点</h3>
          <p className="text-xs text-slate-400 mb-5">各迭代计划 vs 完成</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sprintData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,.08)', fontSize: 12 }} />
              <Bar dataKey="计划" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
              <Bar dataKey="完成" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Milestones */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><Calendar size={15} className="text-indigo-500" />里程碑</h3>
            <span className="text-xs text-slate-400">{milestones.filter(m => m.status === 'completed').length}/{milestones.length} 已达成</span>
          </div>
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 group" style={{ animation: `slideInRight .3s ease ${i * 60}ms both` }}>
                <div className="relative">
                  <div className={`w-3 h-3 rounded-full ${m.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  {i < milestones.length - 1 && <div className="absolute top-4 left-1/2 -translate-x-1/2 w-px h-6 bg-slate-100" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{m.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{m.due_date}</div>
                </div>
                <span className={`badge text-[10px] ${m.status === 'completed' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' : 'bg-slate-50 text-slate-400 ring-1 ring-slate-100'}`}>
                  {m.status === 'completed' ? '已达成' : '待完成'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Risks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><AlertTriangle size={15} className="text-amber-500" />风险概览</h3>
            <span className="text-xs text-slate-400">{risks.length} 个风险</span>
          </div>
          <div className="space-y-2.5">
            {risks.slice(0, 5).map((r, i) => (
              <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group" style={{ animation: `slideInRight .3s ease ${i * 60}ms both` }}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.level === 'high' ? 'bg-red-500' : r.level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-700 truncate group-hover:text-slate-900 transition-colors">{r.title}</div>
                  <div className="text-[11px] text-slate-400">概率{r.probability} × 影响{r.impact}</div>
                </div>
                <span className={`badge text-[10px] ${r.level === 'high' ? 'badge-p0' : r.level === 'medium' ? 'badge-p1' : 'badge-p2'}`}>
                  {r.level === 'high' ? '高' : r.level === 'medium' ? '中' : '低'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color, trend }) {
  const colors = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100' },
  };
  const c = colors[color] || colors.indigo;

  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.text} flex items-center justify-center ring-1 ${c.ring} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-slate-400">{sub}</span>
        {trend !== null && trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-[11px] font-medium ${trend > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
            <TrendingUp size={12} />{trend}%
          </span>
        )}
      </div>
    </div>
  );
}
