const ATTRIBUTES = Object.freeze({
    ACCOUNT: 'account',
    APPLICATION: 'application',
    TYPE: 'type'
});

const PLANS = Object.freeze({
    BASIC: 'basic',
    STANDARD: 'standard',
    PREMIUM: 'premium'
});

const ATTRIBUTE_PROPERTIES = Object.freeze({
    account: Object.freeze({
        label: 'Account',
        length: 32,
        type: 'string',
        isRequired: true
    }),
    application: Object.freeze({
        label: 'Application',
        length: 32,
        type: 'string',
        isRequired: true
    }),
    type: Object.freeze({
        label: 'Type',
        length: 32,
        type: 'string',
        isRequired: true
    }),
    
});


const PLAN_PROPERTIES = {
    basic: {
        label: 'Basic',
        msBetweenTracks: 60000 
    },
    standard: {
        label: 'Standard',
        msBetweenTracks: 10000 
    },
    premium: {
        label: 'Premium',
        msBetwennTracks: 1000
    }
}

module.exports = {
    ATTRIBUTES,
    ATTRIBUTE_PROPERTIES,
    PLANS,
    PLAN_PROPERTIES
}