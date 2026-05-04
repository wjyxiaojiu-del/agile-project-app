import { Router } from 'express';
import { queryAll, run } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { sprint_id } = req.query;
  let sql = 'SELECT * FROM standup_logs';
  const params = [];
  if (sprint_id) { sql += ' WHERE sprint_id = ?'; params.push(+sprint_id); }
  sql += ' ORDER BY date DESC';
  res.json(queryAll(sql, params));
});

router.post('/', (req, res) => {
  const { sprint_id, date, yesterday, today, blockers, notes } = req.body;
  const result = run('INSERT INTO standup_logs (sprint_id, date, yesterday, today, blockers, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [sprint_id, date, yesterday, today, blockers, notes]);
  res.json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const fields = ['yesterday', 'today', 'blockers', 'notes'];
  const updates = []; const params = [];
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); } });
  params.push(+req.params.id);
  run(`UPDATE standup_logs SET ${updates.join(', ')} WHERE id = ?`, params);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  run('DELETE FROM standup_logs WHERE id = ?', [+req.params.id]);
  res.json({ ok: true });
});

export default router;
