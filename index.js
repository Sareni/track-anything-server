const http = require('http');
const mongoose = require('mongoose');

require('./models/Track');
const keys = require('./config/keys');
const { trackingURL, createAccountURL, updateAccountURL } = require('./config/routes');
const { host, port } = require('./config/http');
const { getRequestURI, handleResponse } = require('./utils');
const { handleNewTrack } = require('./routes/tracking');
const { handleNewAccount, handleUpdateAccount } = require('./routes/account');



function handlePOST(req, res) {
    switch (getRequestURI(req)) {
        case trackingURL: handleNewTrack(req, res); break;
        case createAccountURL: handleNewAccount(req, res); break;
        case updateAccountURL: handleUpdateAccount(req, res); break;
    }
    return;
}

const server = http.createServer((req, res) => {
    switch (req.method) {
        case 'POST': handlePOST(req, res); break;
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