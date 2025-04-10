import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/dashboard/dashboard.component';
import Navigation from './routes/navigation/navigation.component';
import NewUser from './components/user/new-user/new-user.component';
import UserList from './components/user/user-list/user-list.component';
import UserDetail from './components/user/user-detail/user-detail.component';

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
          <Route path="/userDetail/:userId" element={<UserDetail />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
