const mongoose = require("mongoose");

const RewardsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title Reward required !"],
      trim: true,
      unique: true,
    },

    des: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      trim: true,
      default:null
    },
   departments: [
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    display: {
      type: Boolean,
      default: false,
    },
  },
],


    categories: [
      {
        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
          required: true,
        },
        
        points: {
          type: Number,
          required: [true, "points reward is required !"],
          min: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Rewards", RewardsSchema);
