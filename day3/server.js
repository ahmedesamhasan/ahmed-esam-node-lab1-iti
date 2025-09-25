const express = require('express');
const fs = require("fs/promises");
const path = require("path");
const morgan = require("morgan");
const Router = require('./routes/index')
const app = express();
const port = 3000;

app.use(morgan("dev"));
