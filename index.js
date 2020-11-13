const http = require('http');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const trackingURL = require('./config/routes').trackingURL;
const { host, port } = require('./config/http');

// TODO: both needed?
require('./models/Track');
const Track = mongoose.model('tracks');

const attributePropertyTable = {
    account: {
        label: 'Account',
        size: 32,
        type: 'string',
        isRequired: true
    },
}

function validateTrackingAttribute(attribute, name) {
    const { size } = attributePropertyTable[name];
    const { type } = attributePropertyTable[name];

    if (!attribute) {
        throw new Error(`${name} has to be defined!`);
    }
    if (typeof attribute !== type) {
        throw new Error(`${name} has to be of type ${type}`);
    }
    if (size && attribute.length > size) {
        throw new Error(`Account has a limit of 32 characters`);
    }
}

function validateTrackingData(data) {
    Object.entries(attributePropertyTable).forEach(({ label }) => { // !!

    });
}

async function saveTrack(trackingData) {
    validateTrackingData(trackingData);

    const { account, application, typ, event, value } = trackingData;          
    const track = await new Track({ accountKey, applicationKey, eventType }).save();
    return track;
}

const server = http.createServer((req, res) => {
    const fullRequestURI = `${req.connection.encrypted ? 'https' : 'http'}://${req.headers.host}${req.url}`;
    if(fullRequestURI === trackingURL && req.method == 'POST') {
        let body = '';
        // check total size of Data, has to be < ~1KB
        req.on('data', (data) => {
            body += data;
        });

        req.on('end', async () => {
            try {
                await saveTrack(JSON.parse(body));

                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end('Track received successfully');
            } catch (e) {
                res.writeHead(500);
                res.end(e);
            }
        });
    } else {
        console.log(fullRequestURI);
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('Tracking Server');
    }
});

mongoose.connect(keys.mongodbConnectionString, { useNewUrlParser: true });
console.log(`MongoDB connecting...`);
server.listen(port, host);
console.log(`Tracking Server listening at http://${host}:${port}`);