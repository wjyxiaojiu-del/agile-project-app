import { ensureTables, query, run, json, error } from './_db.js';

export default async function handler(req, res) {
  try {
    await ensureTables();

    if (req.method === 'GET') {
      const { project_id } = req.query;
      let sql = 'SELECT * FROM milestones';
      const params = [];
      if (project_id) { sql += ' WHERE project_id = ?'; params.push(+project_id); }
      sql += ' ORDER BY due_date';
      return json(res, await query(sql, params));
    }

    if (req.method === 'POST') {
      const { project_id, name, due_date, criteria, status } = req.body;
      const r = await run('INSERT INTO milestones (project_id, name, due_date, criteria, status) VALUES (?,?,?,?,?)',
        [+project_id, name, due_date || '', criteria || '', status || 'pending']);
      return json(res, { id: r.lastInsertRowid });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const fields = ['name', 'due_date', 'status', 'criteria'];
      const updates = []; const params = [];
      fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); } });
      params.push(+id);
      await run(`UPDATE milestones SET ${updates.join(', ')} WHERE id = ?`, params);
      return json(res, { ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await run('DELETE FROM milestones WHERE id = ?', [+id]);
      return json(res, { ok: true });
    }

    error(res, 'Method not allowed', 405);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
