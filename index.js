const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete credentials.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'credentials.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), listMajors);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
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
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return callback(err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}
/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */



function getDoubleDimensionalValue(doubleDimensionalArray) {
  return doubleDimensionalArray[0][0];
}

async function listMajors(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  try {
    const MagdalenaD = getDoubleDimensionalValue(await getSheet(sheets, 'Magdalena Duvnjak!D42'));
    const SumMag = getDoubleDimensionalValue(await getSheet(sheets, 'Summary!B4'));

    console.log(MagdalenaD === SumMag);

  } catch (error) {
    console.log('error', error);
  }
}

function getSheet(sheets, range) {
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get({
      spreadsheetId: '10ufRfF0fE61PFd7FLKSfOrRP8nIcpLbQXdx1QSdcpgc',
      range: range,
    }, function (err, {data}) {
      if (err) return reject('The API returned an error: ' + err);
      const rows = data.values;
      return resolve(rows);
    });
  })
}





/*
function getSheetWithCallback(sheets,range, callback) {
  sheets.spreadsheets.values.get({
    spreadsheetId: '1O8VNs-3E6KSvVJ-aK_Zp6LFoQ0w5-i6r_IHuLWCJBfo',
    range: range,
  }, (err, {data}) => {
    if (err) return callback('The API returned an error: ' + err, null);
    const rows = data.values;
    return callback(null, rows);
  });
}

*/