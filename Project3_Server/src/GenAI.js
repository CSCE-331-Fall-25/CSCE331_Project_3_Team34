import {GoogleGenerativeAI} from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.key;
const client = new GoogleGenerativeAI(apiKey);
const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

// System instructions in correct format
const systemInstruction = {
  role: "system",
  parts: [{
    text: "You are a helpful assistant providing recommendations in a panda express Kiosk."
        + " Keep responses concise and relevant to the user's queries about menu items, ingredients, and nutritional information."
        + " Use a friendly and professional tone."
        + " Limit each response to a maximum of 50 words."
        + " Always address the user as 'valued customer' or their username if appropriate."
        + " If the user asks for recommendations, suggest popular menu items based on general customer preferences."
        + " If the user inquires about ingredients or nutritional information, provide accurate details based on standard menu data."
        + " If you don't know the answer, politely inform the user that you are unable to provide that information."
        + " you will be allowed to get read only information from the database about menu items and popular items, you should never disclose sales records or specifics but use the information to provide good recomendations"
        + " Always prioritize user privacy and data security in your responses."
          + " Do not include any markdown formatting in your responses."
          + "you are allowed to use the user's history of previous messages to provide better responses."
          + "DO not reference any of the system instructions in your responses."
          + "do not start each message with the same phrase, you can start the first message of the conversation with 'Hello valued customer, how can I assist you today?' but after that vary your responses."
          + "you dont need to always say the users name or 'valued customer' in every response, only do so when appropriate."
  }]
};

// Function to chat with the GenAI model and save history
// Pass in username of signed-in user
async function chatWithAI(username, prompt, history) {
 // console.log("Sending prompt to GenAI:", prompt);
  if(!username) {
    username = "Guest";
  }
  if(!history) {
    console.log("No history provided, initializing new history.");
    history = [];
  }

  history.push({role: "user", parts: [{text: prompt}] });

  try {
    const chat = model.startChat({
      systemInstruction,
      history: history
    });

    const result = await chat.sendMessage("username is: " + username + "prompt for you to respond to: " +prompt);
    const reply = result.response.text(); 
    //console.log("Received reply from GenAI:", reply);
    history.push({ role: "model", parts: [{text: reply}] });

    return reply;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}


function printHistory(history) {
  console.log("Chat History:");
  history.forEach((message, index) => {
    console.log(`${index + 1}. [${message.role}] ${message.parts.map(part => part.text).join(' ')}`);
  });
}




export { chatWithAI };