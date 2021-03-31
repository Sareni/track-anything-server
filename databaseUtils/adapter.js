const dbConfig = require('../config/db');
const mongodb = require('./mongodb');
const mysql = require('./mysql');

const ADAPTER_STATUSES = {
    NOT_INITIALIZED: 'notInitialized',
    NOT_READY: 'notReady',
    READY: 'ready',
}

let status = ADAPTER_STATUSES.NOT_INITIALIZED;

async function init() {
    status = ADAPTER_STATUSES.NOT_READY;
    try {
        switch(dbConfig.databaseToUse) {
            case dbConfig.AVAILABELE_DATABASES.MONGODB: await mongodb.init(); break;
            case dbConfig.AVAILABELE_DATABASES.MYSQL: await mysql.init(); break;
            default: throw new Error('init: Database not defined!');
        }
    } catch(error) {
        console.log(`init: ${error}`);
        return;
    }
    status = ADAPTER_STATUSES.READY;
}

async function saveTrack(trackingData) {
    if(status !== ADAPTER_STATUSES.READY) {
        throw new Error('saveTrack: DB not ready!');
    }
    switch(dbConfig.databaseToUse) {
        case dbConfig.AVAILABELE_DATABASES.MONGODB: await mongodb.save(trackingData); break;
        case dbConfig.AVAILABELE_DATABASES.MYSQL: await mysql.save(trackingData); break;
        default: throw new Error('saveTrack: Database not defined!');
    }
}

module.exports = {
    init,
    saveTrack
}