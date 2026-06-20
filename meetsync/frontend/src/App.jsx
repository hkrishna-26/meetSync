import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Upload from './pages/Upload';
import Processing from './pages/Processing';
import Results from './pages/Results';
import History from './pages/History';

function App() {
  return (
    <Router>
      <div style={{ 
        display: 'flex', 
        minHeight: '100vh', 
        backgroundColor: '#0a0a0c', 
        color: '#ffffff', 
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
      }}>
        <Sidebar />
        <div style={{ 
          flex: 1, 
          padding: '40px', 
          boxSizing: 'border-box', 
          overflowY: 'auto' 
        }}>
          <Routes>
            <Route path="/" element={<Upload />} />
            <Route path="/processing/:id" element={<Processing />} />
            <Route path="/results/:id" element={<Results />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
