const Category = require("../models/category");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.categoryById = (req, res, next, id) => {
  Category.findById(id, (err, category) => {
    if (err || !category) {
      return res.status(400).json({
        error: "Category not found",
      });
    }

    req.category = category;
    next();
  });
};

exports.create = function (req, res) {
  const category = new Category(req.body);
  category.save((err, data) => {
    if (err) {
      return res.status(400).json({ error: errorHandler(err) });
    }

    res.json({
      data,
    });
  });
};

exports.read = (req, res) => {
  res.json(req.category);
};

exports.update = (req, res) => {
  let category = req.category;
  category.name = req.body.name;
  category.save((err, result) => {
    if (err) {
      res.status(400).json({
        error: errorHandler(err),
      });
    }

    res.json(result);
  });
};

exports.remove = (req, res) => {
  let category = req.category;
  category.remove((err, result) => {
    if (err) {
      res.status(400).json({
        error: errorHandler(err),
      });
    }

    res.json({
      message: "Category removed successfully",
    });
  });
};

exports.list = (req, res) => {
  Category.find((err, category) => {
    if (err || !category) {
      return res.status(400).json({
        error: "Category not found",
      });
    }

    res.json(category);
  });
};
