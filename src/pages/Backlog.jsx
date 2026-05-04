import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Filter, Search, MoreHorizontal, ArrowUpDown } from 'lucide-react';
import api from '../api';
import Modal from '../components/Modal';

const PROJECT_ID = 1;

export default function Backlog() {
  const [stories, setStories] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [filter, setFilter] = useState({ priority: '', sprint_id: '' });
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  const load = () => {
    const params = { project_id: PROJECT_ID };
    if (filter.priority) params.priority = filter.priority;
    if (filter.sprint_id) params.sprint_id = filter.sprint_id;
    api.getStories(params).then(setStories);
  };

  useEffect(() => { load(); api.getSprints({ project_id: PROJECT_ID }).then(setSprints); }, [filter]);

  const handleSave = async (data) => {
    if (modal.mode === 'create') await api.createStory({ ...data, project_id: PROJECT_ID });
    else await api.updateStory(modal.story.id, data);
    setModal(null); load();
  };

  const handleDelete = async (id) => {
    if (confirm('确定删除此事件？')) { await api.deleteStory(id); load(); }
  };

  const filtered = stories.filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.story_id.toLowerCase().includes(search.toLowerCase()));
  const totalPoints = filtered.reduce((s, st) => s + st.story_points, 0);

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">事件待办</h1>
          <p className="text-sm text-slate-400 mt-1">管理所有用户故事与待办事项</p>
        </div>
        <button onClick={() => setModal({ mode: 'create' })} className="btn btn-primary">
          <Plus size={16} /> 新建事件
        </button>
      </div>

      {/* Toolbar */}
      <div className="card p-3 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9 py-2" placeholder="搜索事件..." />
        </div>
        <div className="w-px h-6 bg-slate-100" />
        <Filter size={14} className="text-slate-300" />
        <select value={filter.priority} onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))} className="select w-32 py-2 text-xs">
          <option value="">全部优先级</option>
          <option value="P0">P0 - 必须</option>
          <option value="P1">P1 - 应该</option>
          <option value="P2">P2 - 可以</option>
        </select>
        <select value={filter.sprint_id} onChange={e => setFilter(f => ({ ...f, sprint_id: e.target.value }))} className="select w-36 py-2 text-xs">
          <option value="">全部迭代</option>
          {sprints.map(s => <option key={s.id} value={s.id}>S{s.number}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-3 text-xs text-slate-400">
          <span>{filtered.length} 个事件</span>
          <span className="w-1 h-1 rounded-full bg-slate-200" />
          <span>{totalPoints} 故事点</span>
        </div>
      </div>

      {/* Stories List */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ID</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">标题</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">优先级</th>
              <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">故事点</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">迭代</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">状态</th>
              <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-20">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((st, i) => (
              <tr key={st.id} className="table-row" style={{ animation: `slideInRight .25s ease ${i * 30}ms both` }}>
                <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{st.story_id}</td>
                <td className="px-5 py-3.5">
                  <div className="font-medium text-slate-800">{st.title}</div>
                  {st.description && <div className="text-xs text-slate-400 mt-0.5 max-w-md truncate">{st.description}</div>}
                </td>
                <td className="px-5 py-3.5"><span className={`badge badge-${st.priority.toLowerCase()}`}>{st.priority}</span></td>
                <td className="px-5 py-3.5 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold ring-1 ring-indigo-100">{st.story_points}</span>
                </td>
                <td className="px-5 py-3.5 text-slate-400 text-xs">
                  {sprints.find(s => s.id === st.sprint_id) ? `S${sprints.find(s => s.id === st.sprint_id).number}` : '—'}
                </td>
                <td className="px-5 py-3.5"><StatusBadge status={st.status} /></td>
                <td className="px-5 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setModal({ mode: 'edit', story: st })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(st.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-sm">暂无匹配的事件</div>
          </div>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'create' ? '新建事件' : '编辑事件'}>
        {modal && <StoryForm story={modal.story} onSave={handleSave} onCancel={() => setModal(null)} sprints={sprints} />}
      </Modal>
    </div>
  );
}

function StoryForm({ story, onSave, onCancel, sprints }) {
  const [form, setForm] = useState({
    story_id: story?.story_id || '',
    title: story?.title || '',
    description: story?.description || '',
    priority: story?.priority || 'P1',
    story_points: story?.story_points || 3,
    sprint_id: story?.sprint_id || '',
    status: story?.status || 'backlog',
    acceptance_criteria: story?.acceptance_criteria || '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">事件编号</label>
          <input value={form.story_id} onChange={e => set('story_id', e.target.value)} className="input" placeholder="US-XXX" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">优先级</label>
          <select value={form.priority} onChange={e => set('priority', e.target.value)} className="select">
            <option value="P0">P0 - 必须完成</option>
            <option value="P1">P1 - 应该完成</option>
            <option value="P2">P2 - 可以完成</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">标题</label>
        <input value={form.title} onChange={e => set('title', e.target.value)} className="input" placeholder="简要描述事件内容" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">描述</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input" rows={2} placeholder="详细说明..." />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">验收标准</label>
        <textarea value={form.acceptance_criteria} onChange={e => set('acceptance_criteria', e.target.value)} className="input" rows={2} placeholder="如何判断此事件已完成？" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">故事点</label>
          <select value={form.story_points} onChange={e => set('story_points', +e.target.value)} className="select">
            {[1, 2, 3, 5, 8, 13].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">所属迭代</label>
          <select value={form.sprint_id} onChange={e => set('sprint_id', +e.target.value)} className="select">
            <option value="">未分配</option>
            {sprints.map(s => <option key={s.id} value={s.id}>S{s.number}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">状态</label>
          <select value={form.status} onChange={e => set('status', e.target.value)} className="select">
            <option value="backlog">待办</option>
            <option value="todo">计划中</option>
            <option value="in_progress">进行中</option>
            <option value="done">已完成</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button onClick={onCancel} className="btn btn-secondary">取消</button>
        <button onClick={() => onSave(form)} className="btn btn-primary">保存</button>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    backlog: ['待办', 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'],
    todo: ['计划中', 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'],
    in_progress: ['进行中', 'bg-amber-50 text-amber-600 ring-1 ring-amber-100'],
    done: ['已完成', 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'],
  };
  const [label, cls] = map[status] || ['未知', 'bg-slate-100'];
  return <span className={`badge ${cls}`}>{label}</span>;
}
