import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { fetchUserById, updateUserDocument } from '../../../utils/firebase/firebase.utils';

import './user-detail.styles.scss';

const defaultNewVehicle = {
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    subscription: {
        type: 'Basic',
        status: 'Active',
        renewalPeriod: 'Monthly',
        renewalPrice: 19.99
    }
};

const subscriptionPrices = {
    Basic: {
        Monthly: 9.99,
        Quarterly: 27.99,
        Annually: 99.99
    },
    Premium: {
        Monthly: 14.99,
        Quarterly: 42.99,
        Annually: 149.99
    },
    Ultimate: {
        Monthly: 19.99,
        Quarterly: 57.99,
        Annually: 199.99
    },
}


const UserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [editedUser, setEditedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
    const [newVehicle, setNewVehicle] = useState(defaultNewVehicle);

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
    };

    const getRenewalDate = (startDate, renewalPeriod) => {
        const date = new Date(startDate);

        switch (renewalPeriod) {
            case 'Monthly':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'Quarterly':
                date.setMonth(date.getMonth() + 3);
                break;
            case 'Annually':
                date.setFullYear(date.getFullYear() + 1);
                break;
            default:
                throw new Error(`Unknown renewal period: ${renewalPeriod}`);
        }

        return date;
    }

    const handleAddVehicle = async (event) => {
        event.preventDefault();

        const vehicleId = uuidv4();

        const date = new Date();
        const normalizedPrice = typeof newVehicle.subscription.renewalPrice === 'string'
                                    ? parseFloat(newVehicle.subscription.renewalPrice)
                                    : newVehicle.subscription.renewalPrice;

        const vehicleToAdd = {
            ...newVehicle,
            id: vehicleId,
            subscription: {
                ...newVehicle.subscription,
                startDate: date,
                renewalDate: getRenewalDate(date, newVehicle.subscription.renewalPeriod),
                renewalPrice: normalizedPrice
            }
        };

        const purchaseToAdd = {
            id: uuidv4(),
            date: date,
            type: 'Subscription',
            description: `${vehicleToAdd.subscription.type} ${vehicleToAdd.subscription.renewalPeriod} Subscription`,
            amount: subscriptionPrices[vehicleToAdd.subscription.type][vehicleToAdd.subscription.renewalPeriod],
            status: 'Active'
        }

        const updatedUser = {
            ...user,
            vehicles: [...user.vehicles, vehicleToAdd],
            purchaseHistory: [...user.purchaseHistory, purchaseToAdd]
        };

        setUser(updatedUser);
        setShowAddVehicleModal(false);

        try {
            await updateUserDocument(updatedUser);
        } catch (error) {
            console.error("Failed to update user in Firestore", error);
        }
    };

    const handleVehicleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('subscription.')) {
            const subscriptionField = name.split('.')[1];

            // need to get the subscription for the price
            const updatedSubscription = {
                ...newVehicle.subscription,
                [subscriptionField]: value
            };

            const { type, renewalPeriod } = updatedSubscription;
            console.log("type:", type, "renewalPeriod:", renewalPeriod);
            console.log("price:", subscriptionPrices[type]?.[renewalPeriod]);

            updatedSubscription.renewalPrice = subscriptionPrices[type][renewalPeriod];
            console.log("price updated: ", updatedSubscription.renewalPrice);

            setNewVehicle({
                ...newVehicle,
                subscription: updatedSubscription
            });
        } else {
            setNewVehicle({
                ...newVehicle,
                [name]: value
            });
        }
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
                                    <button 
                                        className="add-vehicle-button"
                                        onClick={() => setShowAddVehicleModal(true)}
                                    >
                                        Add Vehicle
                                    </button>
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
                                                    <span>
                                                        {vehicle.subscription?.startDate instanceof Date
                                                            ? vehicle.subscription.startDate.toLocaleString()
                                                            : vehicle.subscription?.startDate?.toDate?.().toLocaleString() || ''}
                                                    </span>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Renewal Date:</label>
                                                    <span>
                                                        {vehicle.subscription?.renewalDate instanceof Date
                                                            ? vehicle.subscription.renewalDate.toLocaleString()
                                                            : vehicle.subscription?.renewalDate?.toDate?.().toLocaleString() || ''}
                                                    </span>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Renewal Price:</label>
                                                    <span>
                                                    ${parseFloat(vehicle.subscription.renewalPrice).toFixed(2)}
                                                    </span>
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

                            {showAddVehicleModal && (
                                <div className="modal-overlay">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h2>Add New Vehicle</h2>
                                            <button
                                                className="close-button"
                                                onClick={() => setShowAddVehicleModal(false)}
                                            >
                                                &times;
                                            </button>    
                                        </div>

                                        <form onSubmit={handleAddVehicle} className="add-vehicle-form">
                                            <div className="form-section">
                                                <h3>Vehicle Information</h3>
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label htmlFor="make">Make *</label>
                                                        <input 
                                                            type="text"
                                                            id="make"
                                                            name="make"
                                                            value={newVehicle.make}
                                                            onChange={handleVehicleInputChange}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label htmlFor="model">Model *</label>
                                                        <input 
                                                            type="text"
                                                            id="model"
                                                            name="model"
                                                            value={newVehicle.model}
                                                            onChange={handleVehicleInputChange}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label htmlFor="year">Year *</label>
                                                        <input 
                                                            type="text"
                                                            id="year"
                                                            name="year"
                                                            value={newVehicle.year}
                                                            onChange={handleVehicleInputChange}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label htmlFor="licensePlate">License Plate *</label>
                                                        <input 
                                                            type="text"
                                                            id="licensePlate"
                                                            name="licensePlate"
                                                            value={newVehicle.licensePlate}
                                                            onChange={handleVehicleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="form-section">
                                                <h3>Subscription Information</h3>
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label htmlFor="subscription.type">Subscription Type</label>
                                                        <select 
                                                            id="subscription.type"
                                                            name="subscription.type"
                                                            value={newVehicle.subscription.type}
                                                            onChange={handleVehicleInputChange}
                                                        >
                                                            <option value="Basic">Basic</option>
                                                            <option value="Premium">Premium</option>
                                                            <option value="Ultimate">Ultimate</option>
                                                        </select>
                                                    </div>

                                                    <div className="form-group">
                                                        <label htmlFor="renewalPeriod">Renewal Period</label>
                                                        <select 
                                                            id="subscription.renewalPeriod"
                                                            name="subscription.renewalPeriod"
                                                            value={newVehicle.subscription.renewalPeriod}
                                                            onChange={handleVehicleInputChange}
                                                        >
                                                            <option value="Monthly">Monthly</option>
                                                            <option value="Quarterly">Quarterly</option>
                                                            <option value="Annually">Annually</option>
                                                        </select>
                                                    </div>

                                                    {/* Make Price dynamic based on subscription */}
                                                    <div className="form-group">
                                                        <label htmlFor="subscription.renewalPrice">Subscription Price</label>
                                                        <input 
                                                            type="number"
                                                            id="subscription.renewalPrice"
                                                            name="subscription.renewalPrice"
                                                            value={newVehicle.subscription.renewalPrice}
                                                            onChange={handleVehicleInputChange}
                                                            step="0.01"
                                                            min="0"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="form-actions">
                                                <button 
                                                    type="button"
                                                    className="cancel-button"
                                                    onClick={() =>setShowAddVehicleModal(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button type="submit" className="submit-button">
                                                    Add Vehicle
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
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
                                            <td data-label="Date">
                                                {purchase.date instanceof Date
                                                    ? purchase.date.toLocaleString()
                                                    : purchase.date?.toDate?.().toLocaleString() || ''}
                                            </td>
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