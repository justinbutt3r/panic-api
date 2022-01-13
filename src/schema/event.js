const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create event schema & model
const EventSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name field is required"],
    },
    location: {
      type: String,
      required: [true, "Location field is required"],
    },
    lat: { type: String, required: [true, "lat field is required"] },
    lng: { type: String, required: [true, "lng field is required"] },
    age: { type: Number },
    gender: { type: String },
    details: { type: String },
  },
  { timestamps: true }
);

const Event = (connection) => {
  return connection.model("Event", EventSchema);
};

module.exports = Event;
