// /src/app/routes/gapi.js

const env = require('../../../conf/env');
var gapiCron = require("../service/gapi-cron");
var gapiWrite = require("../service/gapi-write");
var LOG = require("../common/logger");
var ERR = require("../common/error-handler");

const CONTEXT = "[GAPI]";
// -----------------------------------------------------------------------------
//     PUBLIC    --------------------------- (Update EXPORTS too) --------------
// -----------------------------------------------------------------------------

getHealth = async function(req, res, next){
    var health = "UP and running!  :) ";
    LOG.info(CONTEXT + " - Health check : " + health);
    res.status(200).send(health);
};

poll = async function(req, res, next){
    LOG.info(CONTEXT + " - Starting cron ");
    gapiCron.poll();
    res.status(200).send("Starting...");
};

pollLast = async function(req, res, next){
    LOG.info(CONTEXT + " - Starting cron ");
    gapiCron.pollLast();
    res.status(200).send("Starting...");
};

addCity = async function(req, res, next){
    var city = req.params.city;
    LOG.info(CONTEXT + " - Adding city : " + city);
    gapiWrite.write(city);
    res.status(200).send("City added : " + city);
};

getCities = async function(req, res, next){
    var r = function (cities) {
        res.send(cities);
    };
    
    await gapiWrite.read(r);
};

// -----------------------------------------------------------------------------
//     EXPORTS    --------------------------------------------------------------
// -----------------------------------------------------------------------------

module.exports = function (router) {
    'use strict';
    
    router.route('/health')
            .get(getHealth);
    
    router.route('/poll')
            .get(poll); 
    
    router.route('/pollLast')
            .get(pollLast); 
    
    router.route('/add/:city')
            .get(addCity);
    
    router.route('/cities')
            .get(getCities);
    
    router.route('/')
            .get(ERR.unsupported)
            .post(ERR.unsupported);
    
};