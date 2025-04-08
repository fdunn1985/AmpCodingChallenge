import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { createNewUserDocument } from '../../../utils/firebase/firebase.utils';

import './new-user.styles.scss';

const NewUser = () => {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'Active'
    });

    const [vehicle, setVehicle] = useState({
        make: '',
        model: '',
        year: '',
        licensePlate: ''
    });

    const [subscription, setSubscription] = useState({
        type: 'Basic',
        renewalPeriod: 'Monthly'
    });

    const handleSubmit = async (event) => {
        event.preventDefault();

        const genId = uuidv4();

        const userData = {
            ...formData,
            vehicle: [vehicle],
            subscription,
            id: genId
          };
        
          try {
            await createNewUserDocument(userData);
            console.log('User successfully created in Firestore');
          } catch (error) {
            console.error('Error creating user:', error);
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
                    <h1>Create New User</h1>
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
                                <option value="Pending">Pending</option>
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
                        <button type="submit" className="submit-button">
                        Create User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default NewUser;