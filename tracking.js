const databaseToUse = require('./config/keys').databaseName;

let connection;
let db;

if (databaseToUse === 'MongoDB') {
    db = require('mongoose');
  } else if (databaseToUse === 'MySQL') {
    connection = require('./mysql_lib').getConnection();
  }
  

const { ATTRIBUTES, ATTRIBUTE_PROPERTIES, PLANS, PLAN_PROPERTIES } = require('./constants/constants');
const keys = require('./config/keys');
const { checkGlobalAccessList, checkAndUpdateLocalAccessList } = require('./access');


function saveTrackMongoDB(trackingData) {
    const Track = db.model('tracks');

    const { account, application, type, event, value } = trackingData;         
    const track = await new Track({ account, application, type }).save(); 
    return track;
}

function saveTrackMySQL(trackingData) {
    
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
    Object.entries(ATTRIBUTE_PROPERTIES).forEach((entry) => {
        const [attribute, properties] = entry;
        validateTrackingAttribute(data[attribute], properties);
    });
}

async function saveTrack(trackingData) {
    validateTrackingData(trackingData);
    checkGlobalAccessList(trackingData.account);
    await checkAndUpdateLocalAccessList(trackingData.account);

    let track;
    if (databaseToUse === 'MongoDB') {
        track = saveTrackMongoDB(trackingData);
      } else if (databaseToUse === 'MySQL') {
        track = saveTrackMySQL(trackingData);
      }
    return track;
}

module.exports = {
    saveTrack
}
