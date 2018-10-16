"use strict";

require('dotenv').config();
const env = process.env.env;

const bodyParser = require('body-parser');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

module.exports = (app, passport, pool) => {
  /***
   * Redirect HTTP GET requests to HTTPS GET requests
   * Reject all other types of HTTP requests
   * Works behind proxy/load balancer as "x-forwarded-proto" is 
   * May need to check additional headers on certin types of proxy servers
   */
  let enforceHTTPS = () => {
    return (req, res, next) => {
      if((req.secure) || (req.headers['x-forwarded-proto'] === 'https')) {
        next();
      }
      else {
        if (req.method === 'GET') {
          let url = 'https://' + req.headers.host + req.originalUrl;
          res.redirect(301, url);
        } else {
          res.status(403).send('HTTPS Traffics Only.');
        }
      }
    };
  };

  let sess = {
    store: new pgSession({
      pool,
      tableName: 'session_admin'
    }),
    secret: process.env.cookie_secret,
    resave: false,
    rolling: true,
    saveUninitialized: false,
  };
  
  app.use(cookieParser(process.env.cookie_secret));

/***
 * Allow uploading large files/data through POST requests
 */
  app.use(bodyParser.json({limit: '50mb', extended: true}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  
  /***
   * dev is for devlopment/testing in local environment
   */
  if(env === 'dev') {
    sess.cookie = {maxAge: 600 * 60 * 1000};
  }

  /***
   * staging is for development/testing over the internet
   */
  if(env === 'staging') {
    app.set('trust proxy', 1);
    sess.cookie.secure = true;
    sess.cookie.httpOnly = true;
    sess.cookie.maxAge = 600 * 60 * 1000;
    app.use(enforceHTTPS());
    app.use(helmet());
  }

  /***
   * prod is for deploying the service in production environment
   */
  if(env === 'prod') {
    app.set('trust proxy', 1);
    sess.cookie.secure = true;
    sess.cookie.httpOnly = true;
    sess.cookie.sameSite = true;
    sess.cookie.maxAge = 10 * 60 * 1000;
    app.use(enforceHTTPS());
    app.use(helmet());
  }
  app.use(session(sess));
    
  /***
   * Error handler for Express. 
   */
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
  });

  /***
   * Enable CORS
   */
  app.use(require('cors')({
    origin: (origin, callback) => {
      return callback(null, origin);
    },
    credentials: true
  }));
        
  app.use(passport.initialize());
  app.use(passport.session());
};

