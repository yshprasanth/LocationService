

var path = require('path');
const fs = require("fs");
const readline = require("readline");
const {google} = require("googleapis");

var cron = require('node-cron');


var env = require('../../../conf/env.json');

var ERR = require("../common/error-handler");
var LOG = require('../common/logger');

// If modifying these scopes, delete token.json.
const VERSION = env.api.google.sheets.version;
const SCOPES = env.api.google.sheets.scopes;
const SHEET_ID = env.api.google.sheets.id;
const RANGE = env.api.google.sheets.range;

const CREDN_PATH = "../../../conf/credentials.json";
const TOKEN_PATH = "../../../conf/token.json";
const CRON_EXP = '*/' + env.cron.seconds + ' * * * * *';
const BASE_DIR = __dirname;

const ORIGIN = env.location.points.origin;
const DESTINATION = env.location.points.destinationB;

const CONTEXT = '[GOOGLE_API]';


var startPoll = function () {
    
    var filePath = path.join(BASE_DIR, '/') + CREDN_PATH;
    // Load client secrets from a local file.
    fs.readFile(filePath, (err, content) => {
        if (err)
            return LOG.info("Error loading client secret file:", err);
        // Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), pollLocationData);
    });
};

var startPollLast = function () {
    
    var filePath = path.join(BASE_DIR, '/') + CREDN_PATH;
    // Load client secrets from a local file.
    fs.readFile(filePath, (err, content) => {
        if (err)
            return LOG.info("Error loading client secret file:", err);
        // Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), pollLastLocationData);
    });
};

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

    var filePath = path.join(BASE_DIR, '/') + TOKEN_PATH;
    // Check if we have previously stored a token.
    fs.readFile(filePath, (err, token) => {
        if (err)
            return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
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
    // LOG.info("Authorize this app by visiting this url:", authUrl);
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question("Enter the code from that page here: ", code => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err)
                return LOG.error(
                        "Error while trying to retrieve access token",
                        err
                        );
            oAuth2Client.setCredentials(token);
            
            var filePath = path.join(BASE_DIR, '/') + TOKEN_PATH;
            // Store the token to disk for later program executions
            fs.writeFile(filePath, JSON.stringify(token), err => {
                if (err)
                    LOG.error(err);
                LOG.info("Token stored to", filePath);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function pollLocationData(auth) {
    const sheets = google.sheets({version: VERSION, auth});

    cron.schedule(CRON_EXP, () => {

        sheets.spreadsheets.values.get(
                {
                    spreadsheetId: SHEET_ID,
                    range: RANGE
                },
                (err, res) => {
                    if (err)
                        return LOG.info("The API returned an error: " + err);
                    const rows = res.data.values;
                    if (rows.length) {
                        LOG.info("Time, Latitude, Longitude:");
                        rows.map(row => {
                            LOG.info(`${row[0]}, ${row[1]}, ${row[2]}`);
                        });
                        LOG.info("-----------------------------  :: " + new Date());
                    } else {
                        LOG.info("No data found.");
                    }
                }
        );

    });

}


function pollLastLocationData(auth) {
    const sheets = google.sheets({version: VERSION, auth});

    cron.schedule(CRON_EXP, () => {

        sheets.spreadsheets.values.get(
                {
                    spreadsheetId: SHEET_ID,
                    range: RANGE
                },
                (err, res) => {
                    if (err)
                        return LOG.info("The API returned an error: " + err);
                    const rows = res.data.values;
                    if (rows.length) {
                        LOG.info("LAST - Time, Latitude, Longitude:");
                        var last = rows[rows.length - 1];
                        var location = "";
                        
                        if(last[1] === ORIGIN[0] && last[2] === ORIGIN[1]) {
                            LOG.info("At origin");
                        }
                        
                        
                        
                        LOG.info(`${last[0]}, ${last[1]}, ${last[2]}`);
                        LOG.info("-----------------------------  :: " + new Date());
                        
                        
                        
                    } else {
                        LOG.info("No data found.");
                    }
                }
        );

    });

}




// -----------------------------------------------------------------------------
//     EXPORTS    --------------------------------------------------------------
// -----------------------------------------------------------------------------

module.exports = {

    poll: startPoll,
    
    pollLast: startPollLast

};