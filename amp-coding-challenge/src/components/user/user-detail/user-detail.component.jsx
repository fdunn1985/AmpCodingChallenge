import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './user-detail.styles.scss';

const mockUserDetails = {
    1: {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '(555) 123-4567',
      address: '123 Main St, Anytown, USA',
      status: 'Active',
      registrationDate: '2023-01-15',
      vehicles: [
        {
          id: 101,
          make: 'Toyota',
          model: 'Camry',
          year: '2020',
          licensePlate: 'ABC123',
          subscription: {
            id: 201,
            type: 'Premium',
            status: 'Active',
            startDate: '2023-01-15',
            renewalDate: '2023-02-15',
            price: 29.99
          }
        }
      ],
      purchaseHistory: [
        {
          id: 301,
          date: '2023-01-15',
          type: 'Subscription',
          description: 'Premium Monthly Subscription',
          amount: 29.99,
          status: 'Completed'
        },
        {
          id: 302,
          date: '2023-02-15',
          type: 'Renewal',
          description: 'Premium Monthly Subscription Renewal',
          amount: 29.99,
          status: 'Completed'
        },
        {
          id: 303,
          date: '2023-03-05',
          type: 'Single Wash',
          description: 'Premium Wash - One Time',
          amount: 12.99,
          status: 'Completed'
        }
      ]
    },
    2: {
      id: 2,
      name: 'Emily Johnson',
      email: 'emily.johnson@example.com',
      phone: '(555) 234-5678',
      address: '456 Oak Ave, Somewhere, USA',
      status: 'Active',
      registrationDate: '2023-02-22',
      vehicles: [
        {
          id: 102,
          make: 'Honda',
          model: 'Civic',
          year: '2021',
          licensePlate: 'XYZ789',
          subscription: {
            id: 202,
            type: 'Basic',
            status: 'Active',
            startDate: '2023-02-22',
            renewalDate: '2023-03-22',
            price: 19.99
          }
        }
      ],
      purchaseHistory: [
        {
          id: 304,
          date: '2023-02-22',
          type: 'Subscription',
          description: 'Basic Monthly Subscription',
          amount: 19.99,
          status: 'Completed'
        },
        {
          id: 305,
          date: '2023-03-22',
          type: 'Renewal',
          description: 'Basic Monthly Subscription Renewal',
          amount: 19.99,
          status: 'Completed'
        }
      ]
    },
    // Add more mock user details as needed
    3: {
      id: 3,
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      phone: '(555) 345-6789',
      address: '789 Pine St, Elsewhere, USA',
      status: 'Cancelled',
      registrationDate: '2022-11-05',
      vehicles: [
        {
          id: 103,
          make: 'Ford',
          model: 'Mustang',
          year: '2019',
          licensePlate: 'DEF456',
          subscription: {
            id: 203,
            type: 'Premium',
            status: 'Cancelled',
            startDate: '2022-11-05',
            renewalDate: '2023-04-05',
            price: 29.99
          }
        }
      ],
      purchaseHistory: [
        {
          id: 306,
          date: '2022-11-05',
          type: 'Subscription',
          description: 'Premium Monthly Subscription',
          amount: 29.99,
          status: 'Completed'
        },
        {
          id: 307,
          date: '2022-12-05',
          type: 'Renewal',
          description: 'Premium Monthly Subscription Renewal',
          amount: 29.99,
          status: 'Completed'
        },
        {
          id: 308,
          date: '2023-01-05',
          type: 'Renewal',
          description: 'Premium Monthly Subscription Renewal',
          amount: 29.99,
          status: 'Completed'
        },
        {
          id: 309,
          date: '2023-02-05',
          type: 'Cancellation',
          description: 'Premium Monthly Subscription Cancellation',
          amount: 0,
          status: 'Completed'
        }
      ]
    },
    4: {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      phone: '(555) 456-7890',
      address: '321 Cedar Rd, Nowhere, USA',
      status: 'Overdue',
      registrationDate: '2023-03-10',
      vehicles: [
        {
          id: 104,
          make: 'Chevrolet',
          model: 'Malibu',
          year: '2022',
          licensePlate: 'GHI789',
          subscription: {
            id: 204,
            type: 'Premium',
            status: 'Overdue',
            startDate: '2023-03-10',
            renewalDate: '2023-04-10',
            price: 29.99
          }
        }
      ],
      purchaseHistory: [
        {
          id: 310,
          date: '2023-03-10',
          type: 'Subscription',
          description: 'Premium Monthly Subscription',
          amount: 29.99,
          status: 'Completed'
        },
        {
          id: 311,
          date: '2023-04-10',
          type: 'Renewal',
          description: 'Premium Monthly Subscription Renewal',
          amount: 29.99,
          status: 'Failed'
        }
      ]
    }
  };

const UserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [editedUser, setEditedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        // using mock for now, replace with real firebase data.
        const userDetail = mockUserDetails[userId];

        if (userDetail) {
            setUser(userDetail);
            setEditedUser(userDetail);
        }
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
                                        <span>{user.registrationDate}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-actions">
                                <h2>Quick Actions</h2>
                                <div className="action-buttons">
                                    <button className="action-button cancel-account">
                                        Cancel Account
                                    </button>
                                    <button className="action-button reset-password">
                                        Reset Password
                                    </button>
                                    <button className="action-button send-email">
                                        Send Email
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDetail;