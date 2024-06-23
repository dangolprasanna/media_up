const express = require('express');
const { followUser, unfollowUser, getUser } = require('../controllers/user.controller');
const router = express.Router();

router.post("/follow", followUser)
router.post("/unfollow", unfollowUser)
router.get("/:id", getUser)

module.exports = router;