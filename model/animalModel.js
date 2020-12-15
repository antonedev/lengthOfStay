const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String, required: true },
  species: { type: String, required: true },
  dateOfEntry: { type: String, required: true },
  lengthOfStay: { type: Number, required: true },
  shelter: { type: String, required: true },
  area: { type: String, required: true },
  inFoster: { type: Boolean, required: false },
  fosterDate: { type: String, required: false },
  returnDate: { type: String, required: false },
  notes: { type: String, required: false },
});

exports.Animal = mongoose.model("Animal", animalSchema);
