const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const app = express();

app.get("/scrape", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    res.status(400).json({ error: "Missing url query parameter!" });
    return;
  }

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const title = $("title").text();
    const description = $('meta[name="description"]').attr("content");

    let pageContent = "";
    $("article").each((index, element) => {
      pageContent += $(element).html();
    });

    if (!pageContent) {
      pageContent = $("div.article-content").html();
    }

    pageContent = pageContent.replace(/<style([\s\S]*?)<\/style>/gi, "");
    pageContent = pageContent.replace(/<[^>]+>/g, "");
    pageContent = pageContent.replace(/(\r\n|\n|\r)/gm, "");
    pageContent = pageContent.trim();

    if (!title || !description || !pageContent) {
      res.status(404).json({ error: "Data not found" });
      return;
    }

    const prompt = `Remove the formatting and styling from ${url}: Title: ${title}, Description: ${description}, Page Content: `;
    const generatedReply = await generateChatResponse(prompt, pageContent);

    console.log("ChatGPT Reply:", generatedReply);

    res.json({ title, description, pageContent, generatedReply });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error scraping the website" });
  }
});

async function generateChatResponse(prompt, pageContent) {
  const API_KEY = "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";
  const API_URL = "https://api.openai.com/v1/chat/completions";

  const sections = splitIntoSections(pageContent, 4096); // Split pageContent into sections

  let chatHistory = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: prompt },
  ];

  for (const section of sections) {
    chatHistory.push({ role: "user", content: section });

    try {
      const response = await axios.post(
        API_URL,
        {
          messages: chatHistory,
          model: "gpt-3.5-turbo",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );

      const { choices } = response.data;
      const reply = choices[0].message.content;

      chatHistory.push({ role: "assistant", content: reply });
    } catch (error) {
      console.error("Error:", error.response.data);
      throw error;
    }
  }

  const assistantReply = chatHistory
    .filter((message) => message.role === "assistant")
    .map((message) => message.content)
    .join("");

  return assistantReply;
}

function splitIntoSections(text, maxLength) {
  const sections = [];
  let currentSection = "";

  for (const paragraph of text.split("\n")) {
    if (currentSection.length + paragraph.length <= maxLength) {
      currentSection += paragraph + "\n";
    } else {
      sections.push(currentSection);
      currentSection = paragraph + "\n";
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
