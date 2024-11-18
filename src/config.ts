import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const SPREAD_SHEET_ID = process.env.SPREAD_SHEET_ID ?? "spread-sheet-id";
