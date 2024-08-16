const express = require('express');
const { getNotification  } = require('../controllers/notification.controller');
const router = express.Router();

router.get("/all", getNotification)
// router.post("/login", loginUser)

module.exports = router;
