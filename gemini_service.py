import os
import json
import logging
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
load_dotenv(".env.local")

# Configure logging
logger = logging.getLogger(__name__)

# Initialize Gemini
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")

if api_key and api_key != "PLACEHOLDER_API_KEY":
    try:
        genai.configure(api_key=api_key)
        # Using a reliable model version from the available list
        model = genai.GenerativeModel('gemini-3-flash-preview')
        logger.info("Gemini AI configured successfully on the backend.")
    except Exception as e:
        logger.error(f"Failed to configure Gemini AI: {e}")
        model = None
else:
    logger.warning("Gemini API key not found or is a placeholder. LLM features will be disabled.")
    model = None

def analyze_request(user_text: str):
    """
    Analyzes a roadside assistance request using Gemini LLM.
    Returns a dictionary with issueType, severity, and suggestedAction.
    """
    if not model:
        return None

    prompt = f"""
    The user is in a roadside emergency in India. The description provided is: "{user_text}".
    
    Categorize the issue and determine severity.
    Provide a suggested action for the user.
    
    Return the result EXACTLY in this JSON format:
    {{
        "issueType": "one of [Tyre, Battery, Engine, Accident, General]",
        "severity": "one of [Low, Medium, High, Critical]",
        "suggestedAction": "brief advice for the user"
    }}
    """

    try:
        response = model.generate_content(prompt)
        # Extract JSON from response text (handling potential markdown wrapping)
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()
        
        result = json.loads(text)
        return result
    except Exception as e:
        logger.error(f"Gemini analysis failed: {e}")
        return None
