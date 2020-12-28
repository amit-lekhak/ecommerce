const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();

//route import

const userRoutes = require("./routes/user");


mongoose.connect(process.env.DATABASE,{
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("Db connected successfully"));



app.use("/api",userRoutes);


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server started");
});
