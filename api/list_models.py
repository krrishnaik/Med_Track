import requests

GROQ_API_KEY = "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"

headers = {
    "Authorization": f"Bearer {GROQ_API_KEY}"
}

response = requests.get("https://api.groq.com/openai/v1/models", headers=headers)
models = response.json().get("data", [])
for m in models:
    print(m["id"])
