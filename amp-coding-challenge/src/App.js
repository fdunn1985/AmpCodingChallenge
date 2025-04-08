import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/dashboard/dashboard.component';
import Navigation from './routes/navigation/navigation.component';

import './App.css';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Navigation />}>
          <Route index element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
