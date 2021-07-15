const redis = require('redis');
const { promisify } = require("util");
const axios = require('axios');

const {
    databases: databaseConfigs,
    tracking: trackingConfig,
    accountManagementServer: amsConfig
} = require('./config/track_anything_server_config');

const { redis: redisConfig } = databaseConfigs;
const accessManagementServerURL = `http://${amsConfig.host}:${amsConfig.port}`;

const redisClient = redis.createClient({
    port: redisConfig.port,
    host: redisConfig.host,
    password: redisConfig.password,
});

const redisGetAsync = promisify(redisClient.get).bind(redisClient);
const redisSetAsync = promisify(redisClient.set).bind(redisClient);

let globalAccessList; // has to be initialized on server start up

let localTrackingList = {}
let localTrackingCount = 0;


async function initGlobalAccessList() {
    try {
        const response = await axios.get(accessManagementServerURL + '/fullList');
        globalAccessList = response.data;
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
    if (!globalAccessList[account]) {
        throw new Error('account has no access or not found');
    }
}


async function checkAndUpdateLocalAccessList(account) {
    const now = Date.now();
    const data = await redisGetAsync(account);
    if (data) {
        const timeNextTrackAllowed = parseInt(data) + trackingConfig.trackingTimeout;
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

    if (localTrackingCount >= trackingConfig.trackingCount) {
        sendTrackingList();
    }
}

function sendTrackingList() {
    // TODO: race condition?
    axios.post(accessManagementServerURL + '/trackingList', localTrackingList)
         .catch(function (error) {
            console.log(error);
         });
    trackingAccessList = {};
    localTrackingCount = 0;
}

module.exports = {
    checkAndUpdateLocalAccessList,
    checkGlobalAccessList,
    initGlobalAccessList,
    updateGlobalAccessList
}
