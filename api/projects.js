import { ensureTables, query, queryOne, json, error } from './_db.js';

export default async function handler(req, res) {
  try {
    await ensureTables();
    const { id, action } = req.query;

    if (req.method === 'GET') {
      if (id && action === 'stats') {
        // Merged: get all story stats in one query
        const storyStats = await queryOne(`
          SELECT
            COUNT(*)::int as "totalStories",
            COUNT(CASE WHEN status = 'done' THEN 1 END)::int as "completedStories",
            COALESCE(SUM(story_points), 0)::int as "totalPoints",
            COALESCE(SUM(CASE WHEN status = 'done' THEN story_points ELSE 0 END), 0)::int as "completedPoints"
          FROM user_stories WHERE project_id = $1
        `, [id]);

        // Merged: get all task stats in one query
        const taskStats = await queryOne(`
          SELECT
            COUNT(*)::int as "totalTasks",
            COUNT(CASE WHEN t.status = 'done' THEN 1 END)::int as "doneTasks"
          FROM tasks t JOIN user_stories s ON t.story_id = s.id
          WHERE s.project_id = $1
        `, [id]);

        const activeSprint = await queryOne("SELECT * FROM sprints WHERE project_id = $1 AND status != 'completed' ORDER BY number LIMIT 1", [id]);
        const milestones = await query('SELECT * FROM milestones WHERE project_id = $1 ORDER BY due_date', [id]);

        return json(res, {
          totalStories: storyStats.totalStories,
          completedStories: storyStats.completedStories,
          totalPoints: storyStats.totalPoints,
          completedPoints: storyStats.completedPoints,
          totalTasks: taskStats.totalTasks,
          doneTasks: taskStats.doneTasks,
          activeSprint, milestones,
          storyCompletionRate: storyStats.totalStories ? Math.round(storyStats.completedStories / storyStats.totalStories * 100) : 0,
          pointsCompletionRate: storyStats.totalPoints ? Math.round(storyStats.completedPoints / storyStats.totalPoints * 100) : 0,
        });
      }
      if (id) {
        const project = await queryOne('SELECT * FROM projects WHERE id = $1', [id]);
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
