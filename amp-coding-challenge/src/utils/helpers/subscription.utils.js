export const subscriptionPrices = {
    Basic: {
        Monthly: 9.99,
        Quarterly: 27.99,
        Annually: 99.99
    },
    Premium: {
        Monthly: 14.99,
        Quarterly: 42.99,
        Annually: 149.99
    },
    Ultimate: {
        Monthly: 19.99,
        Quarterly: 57.99,
        Annually: 199.99
    },
};

export const getSubscriptionPrice = (type, renewalPeriod) => subscriptionPrices[type]?.[renewalPeriod] || 0;