import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import DetectionDashboard from './pages/DetectionDashboard';
import Analytics from './pages/Analytics';
import ReportPage from './pages/ReportPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          
          <Route path="app">
            <Route path="overview" element={<Dashboard />} />
            <Route path="dashboard" element={<DetectionDashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="reports" element={<ReportPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
