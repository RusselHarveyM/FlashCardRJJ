app.get("/scrape", (req, res) => {
  const url = req.query.url;

  axios
    .get(url)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      // Extract desired data using Cheerio selectors
      const title = $("title").text();
      const description = $('meta[name="description"]').attr("content");

      // Send the scraped data back to the client
      res.json({ title, description });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: "Error scraping the website." });
    });
});
