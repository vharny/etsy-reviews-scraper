import puppeteer from "puppeteer";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import fs from "fs";
import {
  acceptGdpr,
  filterReviewsByMostRecents,
  getNumberOfReviewsPages,
  getPageReviewsData,
  goToNextReviewsPage,
  reviewsToCSV,
} from "./utils.js";

const main = async () => {
  // Get shop https://www.etsy.com/shop/[shop]
  const rl = readline.createInterface({ input, output });
  const shop = await rl.question("What is the name of your store? ");
  rl.close();
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  // Print console log
  page.on("console", (msg) => console.log(msg.text()));
  // Set Viewport
  await page.setViewport({ width: 1080, height: 1080 });
  // Navigate the page to a URL
  await page.goto(`https://www.etsy.com/shop/${shop}`);
  // Accept GDPR
  await acceptGdpr(page);
  // Filter reviews by most recents
  await filterReviewsByMostRecents(page);
  // Get number of reviews pages
  const numberOfReviewsPages = await getNumberOfReviewsPages(page);
  // Get reviews data
  let reviews = [];
  for (let index = 1; index <= numberOfReviewsPages; index++) {
    console.log("Page", index);
    // Move to next page
    await goToNextReviewsPage(page, index);
    // Scrap data
    const reviewsData = await getPageReviewsData(page);
    // Add page data to data array
    reviews = reviews.concat(reviewsData);
  }
  // Close browser
  await browser.close();
  console.log("Total reviews", reviews.length);
  // Save output in JSON
  fs.writeFileSync("./output.json", JSON.stringify(reviews));
  // Save output in CSV | Loox format
  fs.writeFileSync("./loox.csv", reviewsToCSV(reviews));
};

main();
