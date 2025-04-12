import React from "react";

const StatsCard = ({header, value}) => {

    return (
        <div className="stats-card">
            <h3>{header}</h3>
            <p>{value}</p>
        </div>
    );
}

export default StatsCard;