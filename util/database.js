const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'NodeJs',
    user: 'root',
    database: 'node-complete',
    password: 'Douglous3'
})

module.exports = pool.promise()

