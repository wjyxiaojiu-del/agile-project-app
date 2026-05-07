import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Backlog = lazy(() => import('./pages/Backlog'));
const SprintBoard = lazy(() => import('./pages/SprintBoard'));
const SprintPlan = lazy(() => import('./pages/SprintPlan'));
const Standup = lazy(() => import('./pages/Standup'));
const Risks = lazy(() => import('./pages/Risks'));
const Report = lazy(() => import('./pages/Report'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm text-slate-400">加载中...</span>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <ProjectProvider>
      <ToastProvider>
        <ErrorBoundary>
          <div className="flex min-h-screen" style={{ background: '#faf5ef' }}>
            <Sidebar />
            <main className="flex-1 ml-[220px] p-6 page-enter" key={location.pathname}>
              <Suspense fallback={<PageLoader />}>
                <Routes location={location}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/backlog" element={<Backlog />} />
                  <Route path="/board" element={<SprintBoard />} />
                  <Route path="/plan" element={<SprintPlan />} />
                  <Route path="/standup" element={<Standup />} />
                  <Route path="/risks" element={<Risks />} />
                  <Route path="/report" element={<Report />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </ErrorBoundary>
      </ToastProvider>
    </ProjectProvider>
  );
}
