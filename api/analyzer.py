import pandas as pd
import json
import zipfile
import os
import io

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

class InteractionAnalyzer:
    def __init__(self):
        self.unique_drugs = set()
        self.pairwise_interactions = [] # List of dicts matching PairwiseInteraction model
        self.load_data()

    def load_data(self):
        print("Loading datasets...")
        # 1. DDI_data.json
        try:
            with open(os.path.join(DATA_DIR, "DDI_data.json"), "r") as f:
                ddi_data = json.load(f).get("ddi_database", [])
                for item in ddi_data:
                    da = item.get("drug_a", "").lower()
                    db = item.get("drug_b", "").lower()
                    if da and db:
                        self.unique_drugs.add(da)
                        self.unique_drugs.add(db)
                        self.pairwise_interactions.append({
                            "drug_a": da, "drug_b": db,
                            "severity": "MAJOR" if "major" in str(item).lower() else "MODERATE",
                            "mechanism": "Recorded in DDI JSON",
                            "clinical_effect": item.get("clinical_effect", "Unknown"),
                            "management": item.get("management", "Monitor appropriately"),
                            "safer_alternative": "Check alternative options",
                            "source": "DDI JSON database",
                            "from_dataset": "DDI_data"
                        })
        except Exception as e:
            print("DDI load err:", e)

        # 2. ddinter_downloads.csv
        try:
            df_ddi = pd.read_csv(os.path.join(DATA_DIR, "ddinter_downloads.csv"))
            for _, row in df_ddi.iterrows():
                da = str(row.get("Drug_A", "")).lower()
                db = str(row.get("Drug_B", "")).lower()
                if da != "nan" and db != "nan":
                    self.unique_drugs.add(da)
                    self.unique_drugs.add(db)
                    level = str(row.get("Level", "Minor")).upper()
                    self.pairwise_interactions.append({
                        "drug_a": da, "drug_b": db,
                        "severity": level if level in ["MAJOR", "MODERATE", "MINOR"] else "MINOR",
                        "mechanism": "DDInter recorded interaction",
                        "clinical_effect": "Consult literature for specific clinical significance",
                        "management": "Evaluate clinical need",
                        "safer_alternative": "None listed",
                        "source": "DDInter Database",
                        "from_dataset": "DDInter"
                    })
        except Exception as e:
            print("DDInter load err:", e)

        # 3. db_drug_interactions.zip
        try:
            with zipfile.ZipFile(os.path.join(DATA_DIR, "db_drug_interactions.zip"), "r") as z:
                for filename in z.namelist():
                    if filename.endswith(".csv"):
                        with z.open(filename) as f:
                            df_db = pd.read_csv(io.TextIOWrapper(f, 'utf-8'))
                            for _, row in df_db.iterrows():
                                da = str(row.get("Drug 1", "")).lower()
                                db = str(row.get("Drug 2", "")).lower()
                                desc = str(row.get("Interaction Description", ""))
                                if da != "nan" and db != "nan":
                                    self.unique_drugs.add(da)
                                    self.unique_drugs.add(db)
                                    self.pairwise_interactions.append({
                                        "drug_a": da, "drug_b": db,
                                        "severity": "MODERATE", # DB doesn't have strict severity column usually
                                        "mechanism": "DrugBank Interaction",
                                        "clinical_effect": desc,
                                        "management": "Standard DD caution",
                                        "safer_alternative": "None",
                                        "source": "DrugBank Database",
                                        "from_dataset": "manual"
                                    })
        except Exception as e:
            print("DB load err:", e)
        
        self.drug_list = sorted(list(self.unique_drugs))
        print(f"Loaded {len(self.drug_list)} unique drugs and {len(self.pairwise_interactions)} interactions.")

    def search(self, query):
        q = query.lower()
        return [d for d in self.drug_list if q in d][:50]
        
    def analyze(self, active_drugs):
        active_set = set(d.lower() for d in active_drugs)
        
        # Cross reference pairwise
        results = []
        for p in self.pairwise_interactions:
            if p["drug_a"] in active_set and p["drug_b"] in active_set:
                results.append(p)
                
        # Calculate risk summary
        major = sum(1 for r in results if r["severity"] == "MAJOR")
        mod = sum(1 for r in results if r["severity"] == "MODERATE")
        minr = sum(1 for r in results if r["severity"] == "MINOR")
        
        overall = "LOW"
        if results: overall = "MODERATE"
        if major > 0: overall = "HIGH"
        
        # Build simple graph
        nodes = [{"id": d, "group": "drug", "label": d} for d in active_drugs]
        links = []
        for r in results:
            links.append({
                "source": r["drug_a"],
                "target": r["drug_b"],
                "type": "direct",
                "severity": r["severity"],
                "evidence": "A",
                "cascade": False
            })
            
        return {
            "cascade_paths": [],
            "pairwise": results,
            "overall_risk": overall,
            "graph_json": {"nodes": nodes, "links": links},
            "risk_summary": {
                "major_pairwise": major,
                "moderate_pairwise": mod,
                "minor_pairwise": minr,
                "cascade_inhibition": 0,
                "cascade_induction": 0,
                "cascade_competition": 0,
                "total_cascade_risk": 0
            },
            "patient_risk_factors": ["Polypharmacy (Check renal function)"]
        }
