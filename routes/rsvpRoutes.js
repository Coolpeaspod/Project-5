const express = require("express");
const controller = require("../controllers/rsvpController");
const { isLoggedIn, isAuthor } = require("../middlewares/auth");
const { validateId, validateEvent, validateResult } = require("../middlewares/validator");

const router = express.Router();

// 
router.get('/')

module.exports = router;