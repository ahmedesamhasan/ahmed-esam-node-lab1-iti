const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const Router = require("./routes/users");
const jwt = require("jsonwebtoken");
const {
  verify
} = require("crypto");
const app = express();
const port = 3000;

const logger = (req, res, next) => {
  console.log("request started");
  const auth = req.headers['authorization']
  const token = auth.split(" ")?. [1];
  jwt.verify(token, 'secretkeygfsgd', (err, data) => {
    if (err) next(401)
  })
  console.log("🚀 ~ logger ~ token:", token)

  next();
};
app.use(express.json());
// app.use(express.static(path.join(__dirname, "public")));
app.get(["/", "/home"], async (req, res) => {
  console.log("🚀 ~ req:", req);
  // const content = await fs.readFile("./public/index.html", "utf-8");

  res.send({
    content: "here"
  });
  return;
});
app.use(logger);

app.use("/users", Router);

const errorHandler = (err, req, res, next) => {
  console.log(err);
  if (err === 401) {
    res.status(401).send({
      error: "unauthorizared"
    });

  }
  res.status(400).send({
    error: "something went wrong"
  });
  return;
};
app.use(errorHandler);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
