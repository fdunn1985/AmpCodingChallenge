import React from "react";

const VehicleCard = ({vehicle, onEdit, onTransfer, onCancel}) => {

    return (
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
                <button className="edit-vehicle-button" onClick={onEdit}>Edit Vehicle</button>
                <button className="transfer-subscription-button" onClick={onTransfer}>Transfer Subscription</button>
                <button className="cancel-subscription-button" onClick={onCancel}>Cancel Subscription</button>
            </div>
        </div>
    );
}

export default VehicleCard;