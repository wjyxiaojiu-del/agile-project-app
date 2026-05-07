import { ensureTables, query, queryOne, run, json, error } from './_db.js';

export default async function handler(req, res) {
  try {
    await ensureTables();

    if (req.method === 'GET') {
      const { id, action, project_id } = req.query;
      if (id && action === 'stats') {
        const totalPoints = Number((await queryOne('SELECT COALESCE(SUM(story_points),0) as total FROM user_stories WHERE sprint_id = ?', [+id])).total);
        const donePoints = Number((await queryOne("SELECT COALESCE(SUM(story_points),0) as total FROM user_stories WHERE sprint_id = ? AND status = 'done'", [+id])).total);
        const tasksByStatus = await query('SELECT status, COUNT(*) as count FROM tasks WHERE sprint_id = ? GROUP BY status', [+id]);
        return json(res, { totalPoints, donePoints, remainingPoints: totalPoints - donePoints, tasksByStatus });
      }
      if (id) {
        const sprint = await queryOne('SELECT * FROM sprints WHERE id = ?', [+id]);
        return sprint ? json(res, sprint) : error(res);
      }
      let sql = 'SELECT * FROM sprints';
      const params = [];
      if (project_id) { sql += ' WHERE project_id = ?'; params.push(+project_id); }
      sql += ' ORDER BY number';
      return json(res, await query(sql, params));
    }

    if (req.method === 'POST') {
      const { project_id, name, start_date, end_date, goal, status } = req.body;
      const maxNum = await queryOne('SELECT COALESCE(MAX(number),0) as m FROM sprints WHERE project_id = ?', [+project_id]);
      const r = await run('INSERT INTO sprints (project_id, number, name, start_date, end_date, goal, status) VALUES (?,?,?,?,?,?,?)',
        [+project_id, Number(maxNum.m) + 1, name, start_date || '', end_date || '', goal || '', status || 'planned']);
      return json(res, { id: r.lastInsertRowid });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const fields = ['name', 'goal', 'status', 'start_date', 'end_date'];
      const updates = []; const params = [];
      fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); } });
      if (!updates.length) return error(res, 'No fields', 400);
      params.push(+id);
      await run(`UPDATE sprints SET ${updates.join(', ')} WHERE id = ?`, params);
      return json(res, { ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await run('DELETE FROM tasks WHERE sprint_id = ?', [+id]);
      await run('DELETE FROM standup_logs WHERE sprint_id = ?', [+id]);
      await run('UPDATE user_stories SET sprint_id = NULL WHERE sprint_id = ?', [+id]);
      await run('DELETE FROM sprints WHERE id = ?', [+id]);
      return json(res, { ok: true });
    }

    error(res, 'Method not allowed', 405);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
