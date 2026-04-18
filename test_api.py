from data_parser import store

max_int = 0
max_drug = ""
for drug in store.drug_list:
    res = store.get_drug_interactions(drug)
    sz = len(res["interactions"])
    if sz > max_int:
        max_int = sz
        max_drug = drug

print(f"Max interactions: {max_int} for {max_drug}")
