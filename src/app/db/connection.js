// /app/db/connection.js

var ERR = require('../common/error-handler');
var LOG = require('../common/logger');

const CONTEXT = '[DB]';
// -----------------------------------------------------------------------------
//     PUBLIC    --------------------------- (Update EXPORTS too) --------------
// -----------------------------------------------------------------------------

var connect = function(env, callback) {
    'use strict';
    
    LOG.info(CONTEXT + " - Connecting to DB at ENV: " + env.env);
    
    try{ 
        
        LOG.info(CONTEXT + " - Connection - Successful");
        
        callback();
        
    } catch (e) {
        LOG.error(CONTEXT + " - Connection - Failed : " + e.message, e);
        ERR.handledError(CONTEXT, e);
        
        callback(e);
    }
};


// -----------------------------------------------------------------------------
//     EXPORTS    --------------------------------------------------------------
// -----------------------------------------------------------------------------

module.exports = {
    
    connect: connect
    
};