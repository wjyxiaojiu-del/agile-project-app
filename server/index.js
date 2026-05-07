import express from 'express';
import cors from 'cors';
import { initDB, flushDB } from './db.js';
import projectsRouter from './routes/projects.js';
import storiesRouter from './routes/stories.js';
import tasksRouter from './routes/tasks.js';
import sprintsRouter from './routes/sprints.js';
import standupsRouter from './routes/standups.js';
import risksRouter from './routes/risks.js';
import milestonesRouter from './routes/milestones.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/projects', projectsRouter);
app.use('/api/stories', storiesRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/sprints', sprintsRouter);
app.use('/api/standups', standupsRouter);
app.use('/api/risks', risksRouter);
app.use('/api/milestones', milestonesRouter);

// Error handler - prevents crashes from silently failing
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: err.message });
});

async function start() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Flush DB on shutdown
process.on('SIGINT', () => { flushDB(); process.exit(0); });
process.on('SIGTERM', () => { flushDB(); process.exit(0); });
process.on('exit', () => { flushDB(); });

start().catch(console.error);
