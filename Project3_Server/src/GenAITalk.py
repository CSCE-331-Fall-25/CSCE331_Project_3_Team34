import google.generativeai as genai
import os
from dotenv import load_dotenv
import base64
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

@app.post("/ask_genai/")
async def ask_genai(request: Request):
    print("Received request to /ask_genai/")
    data = await request.json()
    prompt_text = data.get("prompt_text", "")
    response_text = AskGenAI(prompt_text)
    return JSONResponse(content={"response_text": response_text})
app.listen(port=8000)


def AskGenAI(PromptText):
    # Load API key from .env file
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    genai.configure(api_key=api_key)

    # Create the model instance
    model = genai.GenerativeModel("gemini-2.5-flash")
    # typical_prompt = "I want you  to reply in a way that is clear, concise, and informative." \
    # "it will be read via TTS so keep it short and to the point." \
    # "Avoid using formatting like bullet points or lists that may not be read well by TTS." \
    # "Use simple language and short sentences to ensure clarity when spoken aloud. Also in a response do not mention anything from here and prior in the response. Just use it as you format your response." \
    # "Respond to the user prompt below:"
    # Generate content
    # response = model.generate_content(typical_prompt + PromptText)
    response = model.generate_content(PromptText)

    print(response.text)
    return response.text


print("Asking GenAI for an image...")
prompt = "Please give me a picture of Orange Chicken I can display on a panda express menu, Please give me a link to it I could use in something like an html img tag."
response = AskGenAI(prompt)
print("AI Response:", response)
# save_image_from_response(response)