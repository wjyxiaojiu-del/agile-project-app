import { Router } from 'express';
import { queryAll, run } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { project_id } = req.query;
  let sql = 'SELECT * FROM risks';
  const params = [];
  if (project_id) { sql += ' WHERE project_id = ?'; params.push(+project_id); }
  sql += ' ORDER BY probability * impact DESC';
  res.json(queryAll(sql, params));
});

router.post('/', (req, res) => {
  const { project_id, title, description, probability, impact, level, strategy, status } = req.body;
  const lvl = level || (probability * impact >= 16 ? 'high' : probability * impact >= 9 ? 'medium' : 'low');
  const result = run('INSERT INTO risks (project_id, title, description, probability, impact, level, strategy, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [project_id, title, description, probability || 3, impact || 3, lvl, strategy, status || 'monitoring']);
  res.json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const fields = ['title', 'description', 'probability', 'impact', 'level', 'strategy', 'status'];
  const updates = []; const params = [];
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); } });
  params.push(+req.params.id);
  run(`UPDATE risks SET ${updates.join(', ')} WHERE id = ?`, params);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  run('DELETE FROM risks WHERE id = ?', [+req.params.id]);
  res.json({ ok: true });
});

export default router;
