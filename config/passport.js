"use strict";

const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

module.exports = (passport, db) => {
  passport.use(new LocalStrategy((username, password, callback) => {
    db.query('SELECT username, password, type FROM users_admin WHERE username=$1', [username], (err, result) => {
      if(err) {
        console.log(err);
        return callback(err);
      }

      if(result.rows.length > 0) {              
        const first = result.rows[0];
        bcrypt.compare(password, first.password, (err, res) => {
          if(err) {
            console.log(err);
            return callback(err);
          }
          if(res) {
            return callback(null, {username: first.username, type: first.type});
          } 
          else {
            return callback(null, false);
          }
        });
      }
      else {
	      return callback(null, false);
      }
	  });
  }));

  passport.serializeUser((user, callback) => {
    return callback(null, user.username);
  });

  passport.deserializeUser((username, callback) => {
    db.query('SELECT username, type FROM users_admin WHERE username = $1', [username], (err, results) => {
      if(err) {
        console.log(err);
        return callback(err);
      }

      return callback(null, results.rows[0]);
    });
  });
};


