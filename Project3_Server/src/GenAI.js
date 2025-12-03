import {GoogleGenerativeAI} from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.key;
const client = new GoogleGenerativeAI(apiKey);
const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
// Store chat history per user
const userChatHistories = new Map(); // username -> array of { user, role, content }

function getChatHistory(username) {
  if (!userChatHistories.has(username)) {
    userChatHistories.set(username, []);
  }
  return userChatHistories.get(username);
}

// Function to chat with the GenAI model and save history
// Pass in username of signed-in user
async function chatWithAI(username, prompt) {
  console.log("Sending prompt to GenAI:", prompt);

  const history = getChatHistory(username);
  history.push({ user: username, role: "user", content: prompt });

  try {
    const result = await model.generateContent(prompt);
    const reply = result.response.text(); 
    console.log("Received reply from GenAI:", reply);
    //history.push({ user: username, role: "genai", content: reply });

    return reply;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export { chatWithAI, getChatHistory };