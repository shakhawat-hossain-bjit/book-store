const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema(
  {
    books: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Book",
      },
    ],
    startTime: {
      type: Date,
      required: [true, "Discount must have a start time"],
    },
    endTime: {
      type: Date,
      required: [true, "Discount must have a end time"],
    },
    price: {
      type: Number,
      required: [true, "Every discount should have a value"],
    },
  },
  { timestamps: true }
);

const DiscountModel = mongoose.model("Discount", discountSchema);
module.exports = DiscountModel;
