import { ensureTables, query, queryOne, json, error } from './_db.js';

export default async function handler(req, res) {
  try {
    await ensureTables();
    const { id, action } = req.query;

    if (req.method === 'GET') {
      if (id && action === 'stats') {
        const storyStats = await queryOne(`
          SELECT
            COUNT(*) as "totalStories",
            COUNT(CASE WHEN status = 'done' THEN 1 END) as "completedStories",
            COALESCE(SUM(story_points), 0) as "totalPoints",
            COALESCE(SUM(CASE WHEN status = 'done' THEN story_points ELSE 0 END), 0) as "completedPoints"
          FROM user_stories WHERE project_id = ?
        `, [+id]);

        const taskStats = await queryOne(`
          SELECT
            COUNT(*) as "totalTasks",
            COUNT(CASE WHEN t.status = 'done' THEN 1 END) as "doneTasks"
          FROM tasks t JOIN user_stories s ON t.story_id = s.id
          WHERE s.project_id = ?
        `, [+id]);

        const activeSprint = await queryOne("SELECT * FROM sprints WHERE project_id = ? AND status != 'completed' ORDER BY number LIMIT 1", [+id]);
        const milestones = await query('SELECT * FROM milestones WHERE project_id = ? ORDER BY due_date', [+id]);

        const ts = Number(taskStats.totalTasks) || 0;
        const dt = Number(taskStats.doneTasks) || 0;
        const totalS = Number(storyStats.totalStories) || 0;
        const doneS = Number(storyStats.completedStories) || 0;
        const totalP = Number(storyStats.totalPoints) || 0;
        const doneP = Number(storyStats.completedPoints) || 0;

        return json(res, {
          totalStories: totalS,
          completedStories: doneS,
          totalPoints: totalP,
          completedPoints: doneP,
          totalTasks: ts,
          doneTasks: dt,
          activeSprint, milestones,
          storyCompletionRate: totalS ? Math.round(doneS / totalS * 100) : 0,
          pointsCompletionRate: totalP ? Math.round(doneP / totalP * 100) : 0,
        });
      }
      if (id) {
        const project = await queryOne('SELECT * FROM projects WHERE id = ?', [+id]);
        return project ? json(res, project) : error(res);
      }
      return json(res, await query('SELECT * FROM projects'));
    }

    error(res, 'Method not allowed', 405);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
