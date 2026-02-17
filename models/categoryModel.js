const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "must be unique!"],
      required: [true, "category Name required!"],
      trim: true,
    },

    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
    ],
  },
  { timestamps: true }
);

exports.categoryModel = mongoose.model("Category", categorySchema);
