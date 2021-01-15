const { errorHandler } = require("../helpers/dbErrorHandler");
const { OrderModel } = require("../models/order");

exports.orderById = (req, res, next, id) => {
  OrderModel.findById(id)
    .populate("products.product", "name price")
    .exec((err, order) => {
      if (err || !order) {
        return res.status(400).json({
          error: "Order not found",
        });
      }
      req.order = order;
      next();
    });
};

exports.create = (req, res) => {
  req.body.order.user = req.profile;
  const newOrder = new OrderModel(req.body.order);
  newOrder.save((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.json(data);
  });
};

exports.listOrders = (req, res) => {
  OrderModel.find()
    .populate("user", "_id name address")
    .sort("-createdAt")
    .exec((err, orders) => {
      if (err || !orders) {
        return res.status(400).json({
          error: "Orders not found",
        });
      }
      res.json(orders);
    });
};

exports.getStatusValues = (req, res) => {
  res.json(OrderModel.schema.path("status").enumValues);
};

exports.updateOrderStatus = (req, res) => {
  OrderModel.update(
    { _id: req.body.orderId },
    { $set: { status: req.body.status } },
    (err, order) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(order);
    }
  );
};
