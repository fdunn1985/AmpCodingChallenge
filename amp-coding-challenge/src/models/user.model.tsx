import { Timestamp } from 'firebase/firestore';
import { Vehicle } from './vehicle.model';
import { PurchaseHistory } from './purchase-history.model';

export interface User {
    id: string;
    name: string;
    email: string;
    address?: string;
    status: 'Active' | 'Overdue' | 'Inactive';
    registrationDate: Date | Timestamp;

    vehicle: Vehicle[];
    purchaseHistory: PurchaseHistory;
}