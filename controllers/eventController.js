const model = require("../models/event");
const flash = require("connect-flash");
const multer = require("multer");
const rsvp = require("../models/rsvp");
const Event = require("../models/event");
const mongoose = require("mongoose");

//const luxon = require('luxon');

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/uploads");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + "-" + Date.now());
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 },
// });

//GET /events: send all the events
exports.index = (req, res, next) => {
  model
    .find()
    //.lean() // simplfies the id as well, so it returns int which is not what we need
    .then((events) => {
      res.render("./event/index", { events });
      //console.log(events);
    })
    .catch((err) => {
      next(err);
    });
};

// GET /events/new
exports.new = (req, res) => {
  // res.send('send the new form');
  res.render("./event/new");
};

//POST /events
exports.create = (req, res, next) => {
  let event = new model(req.body);
  event.author = req.session.user;

  event.image = req.file ? "/uploads/" + req.file.filename : "";
  if (event) {
    console.log("working");
    console.log(event);
    console.log(req.body);
  }

  event
    .save()
    .then((event) => {
      console.log(event);
      req.flash("success", "Event created successfully");
      res.redirect("/events");
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        err.status = 400;
      }
      next(err);
    });
};

//GET /events/:id
exports.show = (req, res, next) => {
  let id = req.params.id;
  // if (!id.match(/^[0-9a-fA-F]{24}$/)) {
  //   let err = new Error("Invalid event id");
  //   err.status = 400;
  //   return next(err);
  // }
  model
    .findById(id)
    .populate("attendees")
    .populate("author", "firstName lastName")
    //.lean() //doesnt work here either
    .then((event) => {
      if (event) {
        console.log(event);
        return res.render("./event/show", { event });
      } else {
        let err = Error("Cannot find event with id " + id);
        err.status = 404;
        next(err);
      }
    })
    .catch((err) => {
      next(err);
    });
};

//GET /events/:id/edit:
exports.edit = (req, res, next) => {
  let id = req.params.id;
  // if (!id.match(/^[0-9a-fA-F]{24}$/)) {
  //   let err = new Error("Invalid event id");
  //   err.status = 400;
  //   return next(err);
  // }
  model
    .findById(id)
    .then((event) => {
      if (event) {
        const timeStampStart = event.startTime;
        const timeStampEnd = event.endTime;
        timeStampStart.setHours(timeStampStart.getHours() - 4);
        timeStampEnd.setHours(timeStampEnd.getHours() - 4);
        return res.render("./event/edit", { event });
      } else {
        let err = Error("Cannot find event with id " + id);
        err.status = 404;
        next(err);
      }
    })
    .catch((err) => {
      next(err);
    });
};

//PUT /events/:id
exports.update = (req, res, next) => {
  let event = req.body;
  let id = req.params.id;
  // if (!id.match(/^[0-9a-fA-F]{24}$/)) {
  //   let err = new Error("Invalid event id");
  //   err.status = 400;
  //   return next(err);
  // }

  model
    .findByIdAndUpdate(id, event, {
      runValidators: true,
      useFindAndModify: false,
    })
    .then((event) => {
      if (event) {
        //event.startTime = luxonDateTime;
        //event.image = event.image;
        req.flash("success", "Event updated successfully");
        return res.redirect("/events/" + id);
      }
      // else {
      //   let err = Error("Cannot find event with id " + id);
      //   err.status = 404;
      //   next(err);
      // }
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        err.status = 400;
      }
      next(err);
    });
};

//DELETE /events/:id
exports.delete = (req, res, next) => {
  let id = req.params.id;

  // First, find the event to be deleted
  model
    .findById(id)
    .then((event) => {
      if (!event) {
        // If event does not exist, return error or handle accordingly
        req.flash("error", "Event not found");
        return res.redirect("/events");
      }

      // Delete all associated RSVPs
      return rsvp.deleteMany({ event: event._id }).then(() => {
        // Once RSVPs are deleted, delete the event itself
        return model.findByIdAndDelete(id);
      });
    })
    .then(() => {
      // After successful deletion, redirect to events page with success message
      req.flash("success", "Event and associated RSVPs deleted successfully");
      return res.redirect("/events");
    })
    .catch((err) => {
      // Handle errors
      next(err);
    });
};

exports.rsvp = (req, res, next) => {
  const eventId = req.params.id;
  const status = req.body.status;
  const userId = req.session.user;

  console.log("Event ID:", eventId);
  console.log("Status:", status);
  console.log("User ID:", userId);

  if (
    !mongoose.Types.ObjectId.isValid(eventId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    console.log("Invalid user or event ID");
    return res.status(400).send("Invalid user or event ID");
  }

  // Create or update the RSVP document
  rsvp
    .findOneAndUpdate(
      { user: userId, event: eventId },
      { user: userId, event: eventId, status: status },
      { upsert: true, new: true, runValidators: true }
    )
    .then(() => {
      // Fetch the event after updating the RSVP
      return Event.findById(eventId);
    })
    .then((event) => {
      console.log("Event:", event);

      // Get the current number of attendees
      let numAttendees = event.attendees.length;

      console.log("Current Number of Attendees:", numAttendees);

      // Increment or decrement the number of attendees based on the RSVP status
      if (status === "YES") {
        numAttendees++; // Increment if user RSVP'd Yes
      } else if (status === "NO") {
        numAttendees--; // Decrement if user RSVP'd No
      }

      console.log("Updated Number of Attendees:", numAttendees);

      // Update the number of attendees in the event model
      event.attendeeCount = numAttendees;

      // Save the updated event
      return event.save();
    })
    .then(() => {
      req.flash("success", "RSVP updated successfully");
      res.redirect("/users/profile");
    })
    .catch((err) => {
      console.error("Error:", err);
      next(err);
    });
};
