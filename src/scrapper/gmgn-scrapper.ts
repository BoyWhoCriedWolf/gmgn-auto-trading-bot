import puppeteer from "puppeteer";
import googleSheetApi from "../apis/google-sheet.api";
import { GmGnAiTrending } from "./gmgn-scrapper.type";

const URL =
  "https://gmgn.ai/defi/quotation/v1/rank/sol/swaps/1m?orderby=open_timestamp&direction=desc&limit=20&filters[]=renounced&filters[]=frozen&min_liquidity=100000";

const DELAY = 5000;

export async function processGmGn() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  let trendItems: Array<GmGnAiTrending> = [];
  let trendItemsRemoved: Array<{
    item: GmGnAiTrending;
    origin_item?: GmGnAiTrending;
    created_at?: string;
    updated_at?: string;
    rendered?: boolean;
  }> = [];
  let trendItemsNew: Array<{
    item: GmGnAiTrending;
    origin_item?: GmGnAiTrending;
    created_at?: string;
    updated_at?: string;
    rendered?: boolean;
  }> = [];

  // Navigate to the page
  await page.goto(URL);

  // You may need to manually solve the CAPTCHA here
  console.log("Please solve the CAPTCHA and then press Enter...");
  await new Promise((resolve) => process.stdin.once("data", resolve));

  const updateTrends = (trends = [] as Array<GmGnAiTrending>) => {
    // check for new coins
    trends.forEach((item, itemIndex) => {
      const matchIndex = trendItems.findIndex((c) => c?.id === item?.id);

      const matchIndexInNewList = trendItemsNew.findLastIndex(
        (c) => c?.item?.id === item?.id
      );

      // token is new
      if (matchIndex < 0) {
        trendItemsNew.push({
          item,
          origin_item: item,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else {
        // not new added but exist
        if (matchIndexInNewList >= 0) {
          trendItemsNew[matchIndexInNewList].item = item;
          trendItemsNew[matchIndexInNewList].updated_at =
            new Date().toISOString();
        }
      }
    });

    // check for removed coins from current list
    trendItems.forEach((item, itemIndex) => {
      const matchIndex = trends.findIndex((c) => c?.id === item?.id);

      // if removed token
      if (matchIndex < 0) {
        trendItemsRemoved.push({
          item,
          origin_item: item,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    });

    // trends list
    trendItems = trends;
  };

  const updateGoogleSheet = async () => {
    await googleSheetApi.update({
      range: "Trending!A1",
      data: [
        [
          "Id",
          "Coin",
          "Price",
          "price change percentage 1h",
          "Volume",
          "Market Cap",
        ],
        ...(trendItems ?? []).map((item) => [
          item?.id ?? "",
          item?.symbol ?? "",
          item?.price ?? "",
          item?.price_change_percent1h ?? "",
          item?.volume ?? "",
          item?.market_cap ?? "",
        ]),
      ],
    }); // Call the function to append data to Google Sheets

    await googleSheetApi.append({
      range: "New!A1",
      data: [
        // remove heading columns because we appending
        // [
        //   "Id",
        //   "Coin",
        //   "Price",
        //   "price change percentage 1h",
        //   "Volume",
        //   "Market Cap",
        //   "Added At",
        //   // "Updated At",

        //   // prices
        //   "Price when this is added",
        //   "Profit",
        //   "Price change percentage from added",
        //   "Is First Added",
        // ],
        ...(trendItemsNew ?? [])
          .filter((item) => !item?.rendered)
          .map((item, itemIndex, self) => {
            const firstMatchIndex = (trendItemsNew ?? []).findIndex(
              (c) => c?.item?.id === item?.item?.id
            );

            const isNew = firstMatchIndex === itemIndex;

            item.rendered = true;

            return [
              item?.item?.id ?? "",
              item?.item?.symbol ?? "",
              item?.item?.price ?? "",
              item?.item?.price_change_percent1h ?? "",
              item?.item?.volume ?? "",
              item?.item?.market_cap ?? "",
              item?.created_at ?? "",
              // item?.updated_at ?? "",
              item?.origin_item?.price ?? "",
              item?.origin_item?.price
                ? (item?.item?.price ?? 0) - (item?.origin_item?.price ?? 0)
                : "",
              item?.origin_item?.price
                ? (((item?.item?.price ?? 0) -
                    (item?.origin_item?.price ?? 0)) /
                    (item?.origin_item?.price ?? 1)) *
                  100
                : "",
              isNew ? "New" : "",
            ];
          }),
      ],
    }); // Call the function to append data to Google Sheets

    await googleSheetApi.append({
      range: "Removed!A1",
      data: [
        // remove heading columns because we appending
        // [
        //   "Id",
        //   "Coin",
        //   "Price",
        //   "price change percentage 1h",
        //   "Volume",
        //   "Market Cap",
        //   "Removed At",
        //   // "Updated At",
        // ],
        ...(trendItemsRemoved ?? [])
          .filter((item) => !item?.rendered)
          .map((item) => {
            item.rendered = true;

            return [
              item?.item?.id ?? "",
              item?.item?.symbol ?? "",
              item?.item?.price ?? "",
              item?.item?.price_change_percent1h ?? "",
              item?.item?.volume ?? "",
              item?.item?.market_cap ?? "",
              item?.created_at ?? "",
              // item?.updated_at ?? "",
            ];
          }),
      ],
    }); // Call the function to append data to Google Sheets

    await googleSheetApi.update({
      range: "NewAdded!A1",
      data: [
        [
          "Id",
          "Coin",
          "Price",
          "price change percentage 1h",
          "Volume",
          "Market Cap",
          "Added At",
          // "Updated At",

          // prices
          "Price when this is added",
          "Profit",
          "Price change percentage from added",
        ],
        ...(trendItemsNew ?? [])
          .filter((item, itemIndex, self) => {
            const firstMatchIndex = self.findIndex(
              (c) => c?.item?.id === item?.item?.id
            );

            if (firstMatchIndex === itemIndex) {
              return true;
            }
            return false;
          })
          .map((item) => [
            item?.item?.id ?? "",
            item?.item?.symbol ?? "",
            item?.item?.price ?? "",
            item?.item?.price_change_percent1h ?? "",
            item?.item?.volume ?? "",
            item?.item?.market_cap ?? "",
            item?.created_at ?? "",
            // item?.updated_at ?? "",
            item?.origin_item?.price ?? "",
            item?.origin_item?.price
              ? (item?.item?.price ?? 0) - (item?.origin_item?.price ?? 0)
              : "",
            item?.origin_item?.price
              ? (((item?.item?.price ?? 0) - (item?.origin_item?.price ?? 0)) /
                  (item?.origin_item?.price ?? 1)) *
                100
              : "",
          ]),
      ],
    }); // Call the function to append data to Google Sheets
  };

  async function readTrends() {
    try {
      // Get the content of the page
      const content = (await page?.content()) ?? "";

      // Use a regex to extract the JSON from the HTML
      const jsonMatch = content?.match(/<pre>(.*?)<\/pre>/);
      if (jsonMatch && jsonMatch[1]) {
        const jsonString = jsonMatch[1];
        const jsonData = JSON.parse(jsonString);

        // console.log("Parsed JSON Data:", jsonData);

        // If you want to access specific data, for example:
        const trends = (jsonData.data.rank ?? []) as Array<GmGnAiTrending>; // Adjust based on the structure

        console.log("Trending Items:", trends.length);
        // update global variables
        updateTrends(trends);

        // write content to the google sheet
        await updateGoogleSheet();
      } else {
        console.error("No JSON found in the response.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  //   init load
  await readTrends();

  //   load load
  async function doLoopLoad() {
    await page.reload();
    await readTrends();
    setTimeout(doLoopLoad, DELAY);
  }

  await doLoopLoad();
}
