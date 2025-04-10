import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { fetchUserById } from '../../../utils/firebase/firebase.utils';

import './user-detail.styles.scss';


const UserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [editedUser, setEditedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect( () => {
        // using mock for now, replace with real firebase data.
        const fetchUser = async () => {
            const userDetail = await fetchUserById(userId);

            if (userDetail) {
                setUser(userDetail);
                setEditedUser(userDetail);
            }
        }
        
        fetchUser();
    }, [userId]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);

        if (!isEditing) {
            setEditedUser({...user});
        }
    };

    const handleSave = () => {
        setUser(editedUser);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedUser(user);
        setIsEditing(false);
    };

    const handleInputChange = (event) => {
        const {name, value} = event.target;

        setEditedUser({
            ...editedUser,
            [name]: value
        });
    };

    const handleSendEmail = () => {
        alert("Email opened in Outlook with customer template.");
    };

    const handleResetPassword = () => {
        alert("Customer has been sent reset password information");
    };

    const handleCancelAccount = (event) => {
        //TODO set customer account to inactive
        alert("Setting customer account to inactive");
    }

    if (!user) {
        return (
            <div className="user-detail-container">
                <div className="not-found">User not found.</div>
            </div>
        )
    }

    return (
        <div className="user-detail-container">
            <div className="user-detail-content">
                <div className="user-detail-header">
                    <div className="header-left">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            &larr; Back
                        </button>
                        <h1>{user.name}</h1>
                        <span className={`status-badge ${user.status.toLowerCase()}`}>
                            {user.status}
                        </span>
                    </div>

                    <div className="header-actions">
                        {!isEditing ? (
                            <button className="edit-button" onClick={handleEditToggle}>Edit User</button>
                        ) : (
                            <>
                                <button className="save-button" onClick={handleSave}>Save Changes</button>
                                <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                            </>
                        )}
                    </div>
                </div>

                <div className="user-detail-tabs">
                    <button
                        className={activeTab === 'profile' ? 'active' : ''}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile
                    </button>
                    <button
                        className={activeTab === 'vehicles' ? 'active' : ''}
                        onClick={() => setActiveTab('vehicles')}
                    >
                        Vehicles & Subscriptions
                    </button>
                    <button
                        className={activeTab === 'purchases' ? 'active' : ''}
                        onClick={() => setActiveTab('purchases')}
                    >
                        Purchase History
                    </button>
                </div>

                <div className="user-detail-body">
                    {activeTab === 'profile' && (
                        <div className="profile-tab">
                            <div className="profile-section">
                                <h2>Account Information</h2>
                                <div className="profile-form">

                                    <div className="form-group">
                                        <label>Name:</label>
                                        {isEditing ? (
                                            <input 
                                                type="text"
                                                name="name"
                                                value={editedUser.name}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            <span>{user.name}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Email:</label>
                                        {isEditing ? (
                                            <input 
                                                type="email"
                                                name="email"
                                                value={editedUser.email}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            <span>{user.email}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Phone:</label>
                                        {isEditing ? (
                                            <input 
                                                type="text"
                                                name="phone"
                                                value={editedUser.phone}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            <span>{user.phone}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Address:</label>
                                        {isEditing ? (
                                            <input 
                                                type="text"
                                                name="address"
                                                value={editedUser.address}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            <span>{user.address}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Status:</label>
                                        {isEditing ? (
                                            <select
                                                name="status"
                                                value={editedUser.status}
                                                onChange={handleInputChange}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Overdue">Overdue</option>
                                                <option value="Inactive">Inactive</option>
                                            </select>
                                        ) : (
                                            <span className={`status-text ${user.status.toLowerCase()}`}>
                                                {user.status}
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Registration Date:</label>
                                        <span>{user.registrationDate?.toDate?.().toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-actions">
                                <h2>Quick Actions</h2>
                                <div className="action-buttons">
                                    <button className="action-button cancel-account" onClick={(event) => handleCancelAccount(event)}>
                                        Cancel Account
                                    </button>
                                    <button className="action-button reset-password" onClick={handleResetPassword}>
                                        Reset Password
                                    </button>
                                    <button className="action-button send-email" onClick={handleSendEmail}>
                                        Send Email
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'vehicles' && (
                        <div className="vehicles-tab">
                            <div className="vehicle-section">
                                <div className="section-header">
                                    <h2>Vehicles & Subscriptions</h2>
                                    <button className="add-vehicle-button">Add Vehicle</button>
                                </div>

                                {user.vehicles.map(vehicle => (
                                    <div className="vehicle-card" key={vehicle.id}>
                                        <div className="vehicle-info">
                                            <h3>{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                                            <p>License Plate: {vehicle.licensePlate}</p>
                                        </div>

                                        <div className="subscription-info">
                                            <h4>Subscription Details</h4>
                                            <div className="subscription-details">
                                                <div className="detail-item">
                                                    <label>Type:</label>
                                                    <span>{vehicle.subscription.type}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Status:</label>
                                                    <span className={`status-text ${vehicle.subscription?.status?.toLowerCase() || ''}`}>
                                                        {vehicle.subscription.status}
                                                    </span>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Start Date:</label>
                                                    <span>{vehicle.subscription?.startDate.toDate().toLocaleString() || ''}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Renewal Date:</label>
                                                    <span>{vehicle.subscription?.renewalDate.toDate().toLocaleString() || ''}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Renewal Price:</label>
                                                    <span>${vehicle.subscription.renewalPrice.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="vehicle-actions">
                                            <button className="edit-vehicle-button">Edit Vehicle</button>
                                            <button className="transfer-subscription-button">Transfer Subscription</button>
                                            <button className="cancel-subscription-button">Cancel Subscription</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'purchases' && (
                        <div className="purchases-tab">
                            <h2>Purchase History</h2>

                            <table className="purchase-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {user.purchaseHistory.map(purchase => (
                                        <tr key={purchase.id}>
                                            <td data-label="Date">{purchase.date.toDate().toLocaleString()}</td>
                                            <td data-label="Description">{purchase.description}</td>
                                            <td data-label="Type">{purchase.type}</td>
                                            <td data-label="Amount">{purchase.amount.toFixed(2)}</td>
                                            <td data-label="Status">
                                                <span className={`status-badge ${purchase.status.toLowerCase()}`}>
                                                    {purchase.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDetail;