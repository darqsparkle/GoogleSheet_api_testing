const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const credentials = require('./testingapi.json');

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:5173' })); // Enable CORS for localhost:5173

const PORT = 5007;

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

const SPREADSHEET_ID = '1WXr6aZ6WPibyI3A7FfwtCRFskpOI6h7aRFbMN1BHwGs';

// Endpoint to add data to Google Sheets
app.post('/api/add', async (req, res) => {
  const { Name, Age, Department, Address } = req.body;

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:D',
      valueInputOption: 'USER_ENTERED',
      resource: { values: [[Name, Age, Department, Address]] },
    });
    res.status(200).send('Data added successfully!');
  } catch (error) {
    console.error('Error adding data:', error);
    res.status(500).send('Error adding data');
  }
});

// Endpoint to fetch data from Google Sheets
app.get('/api/view', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:D',
    });

    const rows = response.data.values || [];
    const formattedData = rows.map((row) => ({
      Name: row[0],
      Age: row[1],
      Department: row[2],
      Address: row[3],
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
