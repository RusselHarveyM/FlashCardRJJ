const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const app = express();

const API_KEY = "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";
const API_URL = "https://api.openai.com/v1/chat/completions";

app.get("/scrape", async (req, res) => {
  const url = req.query.url;
  console.log("here");
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

    if (pageContent) {
      pageContent = pageContent.replace(/<style([\s\S]*?)<\/style>/gi, "");
      pageContent = pageContent.replace(/<[^>]+>/g, "");
      pageContent = pageContent.replace(/(\r\n|\n|\r)/gm, "");
      pageContent = pageContent.trim();
    }
    if (!title || !pageContent) {
      res.status(404).json({ error: "Data not found" });
      return;
    }
    console.log("here2");

    let prompt = `Remove formatting and styling from the webpage ${url}. Extracted information: Title: ${title}, Description: ${description}, Page Content:`;
    const generatedReply = await generateChatResponse(prompt, pageContent);

    console.log("ChatGPT Reply:", generatedReply);
    prompt = `Please generate flashcards for the webpage at ${url}. Each flashcard should be in the form of a JSON object inside an array with "question" and "answer" properties. The "question" property should contain a brief summary or title for the flashcard, while the "answer" property should contain a few words that provide a concise explanation. The flashcards should be easy to understand and provide a clear and concise overview of the content on the webpage.`;

    const flashcards = await generateFlashcards(prompt, generatedReply, 3);

    console.log("flaschards::  ", flashcards);

    res.json(flashcards);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error scraping the website" });
  }
});

async function generateFlashcards(prompt, pageContent, amount) {
  const sections = splitIntoSections(pageContent, 4096); // Split pageContent into sections
  let flashCardID = 1;

  let chatHistory = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: prompt },
  ];

  for (const section of sections) {
    chatHistory.push({ role: "user", content: section });
  }

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
    const assistantReplies = choices.map((choice) => choice.message.content);

    for (const reply of assistantReplies) {
      chatHistory.push({ role: "assistant", content: reply });
    }
  } catch (error) {
    console.error("Error:", error.response.data);
    throw error;
  }

  await new Promise((resolve) => setTimeout(resolve, 20000));

  // Generate flashcards
  const flashcards = [];
  for (let i = 0; i < amount; i++) {
    // Wait for 10 seconds before generating each flashcard

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
      // let result;
      console.log("reply >>>>> ", reply);

      // try {
      //   result = "[" + reply.split("\n").join(",") + "]";
      // } catch (error) {
      //   console.log("ErrorReply:", error);
      // }

      // console.log("reply >>>>> ", result);
      // Store flashcard in JSON object with question and answer properties

      const replyJSON = JSON.parse(reply);
      console.log("replyJSON >>>>> ", replyJSON);
      replyJSON.forEach((element) => {
        flashcards.push({
          id: flashCardID++,
          flashcard: element,
        });
      });
    } catch (error) {
      console.error("Error:", error);
      // throw error;
      rateLimit(error);
      continue;
    }
    console.log("One Flashcard succesfully generated!");
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  return flashcards;
}

const rateLimit = async (error) => {
  const word = "Rate limit";
  const regex = new RegExp(`\\b${word}\\b`, "i");
  const result = regex.test(error.message);
  if (result === true) {
    console.log("Rate limit, please wait for 20 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 20000));
  } else {
    console.log(error ?? "One Flashcard failed to be generated!");
  }
};

async function generateChatResponse(prompt, pageContent) {
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
      rateLimit(error.response.data);
      // throw error;
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
