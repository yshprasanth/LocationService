// src/app/common/error-handler.js

const env = require('../../../conf/env');
var LOG = require('../common/logger');

// -----------------------------------------------------------------------------
//     PUBLIC    --------------------------- (Update EXPORTS too) --------------
// -----------------------------------------------------------------------------

var unsupported = function (req, res, next) {
    var status = "Operation not yet supported";
    LOG.warn("[ROUTES] - " + status);
    res.status(418).send(status);
};

var error500 = function (err, req, res, next) {
    var status = err.status || 500;
    LOG.error("[APP] - " + status + " - " + req.method + " : " + req.url + " :: " + err.message);
    res.status(status);
    res.json(
        {
            message: err.message,
            error: (env.env === "DEV" ? err : {})
        }
    );
    next(err);
};

var error404 = function (req, res, next) {
    var status = "Nothing to see here";
    LOG.warn("[ROUTES] - 404 - " + req.method + " : " + req.url);
    res.status(404).send(status);
};

var handledError = function (context, err) {
    LOG.error(context + " - Error starting the app : " + err.message);
    LOG.debug(context + " - Error starting the app - Caused by : " + err.stack);
};

// -----------------------------------------------------------------------------
//     EXPORTS    --------------------------------------------------------------
// -----------------------------------------------------------------------------

module.exports = {

    unsupported: unsupported,
    error500: error500,
    error404: error404,
    handledError: handledError
    
};
