const { trackingURL, updateGlobalAccessListURL } = require('./config/routes');
const { getRequestURI, handleResponse } = require('./utils');
const { saveTrack } = require('./tracking');
const { updateGlobalAccessList } = require('./access');


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

function handleUpdateGlobalAccessList(req, res) {
    let body = '';
    let responseObject;
    req.on('data', (data) => {
        body += data;
    });

    req.on('end', () => {
        try {
            updateGlobalAccessList(body);
            responseObject = {
                writeHead: [200, {'Content-Type': 'text/html'}],
                end: 'Update Global Access List Successful'
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


function handlePOST(req, res) {
    switch (getRequestURI(req)) {
        case trackingURL: handleNewTrack(req, res); break;
        case updateGlobalAccessListURL: handleUpdateGlobalAccessList(req, res); break;
    }
    return;
}

module.exports = {
    handlePOST
}
