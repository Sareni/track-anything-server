const mysqlConfig = require('../config/track_anything_server_config').databases.mysql;

const mysql = require('mysql');
let connection;

function init() {
    connection = mysql.createConnection({
        host: mysqlConfig.host,
        user: mysqlConfig.username,
        password: mysqlConfig.password,
        database: mysqlConfig.database,
      });
      console.log('MySQL connecting...');

      return new Promise((resolve) => {
        connection.connect((err) => {
            if (err) throw err;
            console.log('MySQL connected!');
            resolve();
        });
      }); 
}

function save(trackingData) {
    const { account, application, type, event, value, trackDate } = trackingData;
    const query = 'INSERT INTO tracks SET ?';
    return new Promise((resolve) => {
        connection.query(query, {account, application, type, value, track_date: trackDate.toISOString().slice(0, 19).replace('T', ' ') }, function(error, results, fields) {
            if(error) {
                console.log(error);
                throw error;
            }
            resolve();
        });
    });    
}

module.exports = {
    init,
    save,
}