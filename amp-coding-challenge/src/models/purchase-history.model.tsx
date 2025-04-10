import { Timestamp } from 'firebase/firestore';

export interface PurchaseHistory {
    id: string;
    date: Date | Timestamp;
    type: string;
    description: string;
    amount: string;
    status: 'Active' | 'Overdue' | 'Cancelled' | 'Completed' | 'Failed'
}