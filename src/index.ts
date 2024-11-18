import { processGmGn } from "./scrapper/gmgn-scrapper";

async function main() {
  // await gmGnScrapper.initBrowser();
  // await gmGnScrapper.loadDataLoop();

  processGmGn();
}

main();
