"use strict";

require('dotenv').config();

const pg = require('pg');
const fs = require('fs');

let dbConfig = {
  user: process.env.postgre_user,
  password: process.env.postgre_pwd,
  database: process.env.postgre_db,
  host: process.env.postgre_host,
  port: process.env.postgre_port,
  max: 2,
  ssl : {
    rejectUnauthorized : false,
    ca: fs.readFileSync(process.env.ca_file).toString(),
    key: fs.readFileSync(process.env.key_file).toString(),
    cert: fs.readFileSync(process.env.cert_file).toString(),
  }
};

const pool = new pg.Pool(dbConfig);
pool.on('error', (err) => {
  console.log(err);
});

module.exports = {
  pool,
  query: (text, params, callback) => {
    console.log('DB: ', text, params);
    return pool.query(text, params, callback);
  }
};
