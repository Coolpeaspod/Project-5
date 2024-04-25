const mongoose = require("mongoose");

const rsvpSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
    },
    status: {
        type: String,
        enum: ["YES", "NO", "MAYBE"],
        required: true,
    },
});

const rsvp = mongoose.model("rsvp", rsvpSchema);

module.exports = rsvp;
