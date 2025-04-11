export const determineUserStatus = (vehicles) => {
    if (!vehicles || vehicles.length === 0) return 'Inactive';

    const statuses = vehicles.map(veh => veh.subscription.status);

    if (statuses.includes('Overdue')) return 'Overdue';
    if (statuses.every(status => status === 'Active')) return 'Active';
    if (statuses.every(status => status === 'Cancelled')) return 'Inactive'

    return 'Active';
};

export const getRenewalDate = (startDate, renewalPeriod) => {
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