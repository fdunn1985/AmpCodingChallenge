export interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: string;
    licensePlate: string;
    subscription: {
        type: 'Basic' | 'Premium' | 'Ultimate';
        renewalPeriod: 'Monthly' | 'Quarterly' | 'Annually';
    }
}