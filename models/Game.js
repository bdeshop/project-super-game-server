const mongoose = require("mongoose");

// SubCategory Schema
const SubCategorySchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  img: {
    type: String,
  },
  parentMenu: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SubCategory = mongoose.model("SubCategory", SubCategorySchema);

// Game Schema
const GameSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  gamelink: {
    type: String,
  },
  gameapikey: {
    type: String,
  },
  maxwin: {
    type: Number,
  },
  gameTrailerLink: {
    type: String,
  },
  volatility: {
    type: String,
  },
  paylines: {
    type: String,
  },
  publishtimes: {
    type: Date,
  },
  specialfeatures: [
    {
      type: String,
    },
  ],
  supportedlanguage: [
    {
      type: String,
    },
  ],
  gameID: {
    type: String,
    required: true,
  },
  desktopImages: [
    {
      type: String,
    },
  ],
  mobileImages: [
    {
      type: String,
    },
  ],
  description: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  provider: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
  },
});

const Game = mongoose.model("Games", GameSchema);

module.exports = { Game, SubCategory };