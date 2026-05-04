import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield, AlertTriangle } from 'lucide-react';
import api from '../api';
import Modal from '../components/Modal';

const PROJECT_ID = 1;

export default function Risks() {
  const [risks, setRisks] = useState([]);
  const [modal, setModal] = useState(null);

  const load = () => api.getRisks({ project_id: PROJECT_ID }).then(setRisks);
  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    if (modal.mode === 'create') await api.createRisk({ ...data, project_id: PROJECT_ID });
    else await api.updateRisk(modal.risk.id, data);
    setModal(null); load();
  };

  const handleDelete = async (id) => {
    if (confirm('确定删除此风险？')) { await api.deleteRisk(id); load(); }
  };

  const handleStatusChange = async (id, status) => { await api.updateRisk(id, { status }); load(); };

  const matrix = Array.from({ length: 5 }, (_, prob) =>
    Array.from({ length: 5 }, (_, imp) => {
      const score = (5 - prob) * (imp + 1);
      const level = score >= 16 ? 'high' : score >= 9 ? 'medium' : 'low';
      const matched = risks.filter(r => r.probability === 5 - prob && r.impact === imp + 1);
      return { prob: 5 - prob, imp: imp + 1, score, level, risks: matched };
    })
  );

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">风险管控</h1>
          <p className="text-sm text-slate-400 mt-1">识别、评估与跟踪项目风险</p>
        </div>
        <button onClick={() => setModal({ mode: 'create' })} className="btn btn-primary">
          <Plus size={16} /> 新建风险
        </button>
      </div>

      {/* Risk Matrix */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2"><Shield size={15} className="text-indigo-500" /> 风险评估矩阵</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead>
              <tr>
                <th className="py-2 px-3" colSpan={1}></th>
                <th className="py-2 px-3 text-slate-400 font-medium" colSpan={5}>影响程度 →</th>
              </tr>
              <tr>
                <th className="py-1 px-3 text-slate-400 font-medium">概率 ↓</th>
                {[1, 2, 3, 4, 5].map(i => <th key={i} className="py-1 px-3 text-slate-400 font-medium">{i}</th>)}
              </tr>
            </thead>
            <tbody>
              {matrix.reverse().map((row, ri) => (
                <tr key={ri}>
                  <td className="py-1.5 px-3 font-medium text-slate-500">{row[0].prob}</td>
                  {row.map(cell => {
                    const bg = cell.level === 'high' ? 'bg-red-50' : cell.level === 'medium' ? 'bg-amber-50' : 'bg-emerald-50';
                    const text = cell.level === 'high' ? 'text-red-600' : cell.level === 'medium' ? 'text-amber-600' : 'text-emerald-600';
                    return (
                      <td key={cell.imp} className={`py-3 px-2 ${bg} rounded-lg`}>
                        <div className={`font-bold ${text}`}>{cell.score}</div>
                        {cell.risks.length > 0 && <div className="text-slate-400 mt-0.5">{cell.risks.length}个</div>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-end gap-5 mt-3 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-50 ring-1 ring-red-100" /> 高风险 ≥16</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-50 ring-1 ring-amber-100" /> 中风险 9-15</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-50 ring-1 ring-emerald-100" /> 低风险 {'<'}9</span>
          </div>
        </div>
      </div>

      {/* Risk List */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">风险</th>
              <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">概率</th>
              <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">影响</th>
              <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">等级</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">应对策略</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">状态</th>
              <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-20">操作</th>
            </tr>
          </thead>
          <tbody>
            {risks.map((r, i) => (
              <tr key={r.id} className="table-row" style={{ animation: `slideInRight .25s ease ${i * 40}ms both` }}>
                <td className="px-5 py-3.5">
                  <div className="font-medium text-slate-800">{r.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{r.description}</div>
                </td>
                <td className="px-5 py-3.5 text-center text-slate-600 font-medium">{r.probability}</td>
                <td className="px-5 py-3.5 text-center text-slate-600 font-medium">{r.impact}</td>
                <td className="px-5 py-3.5 text-center">
                  <span className={`badge ${r.level === 'high' ? 'badge-p0' : r.level === 'medium' ? 'badge-p1' : 'badge-p2'}`}>
                    {r.level === 'high' ? '高' : r.level === 'medium' ? '中' : '低'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-500 max-w-xs truncate">{r.strategy}</td>
                <td className="px-5 py-3.5">
                  <select value={r.status} onChange={e => handleStatusChange(r.id, e.target.value)} className="select w-24 text-xs py-1.5">
                    <option value="monitoring">监控中</option>
                    <option value="mitigated">已缓解</option>
                    <option value="closed">已关闭</option>
                  </select>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <button onClick={() => setModal({ mode: 'edit', risk: r })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'create' ? '新建风险' : '编辑风险'}>
        {modal && <RiskForm risk={modal.risk} onSave={handleSave} onCancel={() => setModal(null)} />}
      </Modal>
    </div>
  );
}

function RiskForm({ risk, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: risk?.title || '',
    description: risk?.description || '',
    probability: risk?.probability || 3,
    impact: risk?.impact || 3,
    strategy: risk?.strategy || '',
    status: risk?.status || 'monitoring',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const autoLevel = (p, i) => p * i >= 16 ? 'high' : p * i >= 9 ? 'medium' : 'low';

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">风险标题</label>
        <input value={form.title} onChange={e => set('title', e.target.value)} className="input" placeholder="简要描述风险" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">详细描述</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input" rows={2} placeholder="风险的具体情况..." />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">发生概率</label>
          <select value={form.probability} onChange={e => set('probability', +e.target.value)} className="select">
            {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v} - {['极低', '低', '中', '高', '极高'][v - 1]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">影响程度</label>
          <select value={form.impact} onChange={e => set('impact', +e.target.value)} className="select">
            {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v} - {['极低', '低', '中', '高', '极高'][v - 1]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">自动评估</label>
          <div className={`badge mt-2 ${autoLevel(form.probability, form.impact) === 'high' ? 'badge-p0' : autoLevel(form.probability, form.impact) === 'medium' ? 'badge-p1' : 'badge-p2'}`}>
            {form.probability * form.impact}分 · {autoLevel(form.probability, form.impact) === 'high' ? '高风险' : autoLevel(form.probability, form.impact) === 'medium' ? '中风险' : '低风险'}
          </div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">应对策略</label>
        <textarea value={form.strategy} onChange={e => set('strategy', e.target.value)} className="input" rows={3} placeholder="如何应对此风险？" />
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button onClick={onCancel} className="btn btn-secondary">取消</button>
        <button onClick={() => onSave({ ...form, level: autoLevel(form.probability, form.impact) })} className="btn btn-primary">保存</button>
      </div>
    </div>
  );
}
