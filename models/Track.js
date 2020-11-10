const mongoose = require('mongoose');
const { Schema } = mongoose;

const trackSchema = new Schema({
    accountKey: String,
    applicationKey: String,
    eventType: String // TODO: enum?
});

mongoose.model('tracks', trackSchema);