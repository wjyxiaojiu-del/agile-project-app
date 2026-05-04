import { ensureTables, query, run, json, error } from './_db.js';

export default async function handler(req, res) {
  try {
    await ensureTables();

    if (req.method === 'GET') {
      const { sprint_id } = req.query;
      let sql = 'SELECT * FROM standup_logs';
      const params = [];
      if (sprint_id) { sql += ' WHERE sprint_id = $1'; params.push(+sprint_id); }
      sql += ' ORDER BY date DESC';
      return json(res, await query(sql, params));
    }

    if (req.method === 'POST') {
      const { sprint_id, date, yesterday, today, blockers, notes } = req.body;
      const r = await run('INSERT INTO standup_logs (sprint_id, date, yesterday, today, blockers, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
        [sprint_id, date, yesterday, today, blockers, notes]);
      return json(res, { id: r.rows[0].id });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const fields = ['yesterday', 'today', 'blockers', 'notes'];
      const updates = []; const params = []; let i = 1;
      fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = $${i++}`); params.push(req.body[f]); } });
      params.push(+id);
      await run(`UPDATE standup_logs SET ${updates.join(', ')} WHERE id = $${i}`, params);
      return json(res, { ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await run('DELETE FROM standup_logs WHERE id = $1', [+id]);
      return json(res, { ok: true });
    }

    error(res, 'Method not allowed', 405);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
