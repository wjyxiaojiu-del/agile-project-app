import { Router } from 'express';
import { queryAll, run, getDB } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { sprint_id, status, story_id } = req.query;
  let sql = `SELECT t.*, s.title as story_title, s.priority, s.story_points
             FROM tasks t LEFT JOIN user_stories s ON t.story_id = s.id WHERE 1=1`;
  const params = [];
  if (sprint_id) { sql += ' AND t.sprint_id = ?'; params.push(+sprint_id); }
  if (status) { sql += ' AND t.status = ?'; params.push(status); }
  if (story_id) { sql += ' AND t.story_id = ?'; params.push(+story_id); }
  sql += ' ORDER BY t.sort_order';
  res.json(queryAll(sql, params));
});

router.post('/', (req, res) => {
  const { story_id, sprint_id, title, status, sort_order, due_date } = req.body;
  const result = run('INSERT INTO tasks (story_id, sprint_id, title, status, sort_order, due_date) VALUES (?, ?, ?, ?, ?, ?)',
    [story_id, sprint_id, title, status || 'todo', sort_order || 0, due_date]);
  res.json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const fields = ['title', 'status', 'sort_order', 'due_date', 'sprint_id', 'story_id'];
  const updates = []; const params = [];
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); } });
  if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
  params.push(+req.params.id);
  run(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, params);
  res.json({ ok: true });
});

router.put('/batch/status', (req, res) => {
  const { updates } = req.body;
  const db = getDB();
  updates.forEach(u => {
    db.run('UPDATE tasks SET status = ?, sort_order = ? WHERE id = ?', [u.status, u.sort_order, u.id]);
  });
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  run('DELETE FROM tasks WHERE id = ?', [+req.params.id]);
  res.json({ ok: true });
});

export default router;
