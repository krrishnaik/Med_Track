import json
import zipfile
import os
import csv
import io

data_dir = "/home/shrav/Desktop/Med-Track/backend/data"

unique_drugs = set()

# 1. DDI_data.json
try:
    with open(os.path.join(data_dir, "DDI_data.json"), "r") as f:
        ddi_data = json.load(f).get("ddi_database", [])
        for item in ddi_data:
            unique_drugs.add(item.get("drug_a").lower())
            unique_drugs.add(item.get("drug_b").lower())
    print(f"Loaded DDI_data.json. Unique drugs so far: {len(unique_drugs)}")
except Exception as e:
    print(f"Error loading JSON: {e}")

# 2. ddinter_downloads.csv
try:
    with open(os.path.join(data_dir, "ddinter_downloads.csv"), "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("Drug_A"): unique_drugs.add(row["Drug_A"].lower())
            if row.get("Drug_B"): unique_drugs.add(row["Drug_B"].lower())
    print(f"Loaded ddinter. Unique drugs so far: {len(unique_drugs)}")
except Exception as e:
    print(f"Error loading ddinter: {e}")

# 3. db_drug_interactions.csv (inside zip)
try:
    with zipfile.ZipFile(os.path.join(data_dir, "db_drug_interactions.zip"), "r") as z:
        for filename in z.namelist():
            if filename.endswith(".csv"):
                with z.open(filename) as f:
                    reader = csv.DictReader(io.TextIOWrapper(f, 'utf-8'))
                    print("DB columns:", reader.fieldnames)
                    for row in reader:
                        for col in ['drug1', 'drug2', 'drug_a', 'drug_b']:
                            if col in row and row[col]:
                                unique_drugs.add(row[col].lower())
                    print(f"Loaded zip {filename}. Unique drugs so far: {len(unique_drugs)}")
except Exception as e:
    print(f"Error loading zip: {e}")

print(f"Total Unique Drugs: {len(unique_drugs)}")
