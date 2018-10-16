'use strict';

const express = require('express');
const router = express.Router();

router.get('/ping', (req, res) => {
  res.json(req.user);
});

module.exports = router;