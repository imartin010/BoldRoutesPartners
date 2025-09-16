import pandas as pd
import json

def read_commissions():
    try:
        # Read the Excel file
        df = pd.read_excel('brdata_processor/processed_data/BR Commissions.xlsx')
        
        print("Commission rates structure:")
        print("Columns:", df.columns.tolist())
        print("\nFirst few rows:")
        print(df.head())
        print("\nData types:")
        print(df.dtypes)
        print("\nFull data:")
        print(df.to_string())
        
        # Convert to JSON for easier handling
        commissions_data = df.to_dict('records')
        
        with open('commissions_data.json', 'w', encoding='utf-8') as f:
            json.dump(commissions_data, f, indent=2, ensure_ascii=False)
        
        print(f"\nSaved {len(commissions_data)} commission records to commissions_data.json")
        
    except Exception as e:
        print(f"Error reading Excel file: {e}")

if __name__ == "__main__":
    read_commissions()





