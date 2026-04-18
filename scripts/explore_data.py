import pandas as pd
import json
import zipfile
import os

data_dir = "/home/shrav/Desktop/Med-Track/backend/data"

unique_drugs = set()

# 1. DDI_data.json
try:
    with open(os.path.join(data_dir, "DDI_data.json"), "r") as f:
        ddi_data = json.load(f).get("ddi_database", [])
        for item in ddi_data:
            unique_drugs.add(item.get("drug_a"))
            unique_drugs.add(item.get("drug_b"))
    print(f"Loaded DDI_data.json. Unique drugs so far: {len(unique_drugs)}")
except Exception as e:
    print(f"Error loading JSON: {e}")

# 2. ddinter_downloads.csv
try:
    df_ddi = pd.read_csv(os.path.join(data_dir, "ddinter_downloads.csv"))
    unique_drugs.update(df_ddi["Drug_A"].dropna().tolist())
    unique_drugs.update(df_ddi["Drug_B"].dropna().tolist())
    print(f"Loaded ddinter. Unique drugs so far: {len(unique_drugs)}")
except Exception as e:
    print(f"Error loading ddinter: {e}")

# 3. db_drug_interactions.csv (inside zip)
try:
    with zipfile.ZipFile(os.path.join(data_dir, "db_drug_interactions.zip"), "r") as z:
        for filename in z.namelist():
            with z.open(filename) as f:
                df_db = pd.read_csv(f)
                # assuming columns might be 'drug1', 'drug2' or similar
                print("DB columns:", df_db.columns.tolist())
                # unique_drugs.update(...)
except Exception as e:
    print(f"Error loading zip: {e}")

print(f"Total Unique Drugs: {len(unique_drugs)}")
