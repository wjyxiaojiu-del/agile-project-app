import { ensureTables, query, queryOne, json, error } from './_db.js';

export default async function handler(req, res) {
  try {
    await ensureTables();
    const { id, action } = req.query;

    if (req.method === 'GET') {
      if (id && action === 'stats') {
        const totalStories = (await queryOne('SELECT COUNT(*)::int as count FROM user_stories WHERE project_id = $1', [id])).count;
        const completedStories = (await queryOne("SELECT COUNT(*)::int as count FROM user_stories WHERE project_id = $1 AND status = 'done'", [id])).count;
        const totalPoints = (await queryOne('SELECT COALESCE(SUM(story_points),0)::int as total FROM user_stories WHERE project_id = $1', [id])).total;
        const completedPoints = (await queryOne("SELECT COALESCE(SUM(story_points),0)::int as total FROM user_stories WHERE project_id = $1 AND status = 'done'", [id])).total;
        const totalTasks = (await queryOne('SELECT COUNT(*)::int as count FROM tasks t JOIN user_stories s ON t.story_id = s.id WHERE s.project_id = $1', [id])).count;
        const doneTasks = (await queryOne("SELECT COUNT(*)::int as count FROM tasks t JOIN user_stories s ON t.story_id = s.id WHERE s.project_id = $1 AND t.status = 'done'", [id])).count;
        const activeSprint = await queryOne("SELECT * FROM sprints WHERE project_id = $1 AND status != 'completed' ORDER BY number LIMIT 1", [id]);
        const milestones = await query('SELECT * FROM milestones WHERE project_id = $1 ORDER BY due_date', [id]);
        return json(res, {
          totalStories, completedStories, totalPoints, completedPoints,
          totalTasks, doneTasks, activeSprint, milestones,
          storyCompletionRate: totalStories ? Math.round(completedStories / totalStories * 100) : 0,
          pointsCompletionRate: totalPoints ? Math.round(completedPoints / totalPoints * 100) : 0,
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
