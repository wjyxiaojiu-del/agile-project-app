import { useState, useEffect } from 'react';
import { Plus, Calendar, AlertCircle, Trash2, Edit2, Sun, Coffee, CloudRain } from 'lucide-react';
import api from '../api';
import Modal from '../components/Modal';

const PROJECT_ID = 1;

export default function Standup() {
  const [sprints, setSprints] = useState([]);
  const [currentSprint, setCurrentSprint] = useState(null);
  const [logs, setLogs] = useState([]);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    api.getSprints({ project_id: PROJECT_ID }).then(s => {
      setSprints(s);
      if (s.length) setCurrentSprint(s[0]);
    });
  }, []);

  useEffect(() => {
    if (currentSprint) api.getStandups({ sprint_id: currentSprint.id }).then(setLogs);
  }, [currentSprint]);

  const handleSave = async (data) => {
    if (modal.mode === 'create') await api.createStandup({ ...data, sprint_id: currentSprint.id });
    else await api.updateStandup(modal.log.id, data);
    setModal(null);
    api.getStandups({ sprint_id: currentSprint.id }).then(setLogs);
  };

  const handleDelete = async (id) => {
    if (confirm('确定删除此日程记录？')) {
      await api.deleteStandup(id);
      api.getStandups({ sprint_id: currentSprint.id }).then(setLogs);
    }
  };

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">每日日程</h1>
          <p className="text-sm text-slate-400 mt-1">记录每日工作计划与进展</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={currentSprint?.id || ''} onChange={e => setCurrentSprint(sprints.find(s => s.id === +e.target.value))} className="select w-52">
            {sprints.map(s => <option key={s.id} value={s.id}>S{s.number}：{s.name.replace(/Sprint \d+：/, '')}</option>)}
          </select>
          <button onClick={() => setModal({ mode: 'create' })} className="btn btn-primary">
            <Plus size={16} /> 新建日程
          </button>
        </div>
      </div>

      {/* Template Card */}
      <div className="card-glass p-5">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-start gap-3 bg-white/80 rounded-xl p-4 ring-1 ring-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0"><Sun size={18} className="text-amber-500" /></div>
            <div>
              <div className="text-sm font-semibold text-slate-700">昨日回顾</div>
              <div className="text-xs text-slate-400 mt-0.5">昨天完成了哪些工作？</div>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white/80 rounded-xl p-4 ring-1 ring-slate-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0"><Coffee size={18} className="text-indigo-500" /></div>
            <div>
              <div className="text-sm font-semibold text-slate-700">今日计划</div>
              <div className="text-xs text-slate-400 mt-0.5">今天计划做什么？</div>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white/80 rounded-xl p-4 ring-1 ring-slate-100">
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0"><CloudRain size={18} className="text-rose-500" /></div>
            <div>
              <div className="text-sm font-semibold text-slate-700">障碍风险</div>
              <div className="text-xs text-slate-400 mt-0.5">有什么阻碍了进展？</div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="space-y-3">
        {logs.map((log, i) => (
          <div key={log.id} className="card p-5" style={{ animation: `slideUp .25s ease ${i * 50}ms both` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><Calendar size={15} className="text-indigo-500" /></div>
                <span className="text-sm font-semibold text-slate-800">{log.date}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <button onClick={() => setModal({ mode: 'edit', log })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(log.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-amber-50/50 rounded-xl p-3.5">
                <div className="text-[11px] font-semibold text-amber-600 mb-2 flex items-center gap-1"><Sun size={12} /> 昨日完成</div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{log.yesterday || '—'}</p>
              </div>
              <div className="bg-indigo-50/50 rounded-xl p-3.5">
                <div className="text-[11px] font-semibold text-indigo-600 mb-2 flex items-center gap-1"><Coffee size={12} /> 今日计划</div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{log.today || '—'}</p>
              </div>
              <div className="bg-rose-50/50 rounded-xl p-3.5">
                <div className="text-[11px] font-semibold text-rose-600 mb-2 flex items-center gap-1"><CloudRain size={12} /> 障碍风险</div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{log.blockers || '无阻塞项'}</p>
              </div>
            </div>
            {log.notes && <div className="mt-3 pt-3 border-t border-slate-100"><p className="text-xs text-slate-400">{log.notes}</p></div>}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="card text-center py-16">
            <div className="text-4xl mb-3">📝</div>
            <div className="text-sm text-slate-400">暂无日程记录</div>
            <div className="text-xs text-slate-300 mt-1">点击「新建日程」开始记录</div>
          </div>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'create' ? '新建日程' : '编辑日程'}>
        {modal && <StandupForm log={modal.log} onSave={handleSave} onCancel={() => setModal(null)} />}
      </Modal>
    </div>
  );
}

function StandupForm({ log, onSave, onCancel }) {
  const [form, setForm] = useState({
    date: log?.date || new Date().toISOString().slice(0, 10),
    yesterday: log?.yesterday || '',
    today: log?.today || '',
    blockers: log?.blockers || '',
    notes: log?.notes || '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">日期</label>
        <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="input" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">昨日完成</label>
        <textarea value={form.yesterday} onChange={e => set('yesterday', e.target.value)} className="input" rows={3} placeholder="昨天完成了哪些工作？" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">今日计划</label>
        <textarea value={form.today} onChange={e => set('today', e.target.value)} className="input" rows={3} placeholder="今天计划做什么？" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">障碍风险</label>
        <textarea value={form.blockers} onChange={e => set('blockers', e.target.value)} className="input" rows={2} placeholder="有什么阻碍了进展？" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">备注</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} className="input" rows={2} placeholder="其他补充..." />
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button onClick={onCancel} className="btn btn-secondary">取消</button>
        <button onClick={() => onSave(form)} className="btn btn-primary">保存</button>
      </div>
    </div>
  );
}
