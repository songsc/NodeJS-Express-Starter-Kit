'use strict';

const passport = require('passport');
const express = require('express');
const router = express.Router();

router.post('/login', passport.authenticate('local'), (req, res) => {
  const { user } = req;
  res.json(user);
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if(err) {
      console.log(err);
      return;
    }
    req.logout();
    res.Status(200).send();
  });
});

module.exports = router;