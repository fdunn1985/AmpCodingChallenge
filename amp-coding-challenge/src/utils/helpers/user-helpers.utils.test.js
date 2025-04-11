import { determineUserStatus } from './user-helpers.utils';

describe('determineUserStatus', () => {
    it('returns Inactive for no vehicles', () => {
        expect(determineUserStatus([])).toBe('Inactive');
    });

    it('returns Overdue if any vehicle is Overdue', () => {
        const vehicles = [
        { subscription: { status: 'Active' } },
        { subscription: { status: 'Overdue' } }
        ];
        expect(determineUserStatus(vehicles)).toBe('Overdue');
    });

    it('returns Active if all vehicles are Active', () => {
        const vehicles = [
        { subscription: { status: 'Active' } },
        { subscription: { status: 'Active' } }
        ];
        expect(determineUserStatus(vehicles)).toBe('Active');
    });

    it('returns Inactive if all vehicles are Cancelled', () => {
        const vehicles = [
        { subscription: { status: 'Cancelled' } },
        { subscription: { status: 'Cancelled' } }
        ];
        expect(determineUserStatus(vehicles)).toBe('Inactive');
    });
});