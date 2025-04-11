export const determineUserStatus = (vehicles) => {
    if (!vehicles || vehicles.length === 0) return 'Inactive';

    const statuses = vehicles.map(veh => veh.subscription.status);

    if (statuses.includes('Overdue')) return 'Overdue';
    if (statuses.every(status => status === 'Active')) return 'Active';
    if (statuses.every(status => status === 'Cancelled')) return 'Inactive'

    return 'Active';
};