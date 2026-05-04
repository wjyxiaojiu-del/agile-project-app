import { Router } from 'express';
import { queryAll, queryOne } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(queryAll('SELECT * FROM projects'));
});

router.get('/:id', (req, res) => {
  const project = queryOne('SELECT * FROM projects WHERE id = ?', [+req.params.id]);
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json(project);
});

router.get('/:id/stats', (req, res) => {
  const id = +req.params.id;
  const totalStories = queryOne('SELECT COUNT(*) as count FROM user_stories WHERE project_id = ?', [id]).count;
  const completedStories = queryOne("SELECT COUNT(*) as count FROM user_stories WHERE project_id = ? AND status = 'done'", [id]).count;
  const totalPoints = queryOne('SELECT COALESCE(SUM(story_points),0) as total FROM user_stories WHERE project_id = ?', [id]).total;
  const completedPoints = queryOne("SELECT COALESCE(SUM(story_points),0) as total FROM user_stories WHERE project_id = ? AND status = 'done'", [id]).total;
  const totalTasks = queryOne('SELECT COUNT(*) as count FROM tasks t JOIN user_stories s ON t.story_id = s.id WHERE s.project_id = ?', [id]).count;
  const doneTasks = queryOne("SELECT COUNT(*) as count FROM tasks t JOIN user_stories s ON t.story_id = s.id WHERE s.project_id = ? AND t.status = 'done'", [id]).count;
  const activeSprint = queryOne("SELECT * FROM sprints WHERE project_id = ? AND status != 'completed' ORDER BY number LIMIT 1", [id]);
  const milestones = queryAll('SELECT * FROM milestones WHERE project_id = ? ORDER BY due_date', [id]);

  res.json({
    totalStories, completedStories, totalPoints, completedPoints,
    totalTasks, doneTasks, activeSprint, milestones,
    storyCompletionRate: totalStories ? Math.round(completedStories / totalStories * 100) : 0,
    pointsCompletionRate: totalPoints ? Math.round(completedPoints / totalPoints * 100) : 0,
  });
});

export default router;
