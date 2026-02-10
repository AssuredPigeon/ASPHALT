const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'AinyTonota4',
  database: 'asphalt_base',
});

module.exports = pool.promise();
