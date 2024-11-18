import puppeteer, { Browser, Page } from "puppeteer";
import { GmGnAiTrending } from "./gmgn-scrapper.type";

const URL =
  "https://gmgn.ai/defi/quotation/v1/rank/sol/swaps/1m?orderby=open_timestamp&direction=desc&limit=20&filters[]=renounced&filters[]=frozen&min_liquidity=100000";

const DELAY = 5000;

export async function processGmGn() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  let trendingItems: Array<GmGnAiTrending> = [];

  // Navigate to the page
  await page.goto(URL);

  // You may need to manually solve the CAPTCHA here
  console.log("Please solve the CAPTCHA and then press Enter...");
  await new Promise((resolve) => process.stdin.once("data", resolve));

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

        trendingItems = trends;
        console.log("Trending Items:", trends.length);
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
