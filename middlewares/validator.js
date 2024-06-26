const Event = require("../models/event");
const { body } = require("express-validator");
const { validationResult } = require("express-validator");
const luxon = require("luxon");
let startTimeGlobal;

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

exports.validateSignUp = [
  body("firstName", "First name cannot be empty.").notEmpty().trim().escape(),
  body("lastName", "Last name cannot be empty.").notEmpty().trim().escape(),
  body("email", "Email must valid email address.")
    .isEmail()
    .trim()
    .escape()
    .normalizeEmail(),
  body(
    "password",
    "Password must be atleast 8 characters and atmost 64 characters."
  ).isLength({ min: 8, max: 64 }),
];

exports.validateLogin = [
  body("email", "Email must valid email address.")
    .isEmail()
    .trim()
    .escape()
    .normalizeEmail(),
  body(
    "password",
    "Password must be atleast 8 characters and atmost 64 characters."
  ).isLength({ min: 8, max: 64 }),
];

exports.validateEvent = [
  body("title", "Title cannot be empty.").notEmpty().trim().escape(),
  body("description", "Description must be at least 10 characters.")
    .isLength({ min: 10 })
    .trim()
    .escape(),
  body("location", "Location cannot be empty.").notEmpty().trim().escape(),
  body("startTime", "Start time cannot be empty.")
    .notEmpty()
    .trim()
    .escape()
    .custom((value) => {
      const startTime = luxon.DateTime.fromISO(value);
      startTimeGlobal = startTime;
      const now = luxon.DateTime.now();
      if (startTime <= now) {
        throw new Error("Start time must be in future.");
      }
      return true;
    }),

  body("endTime", "End time cannot be empty.")
    .notEmpty()
    .trim()
    .escape()
    .custom((value) => {
      const endTime = luxon.DateTime.fromISO(value);
      if (endTime <= startTimeGlobal) {
        throw new Error("End time has to be after start time");
      }
      return true;
    }),
  body("topic", "Invalid topic.").isIn([
    "Education",
    "Fun",
    "Other",
    "Free Stuff",
    "Expos",
  ]),
  //body('image', 'Image cannot be empty.').notEmpty()
];

exports.validateResult = (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach((error) => {
      req.flash("error", error.msg);
    });
    return res.redirect("back");
  } else {
    return next();
  }
};
exports.validateRsvp = [
  body("status", "Invalid status.")
    .isIn(["YES", "NO", "MAYBE"])
    .trim()
    .escape(),
];
