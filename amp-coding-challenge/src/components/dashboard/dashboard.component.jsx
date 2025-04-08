import { useState } from 'react';
import { Link } from 'react-router-dom';

import './dashboard.styles.scss';

const Dashboard = () => {

    const [searchQuery, setSearchQuery] = useState('');

    // Mock data for quick stats
    const stats = {
        totalUsers: 101,
        activeSubscriptions: 87,
        overdueAccounts: 25,
        recentCalls: 14
    };
    
    // Mock data for recent activities
    const recentActivities = [
        { id: 1, action: 'Account Update', user: 'John Smith', time: '10 minutes ago' },
        { id: 2, action: 'Subscription Transfer', user: 'Emily Johnson', time: '25 minutes ago' },
        { id: 3, action: 'Account Cancellation', user: 'Michael Brown', time: '1 hour ago' },
        { id: 4, action: 'Payment Update', user: 'Sarah Wilson', time: '2 hours ago' },
        { id: 5, action: 'New Registration', user: 'David Taylor', time: '3 hours ago' },
    ];
    
    const handleSearch = (event) => {
        event.preventDefault();
        if (searchQuery.trim()) {
            // TODO
            // navigate(`/users?search=${searchQuery}`);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">

                {/* Can be separated into a header container? */}
                <div className="dashboard-header">
                    <h1>AMP CSR Dashboard</h1>
                    <div className="search">
                        <form onSubmit={handleSearch}>
                            <input 
                                type="text" 
                                placeholder="Search users by name, email or phone number" 
                                value={searchQuery} 
                                onChange={(e)=> setSearchQuery(e.target.value)}/>
                            <button type="submit">Search</button>
                        </form>
                    </div>
                </div>

                {/* Can be broken into a separate stats component? */}
                <div className="stats-container">
                    <div className="stats-card">
                        <h3>Total Users</h3>
                        <p>{stats.totalUsers}</p>
                    </div>
                    <div className="stats-card">
                        <h3>Active Subscriptions</h3>
                        <p>{stats.activeSubscriptions}</p>
                    </div>
                    <div className="stats-card">
                        <h3>Overdue Accounts</h3>
                        <p>{stats.overdueAccounts}</p>
                    </div>
                    <div className="stats-card">
                        <h3>Recent Calls</h3>
                        <p>{stats.recentCalls}</p>
                    </div>
                </div>

                <div className="dashboard-sections">
                    <div className="section">
                        <div className="section-header">
                            <h2>Recent Activities</h2>
                            <Link to="/linkToActivities">View All</Link>
                        </div>
                        <div className="activities-list">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Action</th>
                                        <th>User</th>
                                        <th>Time</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentActivities.map(activity => (
                                        <tr key={activity.id}>
                                            <td>{activity.action}</td>
                                            <td>{activity.user}</td>
                                            <td>{activity.time}</td>
                                            <td>
                                                <Link to="user detail page">View</Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="section">
                        <div className="section-header">
                            <h2>Quick Actions</h2>
                        </div>
                        <div className="quick-actions">
                            <Link to="newUsersPage" className="action-button">Create New User</Link>
                            <Link to="usersPage" className="action-button">View All Users</Link>
                            <Link to="overdueAccountsPage" className="action-button">View Overdue Accounts</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;