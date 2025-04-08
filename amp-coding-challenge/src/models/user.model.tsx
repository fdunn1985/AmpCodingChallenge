import { Vehicle } from './vehicle.model';

export interface User {
    id: string;
    name: string;
    email: string;
    address?: string;
    status: 'Active' | 'Pending' | 'Inactive';

    vehicle: Vehicle[];
    subscription: {
        type: 'Basic' | 'Premium' | 'Ultimate';
        renewalPeriod: 'Monthly' | 'Quarterly' | 'Annually';
    }
}