const http = require('http');
const mongoose = require('mongoose');
const redis = require('redis');

const keys = require('./config/keys');
const { trackingURL, createAccountURL, updateAccountURL } = require('./config/routes');
const { host, port } = require('./config/http');
const { now } = require('mongoose');

const redisClient = redis.createClient({
    port: keys.redis_port,
    host: keys.redis_host,
    //password: keys.redis_password, // has to be configured
});

// TODO: both needed?
require('./models/Track');
const Track = mongoose.model('tracks');

const attributePropertyTable = {
    account: {
        label: 'Account',
        length: 32,
        type: 'string',
        isRequired: true
    },
    application: {
        label: 'Account',
        length: 32,
        type: 'string',
        isRequired: true
    },
    type: {
        label: 'Type',
        length: 32,
        type: 'string',
        isRequired: true
    },
    
}

const planTable = {
    basic: {
        label: 'Basic',
        msBetweenTracks: 60000 
    },
    premium: {
        label: 'Premium',
        msBetwennTracks: 1000
    }
    // TODO
}

function validateTrackingAttribute(attribute, properties) {
    const { label, length, type, isRequired} = properties;
    if (!attribute) {
        if (isRequired) {
            throw new Error(`${label} has to be defined!`);
        } else {
            return;
        }
    }
    if (typeof attribute !== type) {
        throw new Error(`${label} has to be of type ${type}`);
    }
    if (length && attribute.length > length) {
        throw new Error(`${label} has a limit of ${length} characters`);
    }
}

function validateTrackingData(data) {
    Object.entries(attributePropertyTable).forEach((entry) => {
        const [attribute, properties] = entry;
        validateTrackingAttribute(data[attribute], properties);
    });
}

// REDIS
async function checkAndUpdateLastAccess(account) {
    const data = await redisClient.get(account);
    const [plan, time] = data.split(';');
    const timeNextTrackAllowed = parseInt(time) + planTable[plan].msBetweenTracks;
    const now = Date.now();
    if (timeNextTrackAllowed > now) {
        throw new Error('Track not allowed yet! Upgrade Account if more tracks needed.');
    }
    await redisClient.set(account, `${plan};${now}`);
}

async function updateAccount(account, newPlan, newTime) {
    // TODO optimize
    const data = await redisClient.get(account);
    const [oldPlan, oldTime] = data.split(';');
    const plan = newPlan ? newPlan : oldPlan
    const time = newTime ? newTime : oldTime;
    redisClient.set(account, `${plan};${time}`);
}

// account: key of the new account
async function createAccount(account, plan) {
    redisClient.set(account, `${plan};0`);
}

async function saveTrack(trackingData) {
    validateTrackingData(trackingData);
    await checkAndUpdateLastAccess(trackingData.account);

    const { account, application, type, event, value } = trackingData;          
    const track = await new Track({ account, application, type }).save();
    return track;
}

function getRequestURI(req) {
    return `${req.connection.encrypted ? 'https' : 'http'}://${req.headers.host}${req.url}`;
}

function handleResponse(res, data) {
    res.writeHead(...data.writeHead);
    res.end(data.end);
}

function handleNewTrack(req, res) {
    let body = '';
    let responseObject;
    // check total size of Data, has to be < ~1KB
    req.on('data', (data) => {
        body += data;
    });

    req.on('end', async () => {
        try {
            await saveTrack(JSON.parse(body));
            responseObject = {
                writeHead: [200, {'Content-Type': 'text/html'}],
                end: 'Track received successfully'
            };
            
        } catch (e) {
            responseObject = {
                writeHead: [500],
                end: e
            };
        } finally  {
            handleResponse(res, responseObject);
        }
    });
}

function handleNewAccount(req, res) {
    let body = '';
    let responseObject;
    req.on('data', (data) => {
        body += data;
    });

    req.on('end', async () => {
        try {
            // add validation
            const { account, plan } = JSON.parse(body);
            await createAccount(account, plan);
            responseObject = {
                writeHead: [200, {'Content-Type': 'text/html'}],
                end: 'Account created!'
            };
            
        } catch (e) {
            responseObject = {
                writeHead: [500],
                end: JSON.stringify(e)
            };
            console.log(e);
        } finally  {
            handleResponse(res, responseObject);
        }
    });
}

function handleUpdateAccount(req, res) {
    let body = '';
    let responseObject;
    req.on('data', (data) => {
        body += data;
    });

    req.on('end', async () => {
        try {
            // add validation (plan and time optional)
            const { account, plan, time } = JSON.parse(body);
            await updateAccount(account, plan, time);
            responseObject = {
                writeHead: [200, {'Content-Type': 'text/html'}],
                end: 'Account created!'
            };
            
        } catch (e) {
            responseObject = {
                writeHead: [500],
                end: JSON.stringify(e)
            };
            console.log(e);
        } finally  {
            handleResponse(res, responseObject);
        }
    });
}

function handlePOST(req, res) {
    switch (getRequestURI(req)) {
        case trackingURL: handleNewTrack(req, res); break;
        case createAccountURL: handleNewAccount(req, res); break;
        case updateAccountURL: handleUpdateAccount(req, res); break;
    }
    return;
}

const server = http.createServer((req, res) => {
    console.log('Request');
    let resObject;
    switch (req.method) {
        case 'POST': resObject = handlePOST(req, res); break;
        default: handleResponse(res, {
                            writeHead: [200, {'Content-Type': 'text/html'}],
                            end: 'TrackAnything Server'
                        }); break;
    }
});

mongoose.connect(keys.mongodbConnectionString, { useNewUrlParser: true });
console.log(`MongoDB connecting...`);
server.listen(port, host);
console.log(`Tracking Server listening at http://${host}:${port}`);