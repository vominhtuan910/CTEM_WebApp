import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import VulnerabilityTable from './components/Issues/Vulnerability/VulnerabilityTable';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="issues" element={<VulnerabilityTable />} />
        <Route path="assets" element={<Assets />} />
        {/* Add more routes if needed */}
      </Route>
    </Routes>
  );
};

export default App;
