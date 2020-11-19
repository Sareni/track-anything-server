
const mongoose = require('mongoose');

const { checkAndUpdateLastAccess } = require('./account');
const { ATTRIBUTES, ATTRIBUTE_PROPERTIES, PLANS, PLAN_PROPERTIES } = require('../constants/constants');
const { handleResponse } = require('../utils');

const Track = mongoose.model('tracks');


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
    await checkAndUpdateLastAccess(trackingData.account);

    const { account, application, type, event, value } = trackingData;          
    const track = await new Track({ account, application, type }).save();
    return track;
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
                end: e.toString()
            };
        } finally  {
            handleResponse(res, responseObject);
        }
    });
}

module.exports = {
    handleNewTrack
}
