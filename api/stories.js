import { ensureTables, query, queryOne, run, json, error } from './_db.js';

export default async function handler(req, res) {
  try {
    await ensureTables();

    if (req.method === 'GET') {
      const { project_id, sprint_id, priority, status } = req.query;
      let sql = 'SELECT * FROM user_stories WHERE 1=1';
      const params = []; let i = 1;
      if (project_id) { sql += ` AND project_id = $${i++}`; params.push(+project_id); }
      if (sprint_id) { sql += ` AND sprint_id = $${i++}`; params.push(+sprint_id); }
      if (priority) { sql += ` AND priority = $${i++}`; params.push(priority); }
      if (status) { sql += ` AND status = $${i++}`; params.push(status); }
      sql += ' ORDER BY priority, story_points DESC';
      return json(res, await query(sql, params));
    }

    if (req.method === 'POST') {
      const { story_id, project_id, title, description, priority, story_points, sprint_id, status, acceptance_criteria } = req.body;
      const r = await run('INSERT INTO user_stories (story_id, project_id, title, description, priority, story_points, sprint_id, status, acceptance_criteria) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id',
        [story_id, project_id, title, description, priority || 'P1', story_points || 3, sprint_id, status || 'backlog', acceptance_criteria]);
      return json(res, { id: r.rows[0].id });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const fields = ['title', 'description', 'priority', 'story_points', 'sprint_id', 'status', 'acceptance_criteria'];
      const updates = []; const params = []; let i = 1;
      fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = $${i++}`); params.push(req.body[f]); } });
      if (!updates.length) return error(res, 'No fields', 400);
      params.push(+id);
      await run(`UPDATE user_stories SET ${updates.join(', ')} WHERE id = $${i}`, params);
      return json(res, { ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await run('DELETE FROM user_stories WHERE id = $1', [+id]);
      return json(res, { ok: true });
    }

    error(res, 'Method not allowed', 405);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
