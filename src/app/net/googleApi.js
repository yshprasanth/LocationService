// /app/net/googleApi.js

var path = require('path');
const fs = require("fs");
const readline = require("readline");
const {google} = require("googleapis");

var ERR = require("../common/error-handler");
var LOG = require('../common/logger');

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const CREDN_PATH = "../../../conf/credentials.json";
const TOKEN_PATH = "../../../conf/token.json";

const CONTEXT = '[GOOGLE_API]';

var connector;


// -----------------------------------------------------------------------------
//     PRIVATE    --------------------------------------------------------------
// -----------------------------------------------------------------------------
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0]
    );
        
    var filePath = path.join(__dirname, '/') + TOKEN_PATH;

    LOG.info(CONTEXT + " - Reading token : " + filePath);

    //var content = fs.readFileSync(filePath, 'utf8');
        
    
//    LOG.debug(CONTEXT + " - Credentials read : " +  content);
//    var credentials = JSON.parse(content);
//
//    // Check if we have previously stored a token.
    fs.readFile(filePath, (err, token) => {
        if (err) {
            return getNewToken(oAuth2Client, callback);
        } else {
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question("Enter the code from that page here: ", code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err)
        return console.error(
          "Error while trying to retrieve access token",
          err
        );
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function setConnector(connector){
    this.connector = connector;
}

// -----------------------------------------------------------------------------
//     PUBLIC    --------------------------- (Update EXPORTS too) --------------
// -----------------------------------------------------------------------------

var authenticate = async function (env, callback) {
    'use strict';

    LOG.info(CONTEXT + " - Auth to Google at ENV : " + env.env);

    try {
        
        var filePath = path.join(__dirname, '/') + CREDN_PATH;
        
        LOG.info(CONTEXT + " - Reading credentials : " + filePath);

        var content = fs.readFileSync(filePath, 'utf8');
        
        LOG.debug(CONTEXT + " - Credentials read : " +  content);
        var credentials = JSON.parse(content);
        
        LOG.info(CONTEXT + " - Credentials - Client ID : " +  credentials.installed.client_id);
        LOG.info(CONTEXT + " - Credentials - Project ID : " +  credentials.installed.project_id);
        
        authorize(credentials, callback);

        LOG.info(CONTEXT + " - Authentication - Successful");

        callback();

    } catch (e) {
        LOG.error(CONTEXT + " - Authentication - Failed : " + e.message, e);
        ERR.handledError(CONTEXT, e);
        callback(e);
    }
};

var getConnector = function(){
    return connector;
};

// -----------------------------------------------------------------------------
//     EXPORTS    --------------------------------------------------------------
// -----------------------------------------------------------------------------

module.exports = {

    authenticate: authenticate,
    getConnector: getConnector

};






