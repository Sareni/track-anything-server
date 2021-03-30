const databaseToUse = require('./config/keys').databaseName;


const http = require('http');
const schedule = require('node-schedule');
const mysql_lib = require('./mysql_lib');

let db;
let connectionParams = {};
let connection;
if (databaseToUse === 'MongoDB') {
  db = require('mongoose');
  require('./models/Track');

  connectionParams['connectionString'] = require('./config/keys').mongodbConnectionString;
}



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
    
    if (databaseToUse === 'MongoDB') {
      db.connect(connectionParams.connectionString, { useNewUrlParser: true });
      console.log(`MongoDB connecting...`);
    } else if (databaseToUse === 'MySQL') {
      mysql_lib.init();
    }
    
    
    server.listen(port, host);
    console.log(`Tracking Server listening at http://${host}:${port}`);
}


(async () => {
    try {
        await initServer();
        console.log('server initialized');
    } catch (err) {
      console.log('error: ' + err)
    }
  })();

  // run at 4:05 AM
schedule.scheduleJob('5 4 * * *', () => {
    initGlobalAccessList(); // await is not needed
  });

