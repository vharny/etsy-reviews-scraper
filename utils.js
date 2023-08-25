export const acceptGdpr = async (page) =>
  await page.evaluate(() => {
    document
      .querySelector(
        "#gdpr-single-choice-overlay > div > div.wt-overlay__footer.wt-pt-xs-3 > div:nth-child(2) > button"
      )
      .click();
  });

export const filterReviewsByMostRecents = async (page) => {
  await page.evaluate(() => {
    document
      .querySelector("#sort-reviews-menu > div > button:nth-child(2)")
      .click();
  });
  await page.waitForNetworkIdle();
};

export const getNumberOfReviewsPages = async (page) =>
  await page.evaluate(() => {
    const maxPage = document.querySelector(
      "#reviews > div > div > div.wt-grid__item-xs-12.wt-grid__item-lg-9.wt-p-xs-0 > div.wt-text-center > div.wt-show-xl > nav > ul > li:nth-last-child(2) > a > span:nth-child(2)"
    ).innerText;
    return Number(maxPage);
  });

export const goToNextReviewsPage = async (page, pageNumber) => {
  if (pageNumber > 1) {
    await page.evaluate((page) => {
      document
        .querySelector(
          `ul.wt-action-group > li.wt-action-group__item-container > a[data-page="${page}"]`
        )
        .click();
    }, pageNumber);
    await page.waitForNetworkIdle();
  }
};

export const getPageReviewsData = async (page) =>
  await page.evaluate(() => {
    const reviewsData = [];
    const reviewsElements = document.querySelectorAll(
      "ul.reviews-list > li > .review-item"
    );
    for (const review of reviewsElements) {
      // Show original review
      const translateReviewButton = review.querySelector(
        "button[data-show-original]"
      );
      if (translateReviewButton) {
        review.querySelector("button[data-show-original]").click();
      }
      // rating
      const rating = review.querySelector('input[name="rating"]').value;
      // Name & Date
      const [name, date] = review
        .querySelector("p.shop2-review-attribution")
        .innerText.split(" on ");
      // Content
      let content;
      if (translateReviewButton) {
        content = review
          .querySelector("div[data-original-content]")
          .textContent.trim()
          .replace(/(\r\n|\n|\r)/gm, "");
      } else {
        const reviewContent = review.querySelector("div.wt-text-gray > p");
        if (reviewContent) {
          content = reviewContent.textContent
            .trim()
            .replace(/(\r\n|\n|\r)/gm, "");
        }
      }
      // Image
      const image = review.querySelector(
        ".appreciation-photo__container > button > img"
      )?.src;
      // Product
      const product = review.querySelector(
        "a.wt-display-block.wt-text-link-no-underline"
      )?.href;
      // Push data
      reviewsData.push({
        rating,
        name,
        content,
        image,
        product,
        date: new Date(date).toISOString().split("T")[0],
      });
    }
    return reviewsData;
  });

// Export for Loox
export const reviewsToCSV = (reviews) => {
  let csv = "";
  // Insert columns
  const columns = [
    "product_handle",
    "rating",
    "author",
    "email",
    "body",
    "created_at",
    "photo_url",
    "verified_purchase",
  ];
  csv += `${columns.join(",")}\n`;
  // Insert data
  for (const { rating, name, content, image, product, date } of reviews) {
    csv += `${[
      product,
      rating,
      name,
      "",
      content || "",
      date,
      image || "",
      "TRUE",
    ].join(",")}\n`;
  }
  return csv;
};
