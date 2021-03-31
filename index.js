const express = require('express');
const schedule = require('node-schedule');
const bodyParser = require('body-parser');

const dbAdapter = require('./databaseUtils/adapter');
const { port } = require('./config/http');
const { initGlobalAccessList } = require('./access');
const app = express();

app.use(bodyParser.json());
require('./routes')(app);

async function initServer() {
    await initGlobalAccessList();    
    await dbAdapter.init();
    app.listen(port);
    console.log(`Tracking Server listening on Port ${port}.`);
}

// start server
(async () => {
    try {
        await initServer();
        console.log('Server initialized!');
    } catch (err) {
      console.log('error: ' + err)
    }
  })();

  // run initGlobalAccessList every day at 4:05 AM
schedule.scheduleJob('5 4 * * *', () => {
    initGlobalAccessList(); // await is not needed
  });

