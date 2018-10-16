"use strict";

let checkAuth = (req, res, next) => {
  if(req.isAuthenticated()) {
    next();
  } 
  else {
    res.status(401).send('Unauthorized.');
  }
};

module.exports = (app) => {
  app.use('/api/public', require('./public.js'));
  app.use('/api/protected', checkAuth, require('./protected.js'));
};
