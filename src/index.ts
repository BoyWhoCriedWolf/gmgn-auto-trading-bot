import puppeteer from "puppeteer";

const scrapeData = async () => {
  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: false }); // Set headless: true for no UI
  const page = await browser.newPage();

  try {
    // Navigate to the page
    await page.goto(
      "https://gmgn.ai/defi/quotation/v1/rank/sol/swaps/1m?orderby=open_timestamp&direction=desc&limit=20&filters[]=renounced&filters[]=frozen&min_liquidity=100000"
    );

    // You may need to manually solve the CAPTCHA here
    console.log("Please solve the CAPTCHA and then press Enter...");
    await new Promise((resolve) => process.stdin.once("data", resolve));

    // Get the content of the page
    const content = await page.content();

    // Use a regex to extract the JSON from the HTML
    const jsonMatch = content.match(/<pre>(.*?)<\/pre>/);
    if (jsonMatch && jsonMatch[1]) {
        const jsonString = jsonMatch[1];
        const jsonData = JSON.parse(jsonString);

        console.log("Parsed JSON Data:", jsonData);

        // If you want to access specific data, for example:
        const trendingItems = jsonData.data.rank; // Adjust based on the structure
        console.log("Trending Items:", trendingItems);
    } else {
        console.error("No JSON found in the response.");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
};

scrapeData();