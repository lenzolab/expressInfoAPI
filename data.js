const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
      key: String,
      value: String,
      address: String,
      email: String,
      code: String,
      extraInfo: String,
})
module.exports = mongoose.model("Data", dataSchema)