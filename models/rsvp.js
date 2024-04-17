const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rsvpSchema = new Schema({
    event: { type: Schema.Types.ObjectId, ref: "Event" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    response: {
        type: String,
        required: [true, "Response is required"],
        enum: ["Yes", "No", "Maybe"],
    },
});

module.exports = mongoose.model("Rsvp", rsvpSchema);