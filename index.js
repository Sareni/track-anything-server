const http = require('http');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const trackingURL = require('./config/routes').trackingURL;
const { host, port } = require('./config/http');

// TODO: both needed?
require('./models/Track');
const Track = mongoose.model('tracks');

const server = http.createServer((req, res) => {
    const fullRequestURI = `${req.connection.encrypted ? 'https' : 'http'}://${req.headers.host}${req.url}`;
    if(fullRequestURI === trackingURL && req.method == 'POST') {
        let body = '';
        req.on('data', (data) => {
            body += data;
        });

        req.on('end', async () => {
            try {
                const { accountKey, applicationKey, eventType } = JSON.parse(body);
                const track = await new Track({ accountKey, applicationKey, eventType }).save();
            } catch (e) {
                res.writeHead(500);
                res.end(e);
            }
            
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('Track received successfully');
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