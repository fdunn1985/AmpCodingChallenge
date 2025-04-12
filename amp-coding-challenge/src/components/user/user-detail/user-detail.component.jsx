import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import VehicleCard from '../../vehicle-card/vehicle-card.component';

import { fetchUserById, updateUserDocument } from '../../../utils/firebase/firebase.utils';
import { determineUserStatus, getRenewalDate } from '../../../utils/helpers/user-helpers.utils';
import {subscriptionPrices } from '../../../utils/helpers/subscription.utils';

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
        renewalPrice: 9.99
    }
};


const UserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [editedUser, setEditedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    // add vehicle variables
    const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
    const [newVehicle, setNewVehicle] = useState(defaultNewVehicle);

    //edit vehicle variables
    const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
    const [vehicleToEdit, setVehicleToEdit] = useState(null);
    const [editedVehicle, setEditedVehicle] = useState(null);

    // transfer subscription variables
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [destinationVehicle, setDestinationVehicle] = useState(null);

    useEffect( () => {
        const fetchUser = async () => {
            const userDetail = await fetchUserById(userId);

            const userDetailUpdatedStatus = {
                ...userDetail,
                status: determineUserStatus(userDetail.vehicles)
            }

            if (userDetailUpdatedStatus) {
                setUser(userDetailUpdatedStatus);
                setEditedUser(userDetailUpdatedStatus);
            }
        }
        
        fetchUser();
    }, [userId]);

    // save method
    const saveUserToDatabase = async(updatedUser, errorMessage="Failed to update user in database.") => {
        try {
            updatedUser.status = determineUserStatus(updatedUser.vehicles);
            await updateUserDocument(updatedUser);
            setUser(updatedUser);
        } catch (error) {
            console.error(errorMessage, error);
        }
    };

    // ===== HANDLERS =====
    const handleEditToggle = () => {
        setIsEditing(prev => {
            const newEditingState = !prev;

            if (newEditingState) {
                setActiveTab('profile');
                setEditedUser({...user});
            }

            return newEditingState;
        });
    };

    const handleSave = () => {
        setUser(editedUser);
        setIsEditing(false);
        
        saveUserToDatabase(editedUser);
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
        // not implementing for this demo
        alert("Email opened in Outlook with customer template.");
    };

    const handleResetPassword = () => {
        // not implementing for this demo
        alert("Customer has been sent reset password information");
    };

    const handleCancelAccount = () => {
        const now = new Date();
    
        const cancellationPurchases = user.vehicles.map(veh => ({
            id: uuidv4(),
            date: now,
            type: 'Subscription',
            description: `${veh.subscription.type} ${veh.subscription.renewalPeriod} Subscription`,
            amount: 0,
            status: 'Cancelled'
        }));
    
        const updatedVehicles = user.vehicles.map(veh => ({
            ...veh,
            subscription: {
                ...veh.subscription,
                status: 'Cancelled'
            }
        }));
    
        const updatedUser = {
            ...user,
            vehicles: updatedVehicles,
            status: 'Inactive',
            purchaseHistory: [...cancellationPurchases, ...user.purchaseHistory]
        };
    
        setUser(updatedUser);
        saveUserToDatabase(updatedUser);
    };

    const handleCancelSubscription = (veh) => {

        if (veh.subscription.status !== 'Cancelled') {
            const updatedVehicles = user.vehicles.map(vehicle => 
                vehicle.id === veh.id ? {
                    ...vehicle,
                    subscription: {
                        ...vehicle.subscription,
                        status: 'Cancelled'
                    }
                } : vehicle
            );
    
            const purchaseToAdd = {
                id: uuidv4(),
                date: new Date(),
                type: 'Subscription',
                description: `${veh.subscription.type} ${veh.subscription.renewalPeriod} Subscription`,
                amount: subscriptionPrices[veh.subscription.type][veh.subscription.renewalPeriod],
                status: 'Cancelled'
            }
    
            const updatedUser = {
                ...user,
                vehicles: updatedVehicles,
                purchaseHistory: [purchaseToAdd, ...user.purchaseHistory]
            };

            saveUserToDatabase(updatedUser, "Failed to cancel subscription.");
        }
    };

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
            purchaseHistory: [purchaseToAdd, ...user.purchaseHistory]
        };

        setUser(updatedUser);
        setShowAddVehicleModal(false);

        saveUserToDatabase(updatedUser);
    };

    const handleOpenTransferModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        setShowTransferModal(true);
    }

    const handleTransferSubmit = async (event) => {
        event.preventDefault();

        if (!destinationVehicle) {
            alert("Please select a destination vehicle");
            return;
        }

        const updatedUser = {...user};

        const sourceVehicleIndex = updatedUser.vehicles.findIndex(v => v.id === selectedVehicle.id);

        if (sourceVehicleIndex === -1) {
            alert("Source vehicle not found");
            return;
        }

        const destVehicleIndex = updatedUser.vehicles.findIndex(v => v.id === destinationVehicle.id);

        if (destVehicleIndex === -1) {
            alert("Destination vehicle not found");
            return;
        }

        const subscription = { ...updatedUser.vehicles[sourceVehicleIndex].subscription };
        updatedUser.vehicles[destVehicleIndex].subscription = subscription;
        updatedUser.vehicles[sourceVehicleIndex].subscription.status = "Transferred";

        const newPurchaseId = uuidv4();
        const today = new Date();

        updatedUser.purchaseHistory.unshift({
            id: newPurchaseId,
            date: today,
            type: "Transfer",
            description: `${subscription.type} Subscription Transfer`,
            amount: 0,
            status: "Completed"
        });

        setUser(updatedUser);

        setShowTransferModal(false);
        setSelectedVehicle(null);
        setDestinationVehicle(null);

        saveUserToDatabase(updatedUser);
    };

    const handleOpenEditModal = (vehicle) => {
        setVehicleToEdit(vehicle);
        setEditedVehicle({...vehicle});
        setShowEditVehicleModal(true);
    };

    const handleEditVehicleChange = (event) => {
        const {name, value } = event.target;

        if (name.startsWith('subscription.')) {
            const subscriptionField = name.split('.')[1];
            setEditedVehicle({
                ...editedVehicle,
                subscription: {
                    ...editedVehicle.subscription,
                    [subscriptionField]: subscriptionField === 'renewalPrice' ? parseFloat(value) : value
                }
            });
        } else {
            setEditedVehicle({
                ...editedVehicle,
                [name]: value
            });
        }
    };

    const handleEditVehicleSubmit = (event) => {
        event.preventDefault();

        const updatedUser = {...user };

        const vehicleIndex = updatedUser.vehicles.findIndex(v => v.id === vehicleToEdit.id);
        
        if (vehicleIndex === -1){
            alert("Vehicle not found");
            return;
        }

        updatedUser.vehicles[vehicleIndex] = editedVehicle;

        setUser(updatedUser);

        setShowEditVehicleModal(false);
        setVehicleToEdit(null);
        setEditedVehicle(null);

        saveUserToDatabase(updatedUser);
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
    // ===== END HANDLERS =====

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
                                    <VehicleCard 
                                        vehicle={vehicle}
                                        onEdit={() => handleOpenEditModal(vehicle)}
                                        onTransfer={() => handleOpenTransferModal(vehicle)}
                                        onCancel={() => handleCancelSubscription(vehicle)}
                                    />
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

                            {showEditVehicleModal && vehicleToEdit && editedVehicle && (
                                <div className="modal-overlay">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h2>Edit Vehicle</h2>
                                            <button 
                                                className="close-button"
                                                onClick={() => setShowEditVehicleModal(false)}
                                            >
                                                &times;
                                            </button>
                                        </div>

                                        <form onSubmit={handleEditVehicleSubmit} className="edit-vehicle-form">
                                            <div className="form-section">
                                                <h3>Vehicle Information</h3>
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label htmlFor="edit-make">Make *</label>
                                                        <input 
                                                            type="text"
                                                            id="edit-make"
                                                            name="make"
                                                            value={editedVehicle.make}
                                                            onChange={handleEditVehicleChange}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label htmlFor="edit-model">Model *</label>
                                                        <input 
                                                            type="text"
                                                            id="edit-model"
                                                            name="model"
                                                            value={editedVehicle.model}
                                                            onChange={handleEditVehicleChange}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label htmlFor="edit-year">Year *</label>
                                                        <input 
                                                            type="text"
                                                            id="edit-year"
                                                            name="year"
                                                            value={editedVehicle.year}
                                                            onChange={handleEditVehicleChange}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label htmlFor="edit-licensePlate">License Plate *</label>
                                                        <input 
                                                            type="text"
                                                            id="edit-licensePlate"
                                                            name="licensePlate"
                                                            value={editedVehicle.licensePlate}
                                                            onChange={handleEditVehicleChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="form-section">
                                                <h3>Subscription Information</h3>
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label htmlFor="edit-subscription-type">Subscription Type *</label>
                                                        <select 
                                                            id="edit-subscription-type"
                                                            name="subscription.type"
                                                            value={editedVehicle.subscription.type}
                                                            onChange={handleEditVehicleChange}
                                                        >
                                                            <option value="Basic">Basic</option>
                                                            <option value="Premium">Premium</option>
                                                            <option value="Ultimate">Ultimate</option>
                                                        </select>
                                                    </div>

                                                    <div className="form-group">
                                                        <label htmlFor="edit-subscription-status">Status *</label>
                                                        <select 
                                                            id="edit-subscription-status"
                                                            name="subscription.status"
                                                            value={editedVehicle.subscription.status}
                                                            onChange={handleEditVehicleChange}
                                                        >
                                                            <option value="Active">Active</option>
                                                            <option value="Overdue">Overdue</option>
                                                            <option value="Transferred">Transferred</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label htmlFor="edit-subscription-price">Price *</label>
                                                        <input 
                                                            type="number"
                                                            id="edit-subscription-price"
                                                            name="subscription.price"
                                                            value={editedVehicle.subscription.renewalPrice}
                                                            onChange={handleEditVehicleChange}
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
                                                    onClick={() => setShowEditVehicleModal(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button type="submit" className="submit-button">
                                                    Save Changes
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {showTransferModal && selectedVehicle && (
                                <div className="modal-overlay">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h2>Transfer Subscription</h2>
                                            <button 
                                                className="close-button"
                                                onClick={() => setShowTransferModal(false)}
                                            >
                                                    &times;
                                            </button>
                                        </div>

                                        <form onSubmit={handleTransferSubmit} className="transfer-subscription-form">
                                            <div className="form-section">
                                                <h3>Source Vehicle</h3>
                                                <div className="vehicle-info">
                                                    <p><strong>{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</strong></p>
                                                    <p>License Plate: {selectedVehicle.licensePlate}</p>
                                                    <p>
                                                        Subscription: {selectedVehicle.subscription.type} - 
                                                        <span className={`status-text ${selectedVehicle.subscription.status.toLowerCase()}`}>
                                                            {selectedVehicle.subscription.status}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="form-section">
                                                <h4>Select Destination Vehicle</h4>
                                                {user.vehicles.filter(v => v.id !== selectedVehicle.id).length > 0 ? (
                                                    <div className="vehicle-list">
                                                        {user.vehicles
                                                            .filter(v => v.id !== selectedVehicle.id)
                                                            .map(vehicle => (
                                                                <label 
                                                                    key={vehicle.id}
                                                                    className={`transfer-option ${destinationVehicle && destinationVehicle.id === vehicle.id ? 'selected' : ''}`}
                                                                >
                                                                    <input 
                                                                        type="radio"
                                                                        name="destinationVehicle"
                                                                        checked={destinationVehicle && destinationVehicle.id === vehicle.id}
                                                                        onChange={() => setDestinationVehicle(vehicle)}
                                                                    />
                                                                    <div>
                                                                        <strong>{vehicle.year} {vehicle.make} {vehicle.model}</strong>
                                                                        <p>License Plate: {vehicle.licensePlate}</p>
                                                                        {vehicle.subscription && vehicle.subscription.status === 'Active' && (
                                                                            <p className="warning-text">
                                                                                Note: This vehicle already has an Active subscription that will be replaced.
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </label>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    <div className="no-vehicles-message">
                                                        <p>No other vehicles available for transfer. Please add another vehicle first using the "Add Vehicle" button.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {destinationVehicle && (
                                                <div className="form-section">
                                                    <h3>Transfer Summary</h3>
                                                    <p>
                                                        <strong>Subscription:</strong> {selectedVehicle.subscription.type} ({selectedVehicle.subscription.renewalPrice})
                                                    </p>
                                                    <p>
                                                        <strong>From:</strong> {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.licensePlate})
                                                    </p>
                                                    <p>
                                                        <strong>To:</strong> {destinationVehicle.year} {destinationVehicle.make} {destinationVehicle.model} ({destinationVehicle.licensePlate})
                                                    </p>
                                                    
                                                    {destinationVehicle.subscription && (
                                                        <div className="warning-box">
                                                            <p>
                                                            <strong>Warning:</strong> This will replace the existing
                                                            {destinationVehicle.subscription.type} subscription on the destination vehicle.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="form-actions">
                                                <button 
                                                    type="button"
                                                    className="cancel-button"
                                                    onClick={() => setShowTransferModal(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="submit-button"
                                                    disabled={!destinationVehicle || user.vehicles.filter(v => v.id !== selectedVehicle.id).length === 0}
                                                >
                                                    Transfer Subscription
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