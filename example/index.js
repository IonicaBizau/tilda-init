"use strict";

const tildaInit = require("../lib");

tildaInit(`${__dirname}/..`, (err, data) => console.log(err || data))
