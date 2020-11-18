const redis = require('redis');

const { handleResponse } = require('../utils');
const keys = require('../config/keys');

const redisClient = redis.createClient({
    port: keys.redis_port,
    host: keys.redis_host,
    //password: keys.redis_password, // has to be configured
});

async function checkAndUpdateLastAccess(account) {
    const data = await redisClient.get(account);
    const [plan, time] = data.split(';');
    const timeNextTrackAllowed = parseInt(time) + PLAN_PROPERTIES[PLANS[plan]].msBetweenTracks;
    const now = Date.now();
    if (timeNextTrackAllowed > now) {
        throw new Error('Track not allowed yet! Upgrade Account if more tracks needed.');
    }
    await redisClient.set(account, `${plan};${now}`);
}


async function updateAccount(account, newPlan, newTime) {
    if (!account) {
        throw new Error('UpdateAccount: Account has to be set');
    }
    if (!PLANS[newPlan])

    // no need to get old data if both plan and time are changed
    if (newPlan && newTime) {
        redisClient.set(account, `${newPlan};${newTime}`);
        return;
    } else {
        const data = await redisClient.get(account);
        const [oldPlan, oldTime] = data.split(';');
        const plan = newPlan ? newPlan : oldPlan;
        const time = newTime ? newTime : oldTime;
        redisClient.set(account, `${plan};${time}`);
    }
}

// account: key of the new account
async function createAccount(account, plan) {
    if (!plan) {
        throw new Error('createAccount: Plan has to be defined');
    }
    redisClient.set(account, `${plan};0`);
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


module.exports = {
    handleNewAccount,
    handleUpdateAccount
}