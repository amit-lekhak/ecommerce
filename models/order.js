const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Product",
    },
    name: String,
    price: Number,
    count: Number,
  },
  { timestamps: true }
);

const CartItemModel = mongoose.model("CartItem", cartItemSchema);

const orderSchema = new mongoose.Schema(
  {
    products: [cartItemSchema],
    transaction_id: String,
    amount: Number,
    address: String,
    status: {
      type: String,
      default: "Not processed",
      enum: [
        "Not processed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
    },
    updated: Date,
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("Order", orderSchema);

module.exports = { CartItemModel, OrderModel };
