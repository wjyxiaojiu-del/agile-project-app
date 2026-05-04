import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Backlog from './pages/Backlog';
import SprintBoard from './pages/SprintBoard';
import SprintPlan from './pages/SprintPlan';
import Standup from './pages/Standup';
import Risks from './pages/Risks';
import Report from './pages/Report';

export default function App() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <main className="flex-1 ml-[220px] p-6 page-enter" key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/backlog" element={<Backlog />} />
          <Route path="/board" element={<SprintBoard />} />
          <Route path="/plan" element={<SprintPlan />} />
          <Route path="/standup" element={<Standup />} />
          <Route path="/risks" element={<Risks />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </main>
    </div>
  );
}
