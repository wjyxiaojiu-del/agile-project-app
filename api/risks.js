import { ensureTables, query, run, json, error } from './_db.js';

export default async function handler(req, res) {
  try {
    await ensureTables();

    if (req.method === 'GET') {
      const { project_id, ids } = req.query;
      if (ids) {
        const idList = ids.split(',').map(Number);
        const placeholders = idList.map(() => '?').join(',');
        return json(res, await query(`SELECT * FROM risks WHERE id IN (${placeholders})`, idList));
      }
      let sql = 'SELECT * FROM risks';
      const params = [];
      if (project_id) { sql += ' WHERE project_id = ?'; params.push(+project_id); }
      sql += ' ORDER BY probability * impact DESC';
      return json(res, await query(sql, params));
    }

    if (req.method === 'POST') {
      const { project_id, title, description, probability, impact, level, strategy, status } = req.body;
      const lvl = level || (probability * impact >= 16 ? 'high' : probability * impact >= 9 ? 'medium' : 'low');
      const r = await run('INSERT INTO risks (project_id, title, description, probability, impact, level, strategy, status) VALUES (?,?,?,?,?,?,?,?)',
        [project_id, title, description, probability || 3, impact || 3, lvl, strategy, status || 'monitoring']);
      return json(res, { id: r.lastInsertRowid });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const fields = ['title', 'description', 'probability', 'impact', 'level', 'strategy', 'status'];
      const updates = []; const params = [];
      fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); } });
      params.push(+id);
      await run(`UPDATE risks SET ${updates.join(', ')} WHERE id = ?`, params);
      return json(res, { ok: true });
    }

    if (req.method === 'DELETE') {
      const { id, ids } = req.query;
      if (ids) {
        const idList = ids.split(',').map(Number);
        const placeholders = idList.map(() => '?').join(',');
        await run(`DELETE FROM risks WHERE id IN (${placeholders})`, idList);
        return json(res, { ok: true });
      }
      await run('DELETE FROM risks WHERE id = ?', [+id]);
      return json(res, { ok: true });
    }

    error(res, 'Method not allowed', 405);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
