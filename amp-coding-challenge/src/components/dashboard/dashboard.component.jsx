import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import StatsCard from '../stats-card/stats-card.component';

import { fetchAllUsers, fetchAllRecentActivities } from '../../utils/firebase/firebase.utils';

import './dashboard.styles.scss';

const Dashboard = () => {

    const [searchQuery, setSearchQuery] = useState('');
    const [userCount, setUserCount] = useState(0);
    const [activeCount, setActiveCount] = useState(0);
    const [overdueCount, setOverdueCount] = useState(0);
    const [recentCallCount, setRecentCallCount] = useState(0);
    const [dbRecentActivities, setDbRecentActivities] = useState([]);
    const [viewAllActivities, setViewAllActivities] = useState(false);

    const navigate = useNavigate();

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
            navigate(`/userList?search=${searchQuery}`);
        }
    };

    const FetchUsers = async () => {
        try {
            return await fetchAllUsers();
        } catch (error) {
            console.error('Error fetching users', error);
            return [];
        }
    };

    const FetchRecentActivities = async () => {
        try {
            return await fetchAllRecentActivities();
        } catch (error) {
            console.error('Error fetching activities', error);
            return [];
        }
    };

    const handleViewAllToggle = () => {
        setViewAllActivities(!viewAllActivities);
    };

    useEffect( () => {
        const fetchActivities = async () => {

            const data = await FetchRecentActivities();
        
            const updatedTimeActivities = data.map(activity => {
                const now = new Date();
                const timestamp = activity.timestamp?.toDate?.() || new Date(activity.timestamp);
                const timeDiff = now - timestamp;
                const minutesDiff = Math.floor(timeDiff / 60000);

                let timeAgo = '';
                if (minutesDiff < 1) timeAgo = "Just now";
                else if (minutesDiff < 60) timeAgo = `${minutesDiff} minute(s) ago`;
                else {
                    const hoursDiff = Math.floor(minutesDiff / 60);
                    if (hoursDiff < 24) {
                        timeAgo = `${hoursDiff} hour(s) ago`;
                    } else {
                        const daysDiff = Math.floor(hoursDiff / 24);
                        timeAgo = `${daysDiff} day(s) ago`;
                    }
                }

                console.log(activity);
                return {
                    ...activity,
                    time: timeAgo,
                };
            })

            setDbRecentActivities(updatedTimeActivities);
        };

        fetchActivities();
    }, []);

    // fetch users
    useEffect(() => {
        const getUsers = async () => {
            const data = await FetchUsers();

            const count = data.length;
            setUserCount(count);

            const activeUsers = data.filter(user => user.status === 'Active');
            setActiveCount(activeUsers.length);

            const overdueUsers = data.filter(user => user.status === 'Overdue');
            setOverdueCount(overdueUsers.length);

            let callCount = 0;
            const now = new Date();
            const fourHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
            
            data.forEach(user => {
                if (user.purchaseHistory.length !== 0) {
                    const hasRecentPurcahse = user.purchaseHistory.some(purchase => {
                        const purchaseDate = purchase.date instanceof Date
                            ? purchase.date
                            : purchase.date?.toDate?.();
                        
                            return purchaseDate && purchaseDate >= fourHoursAgo;
                    });

                    if (hasRecentPurcahse) {
                        callCount++;
                    }
                }
            });

            setRecentCallCount(callCount);
        }

        getUsers();
    }, []);
    

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
                    <StatsCard header="Total Users" value={userCount} />
                    <StatsCard header="Active Subscriptions" value={activeCount} />
                    <StatsCard header="Overdue Accounts" value={overdueCount} />
                    <StatsCard header="Recent Calls" value={recentCallCount} />
                </div>

                <div className="dashboard-sections">
                    <div className="section">
                        <div className="section-header">
                            <h2>Recent Activities</h2>
                            <button className="view-button" onClick={(handleViewAllToggle)}>View All</button>
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
                                    {(viewAllActivities ? dbRecentActivities : dbRecentActivities.slice(0,5)).map(activity => (
                                        <tr key={activity.id}>
                                            <td>{activity.action}</td>
                                            <td>{activity.userName}</td>
                                            <td>{activity.time}</td>
                                            <td>
                                                <Link to={`/userDetail/${activity.userId}`}>View</Link>
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
                            <Link to="/newUser" className="action-button">Create New User</Link>
                            <Link to="/userList" className="action-button">View All Users</Link>
                            <Link to="/userList?status=Overdue" className="action-button">View Overdue Accounts</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;