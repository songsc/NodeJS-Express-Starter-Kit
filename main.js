"use strict";

require('dotenv').config();

const express = require('express');
const passport = require('passport');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;

require('./config/passport')(passport, db);
require('./config/express')(app, passport, db.pool);
require('./router/router')(app);

app.listen(PORT, () => {
  console.log('Server is listening on port ' + PORT + '.');
});

