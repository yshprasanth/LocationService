// /src/app/routes/index.js

// Initialization of routes based on file name:
// camelCase.js is exposed as /camel-case

var changeCase = require("change-case");
var express = require("express");
var routes = require("require-dir")();

var LOG = require("../common/logger");
var ERR = require("../common/error-handler");


const CONTEXT = "[INDEX]";
// -----------------------------------------------------------------------------
//     PRIVATE    --------------------------------------------------------------
// -----------------------------------------------------------------------------
getRoot = async function(req, res, next){
    LOG.info(CONTEXT + " - Root check");
    ERR.unsupported(req, res, next);
};

getHealth = async function(req, res, next){
    var health = "UP and running!  :) ";
    LOG.info(CONTEXT + " - Health check : " + health);
    res.status(200).send(health);
};

getVersion = async function(req, res, next){
    var version = "0.1";
    LOG.info(CONTEXT + " - Version check : " + version);
    res.status(200).send(version);
};

get500 = async function(req, res, next){
    LOG.info(CONTEXT + " - Deliberated boom ");
    next(new Error("Kachaplow"));
};

// -----------------------------------------------------------------------------
//     PUBLIC    --------------------------- (Update EXPORTS too) --------------
// -----------------------------------------------------------------------------

var route = function(app) {
    'use strict';
    
    // Initialize all routes
    LOG.info(CONTEXT + " - Route initialization");
    
    Object.keys(routes).forEach(
        function(routeName) {
            var router = express.Router();
            // Add middleware with: router.use(middleware)
            
            var routerName = './' + routeName;
            var path = '/' + changeCase.paramCase(routeName);
            
            LOG.debug(CONTEXT + " - Routing : " + path + " -> " + routerName);
            
            // Initialize route
            require(routerName)(router);
            
            // Register router to given path in the app
            app.use(path, router);
        }
    );
    
    app.get('/health', function (req, res, next) {
        getHealth(req, res, next);
    });
    
    app.get(['/version', '/ver', '/v'], function (req, res, next) {
        getVersion(req, res, next);
    });
    
    app.get('/boom', function (req, res, next) {
        get500(req, res, next);
    });
    
    app.get('/', function (req, res, next) {
        getRoot(req, res, next);
    });
    
    // All other requests default to 404
    app.all('*', function (req, res, next) {
        ERR.error404(req, res, next);
    });

    
};


// -----------------------------------------------------------------------------
//     EXPORTS    --------------------------------------------------------------
// -----------------------------------------------------------------------------

module.exports = {
    
  route : route
    
};