

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
const SHEET_ID ="1Kz-GPU7yJe3S9wk8HI97taqyRWcCiGa2PV8P435RIzo"; 

const CONTEXT = '[GOOGLE_API]';



var readCities = function (callback) {
    
    var filePath = path.join(__dirname, '/') + CREDN_PATH;
    // Load client secrets from a local file.
    
    fs.readFile(filePath, (err, content) => {
        if (err)
            return LOG.info("Error loading client secret file:", err);
        // Authorize a client with credentials, then call the Google Sheets API.
        let cities = authorize(JSON.parse(content), getCities, callback);
        LOG.info(" -- " + cities);
    });
};

var writeCity = function (city) {
    
    var filePath = path.join(__dirname, '/') + CREDN_PATH;
    // Load client secrets from a local file.
    fs.readFile(filePath, (err, content) => {
        if (err)
            return LOG.info("Error loading client secret file:", err);
        // Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), appendNewCity, city);
    });
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(credentials, callback, city) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0]
            );

    var filePath = path.join(__dirname, '/') + TOKEN_PATH;
    // Check if we have previously stored a token.
    fs.readFile(filePath, (err, token) => {
        if (err)
            return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client, city);
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
    // LOG.info("Authorize this app by visiting this url: ");
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
            
            var filePath = path.join(__dirname, '/') + TOKEN_PATH;
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
 * @param {String} city city to add
 */
function appendNewCity(auth, city) {
    const sheets = google.sheets({version: "v4", auth});

    sheets.spreadsheets.values.append({
          auth: auth,
          spreadsheetId: '1Kz-GPU7yJe3S9wk8HI97taqyRWcCiGa2PV8P435RIzo',
          range: 'transit!A2:B', //Change Sheet1 if your worksheet's name is something else
          valueInputOption: "USER_ENTERED",
          resource: {
            values: [ [city, false] ]
          }
        }, (err, response) => {
          if (err) {
            LOG.info('The API returned an error: ' + err);
            return;
          } else {
              LOG.info("Appended");
          }
        });

}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function getCities(auth, callback) {
    const sheets = google.sheets({version: "v4", auth});
    
    var cities = [];

    sheets.spreadsheets.values.get(
            {
                spreadsheetId: SHEET_ID,
                range: "transit!A2:B"
            },
            (err, res) => {
                if (err)
                    LOG.info("The API returned an error: " + err);
                const rows = res.data.values;
                if (rows.length) {
                    LOG.info("Position, Status:");
                    rows.map(row => {
                        LOG.info(`${row[0]}, ${row[1]}`);
                        cities.push({
                            name: row[0],
                            status: row[1]
                        });
                    });
                    LOG.info("-----------------------------  :: " + new Date());
                } else {
                    LOG.info("No data found.");
                }
                callback(cities);
            }
    );
    
    return cities;

}

// -----------------------------------------------------------------------------
//     EXPORTS    --------------------------------------------------------------
// -----------------------------------------------------------------------------

module.exports = {

    write: writeCity,

    read: readCities

};