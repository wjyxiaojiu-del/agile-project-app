import { Router } from 'express';
import { queryAll, queryOne, run } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { project_id, sprint_id, priority, status } = req.query;
  let sql = 'SELECT * FROM user_stories WHERE 1=1';
  const params = [];
  if (project_id) { sql += ' AND project_id = ?'; params.push(+project_id); }
  if (sprint_id) { sql += ' AND sprint_id = ?'; params.push(+sprint_id); }
  if (priority) { sql += ' AND priority = ?'; params.push(priority); }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  sql += ' ORDER BY priority, story_points DESC';
  res.json(queryAll(sql, params));
});

router.get('/:id', (req, res) => {
  const story = queryOne('SELECT * FROM user_stories WHERE id = ?', [+req.params.id]);
  if (!story) return res.status(404).json({ error: 'Not found' });
  res.json(story);
});

router.post('/', (req, res) => {
  const { story_id, project_id, title, description, priority, story_points, sprint_id, status, acceptance_criteria } = req.body;
  const result = run('INSERT INTO user_stories (story_id, project_id, title, description, priority, story_points, sprint_id, status, acceptance_criteria) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [story_id, project_id, title, description, priority || 'P1', story_points || 3, sprint_id, status || 'backlog', acceptance_criteria]);
  res.json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const fields = ['title', 'description', 'priority', 'story_points', 'sprint_id', 'status', 'acceptance_criteria'];
  const updates = []; const params = [];
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); } });
  if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
  params.push(+req.params.id);
  run(`UPDATE user_stories SET ${updates.join(', ')} WHERE id = ?`, params);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  run('DELETE FROM user_stories WHERE id = ?', [+req.params.id]);
  res.json({ ok: true });
});

export default router;
