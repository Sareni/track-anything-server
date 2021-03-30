db = require('mysql');

let connection;
let connected = false;

function init() {
    connection = db.createConnection({
        host: require('./config/keys').mysqlHost,
        user: require('./config/keys').mysqlUsername,
        password: require('./config/keys').mysqlPassword
      });

    
      connection.connect(function(err) {
        if (err) throw err;
        connected = true;
    });
}

function getConnection() {
    if (connected) {
        return connection;
    }
    else {
        return null;
    }
}

module.exports = {
    init,
    getConnection,
}