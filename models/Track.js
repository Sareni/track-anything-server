const mongoose = require('mongoose');
const { Schema } = mongoose;

const trackSchema = new Schema({
    account: String,
    application: String,
    type: String,
    value: String,
    trackDate: Date,
    curDate: {
        type: Date,
        default: () => new Date()
    },
});

mongoose.model('tracks', trackSchema);