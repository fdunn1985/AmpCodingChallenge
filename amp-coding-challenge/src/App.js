import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/dashboard/dashboard.component';
import Navigation from './routes/navigation/navigation.component';
import NewUser from './components/new-user/new-user.component';
import UserList from './components/user-list/user-list.component';

import './App.css';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Navigation />}>
          <Route index element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/newUser" element={<NewUser />} />
          <Route path="/userList" element={<UserList />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
