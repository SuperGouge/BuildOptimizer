var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var debug = require("debug")("BuildOptimizer:Express");

var config = require("./config/config");

var riotApi = require("./lib/riot-api");

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");


app.use(require("compression")());
app.use(require("serve-favicon")(__dirname + "/public/favicon.ico"));
app.use(require("morgan")("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require("cookie-parser")());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", require("./routes/index"));
app.use("/api", require("./routes/api"));

app.use(function(req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
        message: err.message,
        status: err.status || 500,
        error: app.get("env") === "development" ? err : {}
    });
});

module.exports = app;