import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListTodo, Columns3, CalendarRange, MessageSquare, AlertTriangle, FileText, GraduationCap, Sparkles, Bot, BookOpen, Users } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import api from '../api';

const links = [
  { to: '/', icon: LayoutDashboard, label: '控制台' },
  { to: '/backlog', icon: ListTodo, label: '事件待办' },
  { to: '/board', icon: Columns3, label: '任务看板' },
  { to: '/plan', icon: CalendarRange, label: '迭代规划' },
  { to: '/standup', icon: MessageSquare, label: '每日日程' },
  { to: '/risks', icon: AlertTriangle, label: '风险管控' },
  { to: '/report', icon: FileText, label: '项目报告' },
  { to: '/literature', icon: BookOpen, label: '文献知识库' },
  { to: '/meetings', icon: Users, label: '导师沟通' },
  { to: '/ai', icon: Bot, label: 'AI 助手' },
];

export default function Sidebar() {
  const { projectId } = useProject();
  const [activeSprint, setActiveSprint] = useState(null);
  const [sprintStats, setSprintStats] = useState(null);

  useEffect(() => {
    api.getSprints({ project_id: projectId }).then(sprints => {
      const active = sprints.find(sp => sp.status === 'active') || sprints[0];
      if (active) {
        setActiveSprint(active);
        api.getSprintStats(active.id).then(setSprintStats);
      }
    }).catch(() => {});
  }, [projectId]);

  const sprintPct = sprintStats?.totalPoints
    ? Math.round((sprintStats.donePoints || 0) / sprintStats.totalPoints * 100)
    : 0;

  return (
    <aside className="w-[240px] flex flex-col h-screen fixed left-0 top-0 z-40"
      style={{
        background: 'linear-gradient(180deg, #6AB4DC 0%, #7ec8e8 50%, #6AB4DC 100%)',
        borderRight: '1px solid rgba(30,100,160,0.15)',
      }}>
      {/* Ambient glow */}
      <div className="absolute top-0 left-0 w-full h-40 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 100% at 50% -20%, rgba(59,130,246,0.08), transparent)' }} />

      {/* Logo */}
      <div className="px-5 h-16 flex items-center gap-3 border-b border-white/[0.06] relative">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center relative"
          style={{
            background: 'linear-gradient(135deg, #ea580c, #f97316)',
            boxShadow: '0 4px 16px rgba(234,88,12,0.4), 0 0 30px rgba(234,88,12,0.15)',
          }}>
          <GraduationCap size={20} className="text-white relative z-10" />
          <div className="absolute inset-0 rounded-xl animate-ping opacity-20"
            style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }} />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-tight">研途启航</h1>
          <p className="text-[10px] text-white/60 font-medium flex items-center gap-1">
            <Sparkles size={9} /> Agile Project
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide relative">
        <div className="px-3 py-2 text-[10px] font-semibold text-white/40 uppercase tracking-widest">导航</div>
        {links.map((l, i) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            style={{ animation: `staggerFadeIn .4s var(--spring-bounce) ${i * 50}ms both` }}
          >
            <l.icon size={17} strokeWidth={2} />
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sprint Status */}
      {activeSprint && (
        <div className="px-4 py-4 border-t border-white/[0.06] relative"
          style={{ animation: 'slideUp .5s var(--spring-bounce) .3s both' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white/70">当前迭代</span>
            <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.2)' }}>
              S{activeSprint.number}
            </span>
          </div>
          <div className="text-[11px] text-white/60 mb-3">
            {activeSprint.name.replace(/Sprint \d+：/, '')}
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <div
              className="h-full rounded-full relative overflow-hidden"
              style={{
                width: `${sprintPct}%`,
                background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                boxShadow: '0 0 10px rgba(59,130,246,0.3)',
                animation: 'progressBar 1.2s var(--spring-smooth) .5s both',
              }}
            >
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', animation: 'shimmerBar 2s infinite' }} />
            </div>
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-white/40">进度</span>
            <span className="text-[10px] font-bold text-white/80">{sprintPct}%</span>
          </div>
        </div>
      )}

      {/* User */}
      <div className="px-4 py-3 border-t border-white/[0.06] flex items-center gap-3"
        style={{ animation: 'slideUp .5s var(--spring-bounce) .4s both' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold relative"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
            boxShadow: '0 2px 10px rgba(245,158,11,0.3)',
          }}>
          研
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2"
            style={{ borderColor: '#6AB4DC' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-white/90 truncate">2026级研究生</div>
          <div className="text-[10px] text-white/50">项目负责人</div>
        </div>
      </div>
    </aside>
  );
}
