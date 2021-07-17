const mongoConfig = require('../config/track_anything_server_config').databases.mongodb;

async function init() {
    db = require('mongoose');
    require('./models/Track');
    console.log(`MongoDB connecting...`);
    try {
        await db.connect(mongoConfig.connectionString, { useNewUrlParser: true });
    } catch(error) {
        throw new Error(`initMongo: ${error}`);
    }
    console.log('MongoDB connected!')
}

async function save(trackingData) {
    const Track = db.model('tracks');

    const { account, application, type, value, trackDate } = trackingData;         
    await new Track({ account, application, type, value, track_date: trackDate }).save();
}

module.exports = {
    init,
    save,
}