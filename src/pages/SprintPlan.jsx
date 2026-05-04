import { useState, useEffect } from 'react';
import { Target, Zap, ChevronRight, Edit3, Check, X } from 'lucide-react';
import api from '../api';

const PROJECT_ID = 1;

export default function SprintPlan() {
  const [sprints, setSprints] = useState([]);
  const [current, setCurrent] = useState(null);
  const [stories, setStories] = useState([]);
  const [stats, setStats] = useState(null);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goal, setGoal] = useState('');

  useEffect(() => {
    api.getSprints({ project_id: PROJECT_ID }).then(s => {
      setSprints(s);
      if (s.length) { setCurrent(s[0]); setGoal(s[0].goal || ''); }
    });
  }, []);

  useEffect(() => {
    if (current) {
      api.getStories({ sprint_id: current.id }).then(setStories);
      api.getSprintStats(current.id).then(setStats);
      setGoal(current.goal || '');
    }
  }, [current]);

  const handleSaveGoal = async () => {
    await api.updateSprint(current.id, { goal });
    setCurrent({ ...current, goal });
    setEditingGoal(false);
  };

  if (!current) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>;

  const totalPoints = stories.reduce((s, st) => s + st.story_points, 0);

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">迭代规划</h1>
          <p className="text-sm text-slate-400 mt-1">规划迭代目标与任务分配</p>
        </div>
        <select value={current.id} onChange={e => setCurrent(sprints.find(s => s.id === +e.target.value))} className="select w-52">
          {sprints.map(s => <option key={s.id} value={s.id}>S{s.number}：{s.name.replace(/Sprint \d+：/, '')}</option>)}
        </select>
      </div>

      {/* Sprint Info Card */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-200">S{current.number}</div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">{current.name.replace(/Sprint \d+：/, '')}</h2>
            <p className="text-xs text-slate-400">{current.start_date} — {current.end_date}</p>
          </div>
          <span className={`badge ml-auto ${current.status === 'planned' ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100' : current.status === 'active' ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-100' : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'}`}>
            {current.status === 'planned' ? '计划中' : current.status === 'active' ? '进行中' : '已完成'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-5">
          <div className="bg-slate-50 rounded-xl p-3.5">
            <div className="text-[11px] text-slate-400 mb-1">故事数</div>
            <div className="text-lg font-bold text-slate-800">{stories.length}<span className="text-xs font-normal text-slate-400 ml-1">个</span></div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5">
            <div className="text-[11px] text-slate-400 mb-1">故事点</div>
            <div className="text-lg font-bold text-slate-800">{totalPoints}<span className="text-xs font-normal text-slate-400 ml-1">点</span></div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5">
            <div className="text-[11px] text-slate-400 mb-1">已完成</div>
            <div className="text-lg font-bold text-emerald-600">{stats?.donePoints || 0}<span className="text-xs font-normal text-slate-400 ml-1">点</span></div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5">
            <div className="text-[11px] text-slate-400 mb-1">完成率</div>
            <div className="text-lg font-bold text-indigo-600">{totalPoints ? Math.round((stats?.donePoints || 0) / totalPoints * 100) : 0}<span className="text-xs font-normal text-slate-400 ml-1">%</span></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">迭代目标</span>
            {!editingGoal && <button onClick={() => setEditingGoal(true)} className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors"><Edit3 size={12} />编辑</button>}
          </div>
          {editingGoal ? (
            <div className="flex gap-2">
              <input value={goal} onChange={e => setGoal(e.target.value)} className="input flex-1" />
              <button onClick={handleSaveGoal} className="btn btn-primary py-2"><Check size={14} /></button>
              <button onClick={() => setEditingGoal(false)} className="btn btn-secondary py-2"><X size={14} /></button>
            </div>
          ) : (
            <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3.5">{current.goal || '暂未设置目标'}</p>
          )}
        </div>
      </div>

      {/* Points Distribution */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-slate-800 flex items-center gap-2"><Zap size={15} className="text-amber-500" /> 故事点分布</span>
          <span className="text-xs text-slate-400">{stats?.donePoints || 0} / {totalPoints} 点已完成</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${totalPoints ? (stats?.donePoints || 0) / totalPoints * 100 : 0}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {['P0', 'P1', 'P2'].map(p => {
            const pts = stories.filter(s => s.priority === p).reduce((a, s) => a + s.story_points, 0);
            const colors = { P0: 'from-red-500 to-rose-600', P1: 'from-amber-500 to-orange-600', P2: 'from-emerald-500 to-green-600' };
            return (
              <div key={p} className="relative overflow-hidden rounded-xl p-4 bg-slate-50">
                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${colors[p]} opacity-10 rounded-full -translate-y-4 translate-x-4`} />
                <span className={`badge badge-${p.toLowerCase()} mb-2`}>{p}</span>
                <div className="text-xl font-bold text-slate-800">{pts}<span className="text-xs font-normal text-slate-400 ml-1">点</span></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stories List */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">迭代待办列表</h3>
        <div className="space-y-1.5">
          {stories.map((st, i) => (
            <div key={st.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group" style={{ animation: `slideInRight .25s ease ${i * 40}ms both` }}>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-300 font-mono w-14">{st.story_id}</span>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{st.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge badge-${st.priority.toLowerCase()}`}>{st.priority}</span>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold">{st.story_points}</span>
                <ChevronRight size={14} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
              </div>
            </div>
          ))}
          {stories.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">暂无分配的事件</div>}
        </div>
      </div>
    </div>
  );
}
