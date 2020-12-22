const mongoose = require('mongoose');
const { Schema } = mongoose;

const trackSchema = new Schema({
    account: String,
    application: String,
    type: String // TODO: enum?
});

mongoose.model('tracks', trackSchema);