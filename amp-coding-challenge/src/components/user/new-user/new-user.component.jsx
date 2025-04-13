import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

import { createNewUserDocument, createNewRecentActivityDocument } from '../../../utils/firebase/firebase.utils';
import { getRenewalDate } from '../../../utils/helpers/user-helpers.utils';
import {subscriptionPrices } from '../../../utils/helpers/subscription.utils';

import './new-user.styles.scss';

const defaultFormDataFields = {
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active'
}

const defaultVehicleFields = {
    make: '',
    model: '',
    year: '',
    licensePlate: ''
}

const defaultSubscriptionFields = {
    type: 'Basic',
    renewalPeriod: 'Monthly'
}

const NewUser = () => {

    const [formData, setFormData] = useState(defaultFormDataFields);

    const [vehicle, setVehicle] = useState(defaultVehicleFields);

    const [subscription, setSubscription] = useState(defaultSubscriptionFields);

    const [isUserCreatedSuccess, setIsUserCreatedSuccess] = useState(false);

    const resetFormFields = () => {
        setFormData(defaultFormDataFields);
        setVehicle(defaultVehicleFields);
        setSubscription(defaultSubscriptionFields);
    }

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const userId = uuidv4();
        const purchaseId = uuidv4();
        const vehicleId = uuidv4();
        const activityId = uuidv4();

        const currentDate = new Date();

        const purchaseHistory = {
            id: purchaseId,
            date: currentDate,
            type: 'Subscription',
            description: `${subscription.type} ${subscription.renewalPeriod} Subscription`,
            amount: subscriptionPrices[subscription.type][subscription.renewalPeriod],
            status: 'Active'
        };

        const userData = {
            ...formData,
            vehicles: [
                {
                    ...vehicle,
                    id: vehicleId,
                    subscription: {
                        ...subscription,
                        startDate: currentDate,
                        renewalDate: getRenewalDate(currentDate, subscription.renewalPeriod),
                        renewalPrice: subscriptionPrices[subscription.type][subscription.renewalPeriod],
                        status: 'Active'
                    }
                }],
            id: userId,
            registrationDate: currentDate,
            purchaseHistory: [purchaseHistory]
        };

        const recentActivityData = {
            id: activityId,
            userId: userId,
            userName: userData.name,
            timestamp: currentDate,
            action: "New User"
        };
        
        try {
            await createNewUserDocument(userData);
            await createNewRecentActivityDocument(recentActivityData);
            setIsUserCreatedSuccess(true);
            resetFormFields();
        } catch (error) {
            console.error('Error creating user:', error);
        } finally {
            const action = event.nativeEvent.submitter?.value;
            if (action === 'saveAndRedirect') {
                navigate(`/userDetail/${userId}`);
            }
        }
    };

    const handleInputChange = (event) => {
        const { name, value} = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleVehicleChange = (e) => {
        const { name, value } = e.target;
        setVehicle({
            ...vehicle,
            [name]: value
        });
    };
      
    const handleSubscriptionChange = (e) => {
        const { name, value } = e.target;
        setSubscription({
            ...subscription,
            [name]: value
        });
    };

    return (
        <div className="new-user-container">
            <div className="new-user-content">
                <div className="new-user-header">
                    <div className="top-header">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            &larr; Back
                        </button>
                    </div>
                    <div className="bottom-header">
                        <h1>Create New User</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="new-user-form">
                    <div className="form-section">
                        <h2>Account Information</h2>

                        <div className="form-group">
                            <label htmlFor="name">Full Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                            
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number *</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                            
                        <div className="form-group">
                            <label htmlFor="address">Address</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="status">Account Status</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                            >
                                <option value="Active">Active</option>
                                <option value="Overdue">Overdue</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Vehicle & Subscription</h2>
            
                        <div className="form-subsection">
                            <h3>Vehicle Information</h3>
                            
                            <div className="form-row">
                                <div className="form-group">
                                <label htmlFor="make">Make *</label>
                                <input
                                    type="text"
                                    id="make"
                                    name="make"
                                    value={vehicle.make}
                                    onChange={handleVehicleChange}
                                    required
                                />
                                </div>
                                
                                <div className="form-group">
                                <label htmlFor="model">Model *</label>
                                <input
                                    type="text"
                                    id="model"
                                    name="model"
                                    value={vehicle.model}
                                    onChange={handleVehicleChange}
                                    required
                                />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                <label htmlFor="year">Year *</label>
                                <input
                                    type="text"
                                    id="year"
                                    name="year"
                                    value={vehicle.year}
                                    onChange={handleVehicleChange}
                                    required
                                />
                                </div>
                                
                                <div className="form-group">
                                <label htmlFor="licensePlate">License Plate *</label>
                                <input
                                    type="text"
                                    id="licensePlate"
                                    name="licensePlate"
                                    value={vehicle.licensePlate}
                                    onChange={handleVehicleChange}
                                    required
                                />
                                </div>
                            </div>
                        </div>
                
                        <div className="form-section">
                            <h3>Subscription Information</h3>
                            
                            <div className="form-row">
                                <div className="form-group">
                                <label htmlFor="type">Subscription Type *</label>
                                <select
                                    id="type"
                                    name="type"
                                    value={subscription.type}
                                    onChange={handleSubscriptionChange}
                                >
                                    <option value="Basic">Basic</option>
                                    <option value="Premium">Premium</option>
                                    <option value="Ultimate">Ultimate</option>
                                </select>
                                </div>
                                
                                <div className="form-group">
                                <label htmlFor="renewalPeriod">Renewal Period *</label>
                                <select
                                    id="renewalPeriod"
                                    name="renewalPeriod"
                                    value={subscription.renewalPeriod}
                                    onChange={handleSubscriptionChange}
                                >
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Annually">Annually</option>
                                </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-actions">
                        <div className="left-actions">
                            <button type="button" className="cancel-button" onClick={() => navigate(-1)}>
                                Cancel
                            </button>
                        </div>
                        <div className="right-actions">
                            <button type="submit" className="submit-button" name="action" value="save">
                            Save
                            </button>
                            <button type="submit" className="submit-view-button" name="action" value="saveAndRedirect">
                            Save & View
                            </button>
                        </div>
                    </div>
                    {isUserCreatedSuccess && (
                        <>
                            <div className="success-message">
                                <span>User created successfully!</span>
                            </div>
                        </>
                    )}
                    
                </form>
            </div>
        </div>
    )
}

export default NewUser;