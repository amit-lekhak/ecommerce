const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

exports.productById = (req, res, next, id) => {
  Product.findById(id, (err, product) => {
    if (err || !product) {
      return res.status(400).json({
        error: "Product not found",
      });
    }

    req.product = product;
    next();
  }).populate("category");
};

exports.read = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

exports.create = function (req, res) {
  let form = formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }

    const { name, description, price, quantity, category, shipping } = fields;
    if (
      !name ||
      !description ||
      !price ||
      !quantity ||
      !category ||
      !shipping
    ) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    let product = new Product(fields);
    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: "Image size should be less than 1mb",
        });
      }

      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }

    product.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }

      res.json(result);
    });
  });
};

exports.remove = (req, res) => {
  let product = req.product;
  product.remove((err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }

    res.json({
      message: "Product deleted successfully",
    });
  });
};

exports.update = function (req, res) {
  let form = formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }

    // const { name, description, price, quantity, category, shipping } = fields;
    // if (
    //   !name ||
    //   !description ||
    //   !price ||
    //   !quantity ||
    //   !category ||
    //   !shipping
    // ) {
    //   return res.status(400).json({
    //     error: "All fields are required",
    //   });
    // }

    let product = req.product;
    product = _.extend(product, fields);

    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: "Image size should be less than 1mb",
        });
      }

      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }

    product.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }

      res.json(result);
    });
  });
};

/**
 * list products by
 * sale - /products?sortBy=sold&order=desc&limit=4
 * arrival - /products/?sortBy=createdAt&order=desc&limit=4
 */

exports.list = (req, res) => {
  const sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  const order = req.query.order ? req.query.order : "desc";
  const limit = req.query.limit ? +req.query.limit : 6;

  Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, products) => {
      if (err || !products) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json(products);
    });
};

exports.relatedList = (req, res) => {
  const limit = req.query.limit ? +req.query.limit : 6;
  Product.find({ _id: { $ne: req.product }, category: req.product.category })
    .limit(limit)
    .populate("category", "_id name")
    .exec((err, productList) => {
      if (err || !productList) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json(productList);
    });
};

exports.categoriesList = (req, res) => {
  Product.distinct("category", (err, categories) => {
    if (err || !categories) {
      return res.status(400).json({
        error: "Product categories not found",
      });
    }

    res.json(categories);
  });
};

exports.listBySearch = (req, res) => {
  const order = req.body.order ? req.body.order : "desc";
  const sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  const limit = req.body.limit ? +req.body.limit : 100;
  const skip = +req.body.skip;
  let findArgs = {};

  //filters = {price:[lowerLimit,HigherLimit],category:"value"}

  console.log(req.body.filters);
  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  Product.find(findArgs)
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .limit(limit)
    .skip(skip)
    .exec((err, products) => {
      if (err || !products) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json({
        size: products.length,
        products,
      });
    });
};

exports.photo = (req, res, next) => {
  if (req.product.photo) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.searchProducts = (req, res) => {
  const query = {};
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: "i" };

    if (req.query.category && req.query.category !== "All") {
      query.category = req.query.category;
    }
  }

  Product.find(query)
    .select("-photo")
    .exec((err, products) => {
      if (err || !products) {
        return res.status(400).json({
          error: "No search results found",
        });
      }
      res.json(products);
    });
};

exports.decreaseQuantity = (req, res, next) => {
  let bulkOps = req.body.order.products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item._id },
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    };
  });

  Product.bulkWrite(bulkOps, {}, (err, products) => {
    if (err) {
      res.status(400).json({
        error: "Could not update product",
      });
    }
    next();
  });
};
