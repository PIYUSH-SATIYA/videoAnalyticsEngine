import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { GlobalFiltersProvider } from './context/GlobalFiltersContext';
import { AudiencePage } from './pages/AudiencePage';
import { ContentPage } from './pages/ContentPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { OverviewPage } from './pages/OverviewPage';
import { QualityPage } from './pages/QualityPage';

function App() {
  return (
    <GlobalFiltersProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="audience" element={<AudiencePage />} />
            <Route path="content" element={<ContentPage />} />
            <Route path="quality" element={<QualityPage />} />
            <Route path="explorer" element={<ExplorerPage />} />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GlobalFiltersProvider>
  );
}

export default App;
