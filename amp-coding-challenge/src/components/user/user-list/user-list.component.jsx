import React, {useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { fetchAllUsers } from '../../../utils/firebase/firebase.utils';

import './user-list.styles.scss';

const FetchUsers = async () => {
    try {
        return await fetchAllUsers();
    } catch (error) {
        console.error('Error creating user:', error);
        return [];
    }
}

const UserList = () => {
    // allows for getting the url params
    const location = useLocation();

    // allows for updating the url
    const navigate = useNavigate();

    //parses the params from the url by search
    const queryParams = new URLSearchParams(location.search);
    const statusParam = queryParams.get('status') || '';
    const initialSearchQuery = queryParams.get('search') || '';

    // rawUsers used to hold on to the initial list of users
    const [rawUsers, setRawUsers] = useState([]);

    // filtered version of users to use for display
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [statusFilter, setStatusFilter] = useState('All');
    const [subscriptionFilter, setSubscriptionFilter] = useState('All');

    // adding the capability to sort the table
    const [sortOrder, setSortOrder] = useState('asc');

    // fetch users
    useEffect(() => {
        const getUsers = async () => {
            const data = await FetchUsers();

            const userUpdatedStatus = data.map(user => ({
                ...user,
                status: determineUserStatus(user.vehicles)
            }))

            setRawUsers(userUpdatedStatus);
            setUsers(userUpdatedStatus);

            // filter by params passed in for either user or status
            const queryParams = new URLSearchParams(location.search);
            const statusParam = queryParams.get('status') || '';
            const searchParam = queryParams.get('search') || '';

            if (statusParam) {
                setStatusFilter(statusParam);
            }
    
            if (searchParam) {
                setSearchQuery(searchParam);
            }
        }

        getUsers();
    }, []);

    // real time filtering of users
    useEffect(() => {
        let filteredUsers = [...rawUsers];

        if (searchQuery) {
            filteredUsers = filteredUsers.filter(user => 
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.phone.includes(searchQuery)
            );
        }

        if (statusFilter !== 'All') {
            filteredUsers = filteredUsers.filter(user => user.status === statusFilter);
        }

        if (subscriptionFilter !== 'All') {
            filteredUsers = filteredUsers.filter(user => user.subscription.type === subscriptionFilter);
        }

        filteredUsers.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
        
            if (nameA < nameB) return sortOrder === 'asc' ? -1 : 1;
            if (nameA > nameB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        
        setUsers(filteredUsers);
    }, [searchQuery, statusFilter, subscriptionFilter, sortOrder]);

    const handleSearch = (event) => {
        event.preventDefault();
    };

    const handleSortByName = () => {
        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newOrder);
    };

    const determineUserStatus = (vehicles) => {
        if (!vehicles || vehicles.length === 0) return 'Inactive';

        const statuses = vehicles.map(veh => veh.subscription.status);

        if (statuses.includes('Overdue')) return 'Overdue';
        if (statuses.every(status => status === 'Active')) return 'Active';
        if (statuses.every(status => status === 'Cancelled')) return 'Inactive'

        return 'Active';
    };

    return (
        <div className="user-list-container">
            <div className="user-list-content">
                <div className="user-list-header">
                    <h1>User Management</h1>
                    <div className="search-and-filters">
                        <form onSubmit={handleSearch} className="search-form">
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit">Search</button>
                        </form>

                        <div className="filters">
                            <div className="filter">
                                <label>Status:</label>
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                    <option value="All">All</option>
                                    <option value="Active">Active</option>
                                    <option value="Overdue">Overdue</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="filter">
                                <label>Subscription:</label>
                                <select value={subscriptionFilter} onChange={(e) => setSubscriptionFilter(e.target.value)}>
                                    <option value="All">All</option>
                                    <option value="Basic">Basic</option>
                                    <option value="Premium">Premium</option>
                                    <option value="Ultimate">Ultimate</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="user-table-container">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSortByName()}>
                                Name {sortOrder === 'asc' ? '↑' : '↓'}
                            </th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Subscription</th>
                            <th>Registration Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map(user => (
                                <tr key={user.id}>
                                    <td data-label="Name">{user.name}</td>
                                    <td data-label="Email">{user.email}</td>
                                    <td data-label="Phone">{user.phone}</td>
                                    <td data-label="Status">
                                        <span className={`status-badge ${user.status.toLowerCase()}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td data-label="Subscription">{user.vehicles?.[0].subscription?.type}</td>
                                    <td data-label="Registration Date">{user.registrationDate.toDate().toLocaleString()}</td>
                                    <td data-label="Actions">
                                        <Link to={`/userDetail/${user.id}`} className="view-button">
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-results">
                                    No users found matching your search criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        
    )
};

export default UserList;