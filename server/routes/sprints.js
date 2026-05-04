import { Router } from 'express';
import { queryAll, queryOne, run } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { project_id } = req.query;
  let sql = 'SELECT * FROM sprints';
  const params = [];
  if (project_id) { sql += ' WHERE project_id = ?'; params.push(+project_id); }
  sql += ' ORDER BY number';
  res.json(queryAll(sql, params));
});

router.get('/:id', (req, res) => {
  const sprint = queryOne('SELECT * FROM sprints WHERE id = ?', [+req.params.id]);
  if (!sprint) return res.status(404).json({ error: 'Not found' });
  res.json(sprint);
});

router.get('/:id/stats', (req, res) => {
  const id = +req.params.id;
  const totalPoints = queryOne('SELECT COALESCE(SUM(story_points),0) as total FROM user_stories WHERE sprint_id = ?', [id]).total;
  const donePoints = queryOne("SELECT COALESCE(SUM(story_points),0) as total FROM user_stories WHERE sprint_id = ? AND status = 'done'", [id]).total;
  const tasksByStatus = queryAll("SELECT status, COUNT(*) as count FROM tasks WHERE sprint_id = ? GROUP BY status", [id]);
  res.json({ totalPoints, donePoints, remainingPoints: totalPoints - donePoints, tasksByStatus });
});

router.put('/:id', (req, res) => {
  const fields = ['name', 'goal', 'status', 'start_date', 'end_date'];
  const updates = []; const params = [];
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); } });
  if (!updates.length) return res.status(400).json({ error: 'No fields' });
  params.push(+req.params.id);
  run(`UPDATE sprints SET ${updates.join(', ')} WHERE id = ?`, params);
  res.json({ ok: true });
});

export default router;
