import { ensureTables, query, queryOne, run, json, error } from './_db.js';

export default async function handler(req, res) {
  try {
    await ensureTables();

    if (req.method === 'GET') {
      const { id, action } = req.query;
      if (id && action === 'stats') {
        const totalPoints = (await queryOne('SELECT COALESCE(SUM(story_points),0)::int as total FROM user_stories WHERE sprint_id = $1', [id])).total;
        const donePoints = (await queryOne("SELECT COALESCE(SUM(story_points),0)::int as total FROM user_stories WHERE sprint_id = $1 AND status = 'done'", [id])).total;
        const tasksByStatus = await query("SELECT status, COUNT(*)::int as count FROM tasks WHERE sprint_id = $1 GROUP BY status", [id]);
        return json(res, { totalPoints, donePoints, remainingPoints: totalPoints - donePoints, tasksByStatus });
      }
      if (id) {
        const sprint = await queryOne('SELECT * FROM sprints WHERE id = $1', [id]);
        return sprint ? json(res, sprint) : error(res);
      }
      const { project_id } = req.query;
      let sql = 'SELECT * FROM sprints';
      const params = [];
      if (project_id) { sql += ' WHERE project_id = $1'; params.push(+project_id); }
      sql += ' ORDER BY number';
      return json(res, await query(sql, params));
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const fields = ['name', 'goal', 'status', 'start_date', 'end_date'];
      const updates = []; const params = []; let i = 1;
      fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = $${i++}`); params.push(req.body[f]); } });
      if (!updates.length) return error(res, 'No fields', 400);
      params.push(+id);
      await run(`UPDATE sprints SET ${updates.join(', ')} WHERE id = $${i}`, params);
      return json(res, { ok: true });
    }

    error(res, 'Method not allowed', 405);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
