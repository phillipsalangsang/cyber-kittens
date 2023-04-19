const crypto = require("crypto");
const fs = require("fs");

const key = crypto.randomBytes(32).toString("hex");
fs.appendFileSync(".env", `\nJEW_SECRET="${key}"`);