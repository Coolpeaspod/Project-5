const model = require("../models/user");
const Event = require("../models/event");
const rsvp = require("../models/rsvp");
const { connection } = require("mongoose");

exports.new = (req, res) => {
  return res.render("./user/new");
};

exports.create = (req, res, next) => {
  let user = new model(req.body);
  user
    .save()
    .then((user) => res.redirect("/users/login"))
    .catch((err) => {
      if (err.name === "ValidationError") {
        req.flash("error", err.message);
        return res.redirect("/users/new");
      }

      if (err.code === 11000) {
        req.flash("error", "Email has been used");
        return res.redirect("/users/new");
      }

      next(err);
    });
};

exports.getUserLogin = (req, res, next) => {
  return res.render("./user/login");
};

exports.login = (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;
  model
    .findOne({ email: email })
    .then((user) => {
      if (!user) {
        console.log("wrong email address");
        req.flash("error", "wrong email address");
        res.redirect("/users/login");
      } else {
        user.comparePassword(password).then((result) => {
          if (result) {
            req.session.user = user._id;
            req.flash("success", "You have successfully logged in");
            res.redirect("/users/profile");
          } else {
            req.flash("error", "wrong password");
            res.redirect("/users/login");
          }
        });
      }
    })
    .catch((err) => next(err));
};
// exports.profile = async (req, res, next) => {
//   try {
//     const userId = req.session.user;

//     // Fetch user's data
//     const user = await model.findById(userId);

//     // Fetch events created by the user
//     // const userEvents = await Event.find({ author: userId }).populate({
//     //   path: "attendees",
//     //   populate: { path: "user", model: "User" }, // Populate the user details for each RSVP
//     // });
//     rsvp
//       .find({ user: userId })
//       .populate("event", "title, topic")
//       .then((rsvps) => {
//         let userEvents = rsvps.map((rsvp) => rsvp.event);
//         res.render("./user/profile", { user, rsvps });
//       });

//     // Render the profile page with user's data and events
//     // res.render("./user/profile", { user, events: userEvents });
//   } catch (err) {
//     console.error("Error in profile controller:", err);
//     res.status(500).send("Internal Server Error");
//   }
// };
exports.profile = (req, res, next) => {
  const userId = req.session.user;

  Promise.all([
    model.findById(userId), // Fetch user's data
    Event.find({ author: userId }), // Fetch events created by the user
    rsvp.find({ user: userId }).populate("event"), // Fetch RSVPs for events the user has RSVP'd for
  ])
    .then((results) => {
      const [user, events, rsvps] = results;

      res.render("./user/profile", { user, events, rsvps });
    })
    .catch((err) => {
      console.error("Error in profile controller:", err);
      res.status(500).send("Internal Server Error");
    });
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    else res.redirect("/");
  });
};
