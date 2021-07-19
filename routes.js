const { saveTrack } = require('./tracking');
const { updateGlobalAccessList } = require('./access');

module.exports = (app) => {
    app.get('/', async (req, res) => {
        const {account, application, type, value, trackDate } = req.query;
        const params = {
            account,
            application,
            type,
            value,
            trackDate, // TODO mongodb probably cannot use iso date string
        };
        try {
            await saveTrack(params);
            res.send('Track saved successfully!');
        } catch(error) {
            res.status(500).send(`Error - Saving Track: ${error}`);
        }
    });

    app.post('/', async (req, res) => {
        try {
            await saveTrack(req.body);
            res.send('Track saved successfully!');
        } catch(error) {
            res.status(500).send(`Error - Saving Track: ${error}`);
        }
    });

    app.post('/updateGlobalAccessList', (req, res) => {
        try {
            updateGlobalAccessList(req.body);
            res.send('Updating Global Access List was successful!');
        } catch(error) {
            console.log(`updateGlobalAccessList: ${error}`);
            res.status(500).send(`Error - Updating Global Access List: ${error}`);
        }
    });
}