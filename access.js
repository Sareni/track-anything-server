const redis = require('redis');
const { promisify } = require("util");

const routes = require('./config/routes');
const keys = require('./config/keys');

const redisClient = redis.createClient({
    port: keys.redis_port,
    host: keys.redis_host,
    password: keys.redis_password,
});

const redisGetAsync = promisify(redisClient.get).bind(redisClient);
const redisSetAsync = promisify(redisClient.set).bind(redisClient);

let globalAccessList; // has to be initialized on server start up

let localTrackingList = {}
let localTrackingCount = 0;


async function initGlobalAccessList() {
    try {
        globalAccessList = await axios.get(routes.accessManagementServerURL + '/fullList');
    } catch (e) {
        console.log(e);
    }
}

function updateGlobalAccessList(data) {
    // update local copy of global account list (create, upgrade, delete user etc., user ran out of tracks, ...)
    Object.entries(data).forEach((entry) => {
        const [key, value] = entry; // TODO shorten entry
        globalAccessList[key] = value;
    });
}


function checkGlobalAccessList(account) {
    // check in local copy of the global access list if tracking is allowed for the account
    return globalAccessList[account];
}


async function checkAndUpdateLocalAccessList(account) {
    const data = await redisGetAsync(account);
    if (data) {
        const timeNextTrackAllowed = parseInt(data) + serverConfig.trackingTimeout;
        const now = Date.now();
        if (timeNextTrackAllowed > now) {
            throw new Error('Track not allowed yet! Upgrade Account to Business if more tracks are needed.');
        }
    }
    await redisSetAsync(account, `${now}`);

    updateLocalTrackingList(account);
}

function updateLocalTrackingList(account) {
    // update local list with the account
    if (localTrackingList[account]) {
        localTrackingList[account] += 1;
    } else {
        localTrackingList[account] = 1;
    }
    localTrackingCount += 1;

    if (localTrackingCount >= 10) {
        sendTrackingList();
    }
}

function sendTrackingList() {
    // TODO: race condition?
    axios.post(routes.accessManagementServerURL + '/trackingList', localTrackingList)
         .catch(function (error) {
            console.log(error);
         });
    trackingAccessList = {};
    trackCount = 0;
}

module.exports = {
    checkAndUpdateLocalAccessList,
    checkGlobalAccessList,
    initGlobalAccessList,
    updateGlobalAccessList
}
