// /app/net/server.js

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var cors = require('cors');

var ERR = require("../common/error-handler");
var LOG = require('../common/logger');

const CONTEXT = '[SERVER]';
const ROUTER =  '../routes/index';

var app;


// -----------------------------------------------------------------------------
//     PUBLIC    --------------------------- (Update EXPORTS too) --------------
// -----------------------------------------------------------------------------

var start = function (env, callback) {
    'use strict';
    
    LOG.info(CONTEXT + " - Starting server");

    try {
        app = express();

        // App security
        //app.use(cors(corsOptions));
        app.use(
            function (req, res, next) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                next();
            }
        );

        // Configure morgan request listener to use winston logging
        app.use(morgan(LOG.morgan.format, LOG.morgan));

    //    app.use(bodyParser.urlencoded({extended: true}));
    //    app.use(bodyParser.json({type: "*/**"}));

        LOG.info(CONTEXT + " - Initializing routes");
        require(ROUTER).route(app);

        app.use(express.static(path.join(__dirname, "public")));

        // Error Handling
        app.use(
            function (err, req, res, next) {
                ERR.error500(err, req, res, next);
            }
        );

        app.listen(env.server.port);
        LOG.info(CONTEXT + " - Listening on port : " + env.server.port);
        
        LOG.info(CONTEXT + " - Server start -  Successful");
        
        callback();
        
    } catch (e) {
        LOG.error(CONTEXT + " - Server start - Failed : " + e.message, e );
        ERR.handledError(CONTEXT, e);
        
        callback(e);
    } 
};


// -----------------------------------------------------------------------------
//     EXPORTS    --------------------------------------------------------------
// -----------------------------------------------------------------------------

module.exports = {
    
    start: start
    
};
