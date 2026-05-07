import { ensureTables, query, run, json, error } from './_db.js';

export default async function handler(req, res) {
  try {
    await ensureTables();

    if (req.method === 'GET') {
      const { sprint_id, status, story_id } = req.query;
      let sql = `SELECT t.*, s.title as story_title, s.priority, s.story_points
                 FROM tasks t LEFT JOIN user_stories s ON t.story_id = s.id WHERE 1=1`;
      const params = [];
      if (sprint_id) { sql += ' AND t.sprint_id = ?'; params.push(+sprint_id); }
      if (status) { sql += ' AND t.status = ?'; params.push(status); }
      if (story_id) { sql += ' AND t.story_id = ?'; params.push(+story_id); }
      sql += ' ORDER BY t.sort_order';
      return json(res, await query(sql, params));
    }

    if (req.method === 'POST') {
      const { story_id, sprint_id, title, status, sort_order, due_date } = req.body;
      const r = await run('INSERT INTO tasks (story_id, sprint_id, title, status, sort_order, due_date) VALUES (?,?,?,?,?,?)',
        [story_id || null, sprint_id, title, status || 'todo', sort_order || 0, due_date]);
      return json(res, { id: r.lastInsertRowid });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      if (id === 'batch') {
        const { updates } = req.body;
        for (const u of updates) {
          await run('UPDATE tasks SET status = ?, sort_order = ? WHERE id = ?', [u.status, u.sort_order, u.id]);
        }
        return json(res, { ok: true });
      }
      const fields = ['title', 'status', 'sort_order', 'due_date', 'sprint_id', 'story_id'];
      const updates = []; const params = [];
      fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); } });
      if (!updates.length) return error(res, 'No fields', 400);
      params.push(+id);
      await run(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, params);
      return json(res, { ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await run('DELETE FROM tasks WHERE id = ?', [+id]);
      return json(res, { ok: true });
    }

    error(res, 'Method not allowed', 405);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
