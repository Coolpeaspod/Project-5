const Event = require("../models/event");
const { body } = require('express-validator');
const { validationResult } = require('express-validator');

exports.validateId = (req, res, next) => {
  let id = req.params.id;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    let err = new Error("Invalid event id");
    err.status = 400;
    return next(err);
  } else {
    next();
  }
};

exports.validateSignUp = [body('firstName', 'First name cannot be empty.').notEmpty().trim().escape(),
body('lastName', 'Last name cannot be empty.').notEmpty().trim().escape(),
body('email', 'Email must valid email address.').isEmail().trim().escape().normalizeEmail(),
body('password', "Password must be atleast 8 characters and atmost 64 characters.").isLength({ min: 8, max: 64 })];

exports.validateLogin = [body('email', 'Email must valid email address.').isEmail().trim().escape().normalizeEmail(),
body('password', "Password must be atleast 8 characters and atmost 64 characters.").isLength({ min: 8, max: 64 })];

exports.validateEvent = [body('title', 'Title cannot be empty.').notEmpty().trim().escape(),
body('description', "Description must be at least 10 characters.").isLength({ min: 10 }).trim().escape(),
body('location', 'Location cannot be empty.').notEmpty().trim().escape(),
body('startTime', 'Start time cannot be empty.').notEmpty().trim().escape(),
body('endTime', 'End time cannot be empty.').notEmpty().trim().escape(),
body('topic', 'Invalid topic.').isIn(["Education", "Fun", "Other", "Free Stuff", "Expos"]),
  //body('image', 'Image cannot be empty.').notEmpty()
];

exports.validateResult = (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach(error => {
      req.flash('error', error.msg);
    });
    return res.redirect('back');
  }
  else {
    return next();
  }
};