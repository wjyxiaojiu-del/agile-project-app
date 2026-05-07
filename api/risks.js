import { ensureTables, query, run, json, error } from './_db.js';

export default async function handler(req, res) {
  try {
    await ensureTables();

    if (req.method === 'GET') {
      const { project_id } = req.query;
      let sql = 'SELECT * FROM risks';
      const params = [];
      if (project_id) { sql += ' WHERE project_id = $1'; params.push(+project_id); }
      sql += ' ORDER BY probability * impact DESC';
      return json(res, await query(sql, params));
    }

    if (req.method === 'POST') {
      const { project_id, title, description, probability, impact, level, strategy, status } = req.body;
      const lvl = level || (probability * impact >= 16 ? 'high' : probability * impact >= 9 ? 'medium' : 'low');
      const r = await run('INSERT INTO risks (project_id, title, description, probability, impact, level, strategy, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',
        [project_id, title, description, probability || 3, impact || 3, lvl, strategy, status || 'monitoring']);
      return json(res, { id: r.rows[0].id });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const fields = ['title', 'description', 'probability', 'impact', 'level', 'strategy', 'status'];
      const updates = []; const params = []; let i = 1;
      fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = $${i++}`); params.push(req.body[f]); } });
      params.push(+id);
      await run(`UPDATE risks SET ${updates.join(', ')} WHERE id = $${i}`, params);
      return json(res, { ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await run('DELETE FROM risks WHERE id = $1', [+id]);
      return json(res, { ok: true });
    }

    error(res, 'Method not allowed', 405);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
