import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListTodo, Columns3, CalendarRange, MessageSquare, AlertTriangle, FileText, GraduationCap, ChevronDown } from 'lucide-react';

const links = [
  { to: '/', icon: LayoutDashboard, label: '控制台' },
  { to: '/backlog', icon: ListTodo, label: '事件待办' },
  { to: '/board', icon: Columns3, label: '任务看板' },
  { to: '/plan', icon: CalendarRange, label: '迭代规划' },
  { to: '/standup', icon: MessageSquare, label: '每日日程' },
  { to: '/risks', icon: AlertTriangle, label: '风险管控' },
  { to: '/report', icon: FileText, label: '项目报告' },
];

export default function Sidebar() {
  return (
    <aside className="w-[220px] bg-white border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-5 h-16 flex items-center gap-3 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
          <GraduationCap size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 tracking-tight">研途启航</h1>
          <p className="text-[10px] text-slate-400 font-medium">项目管理系统</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold text-slate-300 uppercase tracking-widest">导航</div>
        {links.map((l, i) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <l.icon size={17} strokeWidth={2} />
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sprint Status */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">当前迭代</span>
          <span className="text-[10px] font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">Sprint 1</span>
        </div>
        <div className="text-[11px] text-slate-400 mb-2">入学筹备冲刺</div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out" style={{ width: '0%' }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-slate-300">进度</span>
          <span className="text-[10px] font-medium text-slate-400">0%</span>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">研</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-700 truncate">2026级研究生</div>
          <div className="text-[10px] text-slate-400">项目负责人</div>
        </div>
        <ChevronDown size={14} className="text-slate-300" />
      </div>
    </aside>
  );
}
