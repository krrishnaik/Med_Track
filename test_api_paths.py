import urllib.request
import urllib.parse
import json

try:
    with urllib.request.urlopen("http://localhost:5000/api/library/index") as res:
        data = json.loads(res.read())
        letters = data["letters"]
        
        for k, v in list(letters.items())[:3]:
            # take 2 drugs from each letter
            for drug in v[:2]:
                url = f"http://localhost:5000/api/library/drug/{urllib.parse.quote(drug)}"
                print(f"Requesting: {url}")
                with urllib.request.urlopen(url) as d_res:
                    d_data = json.loads(d_res.read())
                    print(f" -> Result for {drug}: {len(d_data.get('interactions', []))} interactions")
except Exception as e:
    print(f"Error: {e}")
