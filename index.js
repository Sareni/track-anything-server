const http = require('http');
const mongoose = require('mongoose');
require('./models/Track');

const { mongodbConnectionString } = require('./config/keys');
const { host, port } = require('./config/http');
const { handleResponse } = require('./utils');
const { handlePOST } = require('./routing');
const { initGlobalAccessList } = require('./access');



async function initServer() {
    await initGlobalAccessList();
    const server = http.createServer((req, res) => {
        switch (req.method) {
            case 'POST': handlePOST(req, res); break;
            default: handleResponse(res, {
                                writeHead: [200, {'Content-Type': 'text/html'}],
                                end: 'TrackAnything Server'
                            }); break;
        }
    });
    
    mongoose.connect(mongodbConnectionString, { useNewUrlParser: true });
    console.log(`MongoDB connecting...`);
    server.listen(port, host);
    console.log(`Tracking Server listening at http://${host}:${port}`);
}


(async () => {
    try {
        await initServer();
    } catch (err) {
      console.log('error: ' + err)
    }
  })()
console.log('server initialized');

