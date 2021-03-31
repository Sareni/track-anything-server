const dbConfig = require('../config/db');

const mysql = require('mysql');
let connection;

function init() {
    connection = mysql.createConnection({
        host: dbConfig.mysqlConfig.host,
        user: dbConfig.mysqlConfig.username,
        password: dbConfig.mysqlConfig.password,
        database: dbConfig.mysqlConfig.database,
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
    const { account, application, type, event, value } = trackingData;
    const query = 'INSERT INTO tracks SET ?';
    return new Promise((resolve) => {
        connection.query(query, {account, application, type }, function(error, results, fields) {
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