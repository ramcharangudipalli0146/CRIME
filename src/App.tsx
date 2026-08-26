import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DatasetProvider } from '@/components/DatasetProvider';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { NetworkAnalysis } from '@/pages/NetworkAnalysis';
import { DataExplorer } from '@/pages/DataExplorer';
import { Timeline } from '@/pages/Timeline';
import { Alerts } from '@/pages/Alerts';
import { AIAnalysis } from '@/pages/AIAnalysis';
import { Reports } from '@/pages/Reports';
import { SettingsPage } from '@/pages/Settings';

function App() {
  return (
    <DatasetProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/network" element={<NetworkAnalysis />} />
            <Route path="/data" element={<DataExplorer />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/ai-analysis" element={<AIAnalysis />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DatasetProvider>
  );
}

export default App;
