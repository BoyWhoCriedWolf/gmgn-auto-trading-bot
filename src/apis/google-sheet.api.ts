import { google } from "googleapis";
import { SPREAD_SHEET_ID } from "../config";

const KEY_FILE_PATH = "./src/apis/google-credentials.json";
class GoogleSheetApi {
  // Function to write data to Google Sheets
  update = async ({
    range = "Sheet1!A1",
    data = [],
  }: {
    range?: string;
    data?: Array<Array<string | number>>;
  } = {}) => {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE_PATH, // Path to your credentials
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    try {
      return await sheets.spreadsheets.values.update({
        spreadsheetId: SPREAD_SHEET_ID,
        range: range,
        valueInputOption: "RAW",
        requestBody: {
          values: data,
        },
      });
    } catch (error) {
      console.error("Error writing data to sheet:", error);
    }
  };

  // Function to write data to Google Sheets
  append = async ({
    range = "Sheet1!A1",
    data = [],
  }: {
    range?: string;
    data?: Array<Array<string | number>>;
  } = {}) => {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE_PATH, // Path to your credentials
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    try {
      return await sheets.spreadsheets.values.append({
        spreadsheetId: SPREAD_SHEET_ID,
        range: range,
        valueInputOption: "RAW",
        requestBody: {
          values: data,
        },
      });
    } catch (error) {
      console.error("Error writing data to sheet:", error);
    }
  };

  // Function to read data from Google Sheets
  read = async ({
    range = "Sheet1!A1",
  }: {
    range?: string;
  } = {}) => {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE_PATH, // Path to your credentials
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREAD_SHEET_ID,
        range: range,
      });
      return response.data.values || []; // Return empty array if no data
    } catch (error) {
      console.error("Error reading data from sheet:", error);
    }
  };

  // Function to read all data from a Google Sheet
  readAll = async ({
    sheetName = "Sheet1",
  }: {
    sheetName?: string;
  } = {}) => {
    const auth = new google.auth.GoogleAuth({
      keyFile: "./src/apis/google-credentials.json", // Path to your credentials
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREAD_SHEET_ID,
        range: sheetName, // Use the sheet name to get all data
      });
      return response.data.values || []; // Return empty array if no data
    } catch (error) {
      console.error("Error reading data from sheet:", error);
    }
  };
}

export default new GoogleSheetApi();
