import { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle2, Circle, BarChart3, TrendingUp, Award } from 'lucide-react';
import api from '../api';

const PROJECT_ID = 1;

export default function Report() {
  const [stats, setStats] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [stories, setStories] = useState([]);
  const [risks, setRisks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [deliverables, setDeliverables] = useState([
    { id: 1, name: '入学材料清单', checked: false },
    { id: 2, name: '导师沟通纪要', checked: false },
    { id: 3, name: '研究方向规划文档', checked: false },
    { id: 4, name: '读书笔记 ×3', checked: false },
    { id: 5, name: '文献管理库（Zotero）', checked: false },
    { id: 6, name: '知识库系统（Obsidian）', checked: false },
    { id: 7, name: '学术写作模板', checked: false },
    { id: 8, name: '项目复盘报告', checked: false },
  ]);

  useEffect(() => {
    api.getProjectStats(PROJECT_ID).then(d => { setStats(d); setMilestones(d.milestones || []); });
    api.getSprints({ project_id: PROJECT_ID }).then(setSprints);
    api.getStories({ project_id: PROJECT_ID }).then(setStories);
    api.getRisks({ project_id: PROJECT_ID }).then(setRisks);
  }, []);

  const toggleDeliverable = (id) => setDeliverables(prev => prev.map(d => d.id === id ? { ...d, checked: !d.checked } : d));

  const handleExport = () => {
    const text = generateReport(stats, sprints, stories, risks, milestones, deliverables);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = '项目复盘报告.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  if (!stats) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>;

  const doneDeliverables = deliverables.filter(d => d.checked).length;

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">项目报告</h1>
          <p className="text-sm text-slate-400 mt-1">自动生成的项目概况与复盘数据</p>
        </div>
        <button onClick={handleExport} className="btn btn-primary">
          <Download size={16} /> 导出报告
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '总故事点', value: stats.totalPoints, sub: `已完成 ${stats.completedPoints}`, color: 'indigo' },
          { label: '故事完成率', value: `${stats.storyCompletionRate}%`, sub: `${stats.completedStories}/${stats.totalStories} 个`, color: 'emerald' },
          { label: '任务完成率', value: `${stats.totalTasks ? Math.round(stats.doneTasks / stats.totalTasks * 100) : 0}%`, sub: `${stats.doneTasks}/${stats.totalTasks} 个`, color: 'amber' },
          { label: '交付物进度', value: `${doneDeliverables}/${deliverables.length}`, sub: `已勾选 ${doneDeliverables} 项`, color: 'rose' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ animation: `slideUp .3s ease ${i * 80}ms both` }}>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{s.label}</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{s.value}</div>
            <span className="text-xs text-slate-400">{s.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Sprint Summary */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 size={15} className="text-indigo-500" /> 迭代完成情况</h3>
          <div className="space-y-4">
            {sprints.map((s, i) => {
              const ss = stories.filter(st => st.sprint_id === s.id);
              const done = ss.filter(st => st.status === 'done').length;
              const total = ss.length;
              const pct = total ? Math.round(done / total * 100) : 0;
              return (
                <div key={s.id} style={{ animation: `slideInRight .3s ease ${i * 80}ms both` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700">S{s.number}：{s.name.replace(/Sprint \d+：/, '')}</span>
                    <span className="text-xs text-slate-400">{done}/{total} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestones */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2"><Award size={15} className="text-amber-500" /> 里程碑达成</h3>
          <div className="space-y-2.5">
            {milestones.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors" style={{ animation: `slideInRight .3s ease ${i * 80}ms both` }}>
                {m.status === 'completed' ? <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> : <Circle size={18} className="text-slate-300 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700">{m.name}</div>
                  <div className="text-[11px] text-slate-400">{m.due_date}</div>
                </div>
                <span className={`badge text-[10px] ${m.status === 'completed' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' : 'bg-slate-100 text-slate-400 ring-1 ring-slate-200'}`}>
                  {m.status === 'completed' ? '已达成' : '待达成'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deliverables */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2"><FileText size={15} className="text-indigo-500" /> 交付物清单</h3>
        <div className="grid grid-cols-2 gap-2">
          {deliverables.map((d, i) => (
            <button key={d.id} onClick={() => toggleDeliverable(d.id)} className={`flex items-center gap-3 p-3.5 rounded-xl text-left transition-all duration-200 ${d.checked ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-slate-50 hover:bg-slate-100 ring-1 ring-transparent'}`} style={{ animation: `slideUp .2s ease ${i * 40}ms both` }}>
              <CheckCircle2 size={18} className={`transition-colors ${d.checked ? 'text-emerald-500' : 'text-slate-200'}`} />
              <span className={`text-sm transition-colors ${d.checked ? 'text-emerald-700 font-medium line-through' : 'text-slate-600'}`}>{d.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Risk Summary */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">风险概况</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { level: 'high', label: '高风险', color: 'from-red-500 to-rose-600', bg: 'bg-red-50', text: 'text-red-600' },
            { level: 'medium', label: '中风险', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-600' },
            { level: 'low', label: '低风险', color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
          ].map(({ level, label, color, bg, text }) => {
            const count = risks.filter(r => r.level === level).length;
            return (
              <div key={level} className={`relative overflow-hidden ${bg} rounded-xl p-5 text-center`}>
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-10 rounded-full -translate-y-6 translate-x-6`} />
                <div className={`text-3xl font-bold ${text}`}>{count}</div>
                <div className="text-xs text-slate-500 mt-1">{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function generateReport(stats, sprints, stories, risks, milestones, deliverables) {
  let r = '';
  r += '═══════════════════════════════════════\n';
  r += '  「研途启航」项目复盘报告\n';
  r += '  生成时间：' + new Date().toLocaleString('zh-CN') + '\n';
  r += '═══════════════════════════════════════\n\n';
  r += '【一、项目概况】\n';
  r += `项目名称：研途启航 - 2026级研究生入学准备全流程管理项目\n`;
  r += `项目周期：8周（2026.06.01 - 2026.07.26）\n`;
  r += `总故事点：${stats.totalPoints} | 已完成：${stats.completedPoints}\n`;
  r += `故事完成率：${stats.storyCompletionRate}%\n`;
  r += `任务完成率：${stats.totalTasks ? Math.round(stats.doneTasks / stats.totalTasks * 100) : 0}%\n\n`;
  r += '【二、迭代完成情况】\n';
  sprints.forEach(s => { const ss = stories.filter(st => st.sprint_id === s.id); const done = ss.filter(st => st.status === 'done').length; r += `S${s.number} ${s.name}：${done}/${ss.length}\n`; });
  r += '\n【三、里程碑达成】\n';
  milestones.forEach(m => { r += `${m.name}（${m.due_date}）：${m.status === 'completed' ? '已达成' : '未达成'}\n`; });
  r += '\n【四、交付物清单】\n';
  deliverables.forEach(d => { r += `${d.checked ? '[x]' : '[ ]'} ${d.name}\n`; });
  r += '\n【五、风险概况】\n';
  risks.forEach(risk => { r += `- ${risk.title} [${risk.level}] ${risk.status}\n`; });
  r += '\n═══════════════════════════════════════\n  报告结束\n═══════════════════════════════════════\n';
  return r;
}
