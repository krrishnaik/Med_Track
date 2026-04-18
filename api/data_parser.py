import json
import zipfile
import os
import csv
import io
import re

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

# ─── Pre-compiled patterns → clinical outcomes ──────────────────────────────
_RAW_OUTCOMES = [
    (r"warfarin|coumadin|apixaban|rivaroxaban|dabigatran|heparin|enoxaparin",
     "Bleeding, hemorrhagic stroke, or death"),
    (r"ibuprofen|naproxen|aspirin|diclofenac|celecoxib|indomethacin|ketorolac",
     "Gastrointestinal bleeding, renal failure, or cardiovascular event"),
    (r"morphine|oxycodone|fentanyl|hydrocodone|codeine|tramadol|buprenorphine|methadone|hydromorphone",
     "Respiratory depression, loss of consciousness, or fatal overdose"),
    (r"diazepam|lorazepam|alprazolam|clonazepam|midazolam|temazepam|zolpidem|zopiclone",
     "Sedation, respiratory arrest, or coma"),
    (r"fluoxetine|sertraline|escitalopram|paroxetine|venlafaxine|duloxetine|phenelzine|tranylcypromine|linezolid",
     "Serotonin syndrome — agitation, hyperthermia, seizures, or death"),
    (r"haloperidol|quetiapine|risperidone|olanzapine|clozapine|aripiprazole|ziprasidone",
     "QT interval prolongation, cardiac arrhythmia, or sudden death"),
    (r"simvastatin|atorvastatin|rosuvastatin|lovastatin|pravastatin|fluvastatin",
     "Rhabdomyolysis (muscle breakdown), acute kidney failure, or liver damage"),
    (r"clarithromycin|erythromycin|azithromycin|ciprofloxacin|levofloxacin|metronidazole",
     "QT prolongation, cardiac arrhythmia, or tendon rupture"),
    (r"fluconazole|itraconazole|voriconazole|ketoconazole|posaconazole",
     "Drug level elevation, liver toxicity, or cardiac arrest"),
    (r"cyclosporine|tacrolimus|sirolimus|mycophenolate|azathioprine",
     "Nephrotoxicity, infection, or organ rejection"),
    (r"methotrexate|cyclophosphamide|cisplatin|doxorubicin|paclitaxel|vincristine|capecitabine|fluorouracil",
     "Bone marrow suppression, fatal infection, organ failure, or cancer progression"),
    (r"phenytoin|carbamazepine|valproate|valproic|phenobarbital|levetiracetam|lamotrigine|topiramate",
     "Loss of seizure control, liver failure, or Stevens-Johnson syndrome"),
    (r"metoprolol|atenolol|propranolol|bisoprolol|carvedilol|labetalol|nadolol",
     "Bradycardia, heart block, or cardiogenic shock"),
    (r"lisinopril|enalapril|ramipril|captopril|losartan|valsartan|irbesartan|candesartan",
     "Hyperkalemia, acute kidney injury, or anaphylaxis"),
    (r"insulin|metformin|glipizide|glyburide|glimepiride|sitagliptin|empagliflozin|liraglutide",
     "Hypoglycemia, lactic acidosis, or diabetic ketoacidosis"),
    (r"digoxin|digitoxin",
     "Digoxin toxicity — fatal arrhythmias, complete heart block, or cardiac arrest"),
    (r"lithium",
     "Lithium toxicity — seizures, tremors, renal failure, or death"),
    (r"levothyroxine|liothyronine|methimazole|propylthiouracil",
     "Thyroid crisis, cardiac arrhythmia, or agranulocytosis"),
    (r"abacavir|tenofovir|emtricitabine|efavirenz|lopinavir|ritonavir|atazanavir|darunavir",
     "Hypersensitivity reaction, lactic acidosis, or liver failure"),
    (r"clopidogrel|prasugrel|ticagrelor|dipyridamole",
     "Uncontrolled bleeding, hemorrhagic stroke, or thrombocytopenia"),
    (r"omeprazole|esomeprazole|pantoprazole|lansoprazole|rabeprazole",
     "Magnesium depletion, bone fractures, or C. difficile infection"),
    (r"furosemide|hydrochlorothiazide|spironolactone|torsemide|bumetanide|chlorthalidone",
     "Electrolyte imbalance, renal failure, or cardiac arrhythmia"),
    (r"prednisone|prednisolone|dexamethasone|hydrocortisone|methylprednisolone|budesonide",
     "Adrenal crisis, immunosuppression, or infection"),
    (r"amlodipine|nifedipine|diltiazem|verapamil|felodipine|nicardipine",
     "Hypotension, heart failure, or fatal bradycardia"),
    (r"amiodarone|flecainide|propafenone|sotalol|dronedarone",
     "Torsades de pointes, pulmonary toxicity, or fatal ventricular fibrillation"),
    (r"baclofen|cyclobenzaprine|carisoprodol|methocarbamol|tizanidine",
     "CNS depression, respiratory failure, or seizures"),
    (r"rifampin|rifampicin|isoniazid|ethambutol|pyrazinamide",
     "Hepatotoxicity, liver failure, or peripheral neuropathy"),
]

# Compile once at import time
COMPILED_OUTCOMES = [(re.compile(pat, re.IGNORECASE), outcome) for pat, outcome in _RAW_OUTCOMES]

_SEVERITY_FALLBACK = {
    "Major":    "Potentially life-threatening interaction — risk of hospitalization or death",
    "Moderate": "Clinically significant interaction — may cause serious organ strain or toxicity",
    "Minor":    "Mild interaction — possible side effects; monitor closely",
}


def infer_clinical_outcome(drug_a: str, drug_b: str, severity: str) -> str:
    combined = drug_a + " " + drug_b  # no .lower() here — regex is IGNORECASE
    for pattern, outcome in COMPILED_OUTCOMES:
        if pattern.search(combined):
            return outcome
    return _SEVERITY_FALLBACK.get(severity, "Monitor for unexpected side effects")


class DrugDatasetStore:
    def __init__(self):
        self.unique_drugs: set[str] = set()
        self.pairwise_interactions: list[dict] = []
        self.load_data()

    def load_data(self):
        print("Loading datasets…")

        # ── 1. DDI_data.json (richest source) ────────────────────────────────
        try:
            with open(os.path.join(DATA_DIR, "DDI_data.json"), "r") as f:
                ddi_data = json.load(f).get("ddi_database", [])
            for item in ddi_data:
                da = str(item.get("drug_a", "")).strip().title()
                db = str(item.get("drug_b", "")).strip().title()
                if not da or not db:
                    continue
                severity        = item.get("severity", "Moderate").strip().title()
                clinical_effect = str(item.get("clinical_effect", "")).strip()
                mechanism       = str(item.get("mechanism", "")).strip()
                consequence     = clinical_effect or infer_clinical_outcome(da, db, severity)
                self.unique_drugs.update([da, db])
                self.pairwise_interactions.append({
                    "drug_a": da, "drug_b": db,
                    "severity": severity,
                    "desc": clinical_effect,
                    "consequence": consequence,
                    "mechanism": mechanism,
                })
        except Exception as e:
            print(f"  DDI_data.json: {e}")

        # ── 2. ddinter_downloads.csv ──────────────────────────────────────────
        try:
            with open(os.path.join(DATA_DIR, "ddinter_downloads.csv"), "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    da    = str(row.get("Drug_A", "")).strip().title()
                    db    = str(row.get("Drug_B", "")).strip().title()
                    level = str(row.get("Level",  "Minor")).strip().title()
                    if not da or not db:
                        continue
                    consequence = infer_clinical_outcome(da, db, level)
                    self.unique_drugs.update([da, db])
                    self.pairwise_interactions.append({
                        "drug_a": da, "drug_b": db,
                        "severity": level,
                        "desc": "",
                        "consequence": consequence,
                        "mechanism": "",
                    })
        except Exception as e:
            print(f"  ddinter_downloads.csv: {e}")

        # ── 3. db_drug_interactions.zip ───────────────────────────────────────
        try:
            with zipfile.ZipFile(os.path.join(DATA_DIR, "db_drug_interactions.zip"), "r") as z:
                for filename in z.namelist():
                    if not filename.endswith(".csv"):
                        continue
                    with z.open(filename) as f:
                        reader = csv.DictReader(io.TextIOWrapper(f, encoding="utf-8", errors="replace"))
                        for row in reader:
                            da       = str(row.get("Drug 1", "")).strip().title()
                            db       = str(row.get("Drug 2", "")).strip().title()
                            raw_desc = str(row.get("Interaction Description", "")).strip()
                            if not da or not db:
                                continue
                            low = raw_desc.lower()
                            severity = "Major" if any(
                                w in low for w in
                                ["death", "fatal", "severe", "life-threatening", "hemorrhage", "toxicity"]
                            ) else "Moderate"
                            consequence = infer_clinical_outcome(da, db, severity)
                            self.unique_drugs.update([da, db])
                            self.pairwise_interactions.append({
                                "drug_a": da, "drug_b": db,
                                "severity": severity,
                                "desc": (raw_desc[:200] + "…") if len(raw_desc) > 200 else raw_desc,
                                "consequence": consequence,
                                "mechanism": "",
                            })
        except Exception as e:
            print(f"  db_drug_interactions.zip: {e}")

        self.drug_list = sorted(self.unique_drugs)
        print(f"Loaded {len(self.drug_list)} drugs and {len(self.pairwise_interactions)} interactions.")

    # ── Public API ─────────────────────────────────────────────────────────────

    def get_all_drugs(self) -> list[str]:
        return self.drug_list

    def get_drug_interactions(self, drug_name: str) -> dict:
        needle = drug_name.strip().lower()
        interactions = []
        for p in self.pairwise_interactions:
            if p["drug_a"].lower() == needle:
                interactions.append({
                    "drug":        p["drug_b"],
                    "severity":    p["severity"],
                    "consequence": p["consequence"],
                    "desc":        p["desc"],
                    "mechanism":   p["mechanism"],
                })
            elif p["drug_b"].lower() == needle:
                interactions.append({
                    "drug":        p["drug_a"],
                    "severity":    p["severity"],
                    "consequence": p["consequence"],
                    "desc":        p["desc"],
                    "mechanism":   p["mechanism"],
                })

        _sev = {"Major": 0, "Moderate": 1, "Minor": 2}
        interactions.sort(key=lambda x: (_sev.get(x["severity"], 3), x["drug"]))

        return {
            "drug":        drug_name.title(),
            "interactions": interactions[:50],
            "total_count": len(interactions),
        }


# Singleton — loaded once when the module is first imported
store = DrugDatasetStore()
