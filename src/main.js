// /main.js
'use strict';

var async = require('async');

var env = require('../conf/env.json');
var db = require('./app/db/connection');
var server = require('./app/net/server');
var googleApi = require('./app/net/googleApi');
var LOG = require('./app/common/logger');


const CONTEXT = '[INIT]';

LOG.info(CONTEXT + " - Building app");
LOG.info(CONTEXT + " - Initializing modules");

// Initialize modules
async.series(
    [
        function initializeDBConnection(callback) {
            LOG.info(CONTEXT + " - Initializing DB");
            db.connect(env, callback);
        },
//        function initializeGoogleAPIConnection(callback) {
//            LOG.info(CONTEXT + " - Initializing Google API connection");
//            googleApi.authenticate(env, callback);
//        },
        function startServer(callback) {
            LOG.info(CONTEXT + " - Starting server");
            server.start(env, callback);
        }
    ],
    function (err) {
        if (err) {
            LOG.error(CONTEXT + " - Initialization failed");
        } else {
            LOG.info(CONTEXT + " - Initialization complete");
        }
    }
);


