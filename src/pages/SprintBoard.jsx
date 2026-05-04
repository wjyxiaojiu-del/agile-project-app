import { useState, useEffect, useCallback } from 'react';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Calendar, Tag, Plus, MoreHorizontal } from 'lucide-react';
import api from '../api';

const PROJECT_ID = 1;
const COLUMNS = [
  { id: 'todo', label: '待办', wip: null, color: 'slate', emoji: '📋' },
  { id: 'this_sprint', label: '本周计划', wip: null, color: 'blue', emoji: '📅' },
  { id: 'in_progress', label: '进行中', wip: 3, color: 'amber', emoji: '⚡' },
  { id: 'verify', label: '待验收', wip: 2, color: 'purple', emoji: '👀' },
  { id: 'done', label: '已完成', wip: null, color: 'emerald', emoji: '✅' },
];

const colColors = {
  slate: { border: 'border-slate-200', dot: 'bg-slate-400', bg: 'bg-slate-50/50', overBg: 'bg-slate-100/50', overBorder: 'border-slate-400' },
  blue: { border: 'border-blue-200', dot: 'bg-blue-500', bg: 'bg-blue-50/30', overBg: 'bg-blue-100/40', overBorder: 'border-blue-400' },
  amber: { border: 'border-amber-200', dot: 'bg-amber-500', bg: 'bg-amber-50/30', overBg: 'bg-amber-100/40', overBorder: 'border-amber-400' },
  purple: { border: 'border-purple-200', dot: 'bg-purple-500', bg: 'bg-purple-50/30', overBg: 'bg-purple-100/40', overBorder: 'border-purple-400' },
  emerald: { border: 'border-emerald-200', dot: 'bg-emerald-500', bg: 'bg-emerald-50/30', overBg: 'bg-emerald-100/40', overBorder: 'border-emerald-400' },
};

export default function SprintBoard() {
  const [sprints, setSprints] = useState([]);
  const [currentSprint, setCurrentSprint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    api.getSprints({ project_id: PROJECT_ID }).then(s => {
      setSprints(s);
      if (s.length) setCurrentSprint(s[0]);
    });
  }, []);

  useEffect(() => {
    if (currentSprint) api.getTasks({ sprint_id: currentSprint.id }).then(setTasks);
  }, [currentSprint]);

  const getTasksByColumn = useCallback((colId) => {
    return tasks.filter(t => t.status === colId).sort((a, b) => a.sort_order - b.sort_order);
  }, [tasks]);

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = async (event) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(t => String(t.id) === String(active.id));
    if (!activeTask) return;

    let newStatus = activeTask.status;
    const overTask = tasks.find(t => String(t.id) === String(over.id));
    if (overTask) newStatus = overTask.status;
    else { const col = COLUMNS.find(c => c.id === String(over.id)); if (col) newStatus = col.id; }

    if (newStatus !== activeTask.status) {
      const wipCol = COLUMNS.find(c => c.id === newStatus);
      if (wipCol?.wip) {
        const count = tasks.filter(t => t.status === newStatus).length;
        if (count >= wipCol.wip) { alert(`「${wipCol.label}」最多容纳 ${wipCol.wip} 个任务`); return; }
      }
      await api.updateTask(activeTask.id, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === activeTask.id ? { ...t, status: newStatus } : t));
    }
  };

  const activeTask = tasks.find(t => String(t.id) === String(activeId));

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">任务看板</h1>
          <p className="text-sm text-slate-400 mt-1">拖拽任务卡片以更新状态</p>
        </div>
        <select value={currentSprint?.id || ''} onChange={e => setCurrentSprint(sprints.find(s => s.id === +e.target.value))} className="select w-52">
          {sprints.map(s => <option key={s.id} value={s.id}>S{s.number}：{s.name.replace(/Sprint \d+：/, '')}</option>)}
        </select>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-5 gap-3 min-h-[65vh]">
          {COLUMNS.map(col => (
            <KanbanColumn key={col.id} column={col} tasks={getTasksByColumn(col.id)} />
          ))}
        </div>
        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease-out' }}>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function KanbanColumn({ column, tasks }) {
  const { setNodeRef, isOver } = useSortable({ id: column.id, data: { type: 'column' } });
  const c = colColors[column.color];

  return (
    <div ref={setNodeRef} className={`kanban-col ${c.border} ${isOver ? `${c.overBg} ${c.overBorder} border-solid` : `${c.bg} border-dashed`}`}>
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{column.emoji}</span>
          <span className="text-xs font-semibold text-slate-600">{column.label}</span>
          <span className="text-[10px] font-medium text-slate-400 bg-white px-1.5 py-0.5 rounded-md ring-1 ring-slate-100">{tasks.length}</span>
        </div>
        {column.wip && <span className="text-[10px] font-medium text-slate-300 bg-white px-1.5 py-0.5 rounded-md ring-1 ring-slate-100">WIP {column.wip}</span>}
      </div>
      <div className="flex-1 px-2.5 pb-2.5 space-y-2 overflow-y-auto scrollbar-hide">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task, i) => <SortableTaskCard key={task.id} task={task} index={i} />)}
        </SortableContext>
      </div>
    </div>
  );
}

function SortableTaskCard({ task, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { type: 'task' } });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 };

  return (
    <div ref={setNodeRef} style={{ ...style, animation: `slideUp .2s ease ${index * 40}ms both` }} {...attributes}>
      <TaskCard task={task} dragListeners={listeners} />
    </div>
  );
}

function TaskCard({ task, isDragging, dragListeners }) {
  const priorityBorders = { P0: 'border-l-red-400', P1: 'border-l-amber-400', P2: 'border-l-emerald-400' };
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  return (
    <div className={`task-card border-l-[3px] ${priorityBorders[task.priority] || 'border-l-slate-200'} ${isDragging ? 'dragging' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-slate-800 leading-snug">{task.title}</p>
        <div {...dragListeners} className="text-slate-200 hover:text-slate-400 cursor-grab flex-shrink-0 transition-colors"><GripVertical size={13} /></div>
      </div>
      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-1.5">
          <span className={`badge text-[10px] py-0 ${task.priority === 'P0' ? 'badge-p0' : task.priority === 'P1' ? 'badge-p1' : 'badge-p2'}`}>{task.priority}</span>
          {task.story_title && <span className="text-[10px] text-slate-300 max-w-[80px] truncate">{task.story_title}</span>}
        </div>
        {task.due_date && (
          <span className={`flex items-center gap-1 text-[10px] font-medium ${isOverdue ? 'text-red-500' : 'text-slate-300'}`}>
            <Calendar size={10} />{task.due_date.slice(5)}
          </span>
        )}
      </div>
    </div>
  );
}
