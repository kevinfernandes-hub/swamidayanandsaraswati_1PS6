import gemini_service
import logging

# Configure logging to see output
logging.basicConfig(level=logging.INFO)

def test_analysis():
    print("Testing Gemini Analysis (Backend)...")
    test_prompts = [
        "I have a flat tire",
        "There is smoke coming from my engine",
        "I was in a major accident and need help immediately"
    ]
    
    for prompt in test_prompts:
        print(f"\nPrompt: {prompt}")
        result = gemini_service.analyze_request(prompt)
        if result:
            print(f"Result: {result}")
        else:
            print("Result: None (Likely due to missing API key or error)")

if __name__ == "__main__":
    test_analysis()
