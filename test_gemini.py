from google import genai
import os

client = genai.Client(
    api_key=os.environ["GEMINI_API_KEY"]
)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="""
    Explain AI Agents in Vietnamese.
    Give 3 examples related to Accounting and Data Analytics.
    """
)

print(response.text)