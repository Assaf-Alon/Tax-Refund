import json
import csv
import os
import argparse

# Paths relative to project root
INPUT_FILE = "public/data/songs.json"
DEFAULT_OUTPUT_FILE = "scripts/songs.csv"

def convert(category=None):
    """
    Reads public/data/songs.json and exports it to CSV.
    Optionally filters by category.
    """
    # Determine the project root path if script is run from scripts/ directory
    current_dir = os.getcwd()
    if os.path.basename(current_dir) == "scripts":
        # If we are in scripts/, go up one level to find public/
        project_root = os.path.dirname(current_dir)
    else:
        project_root = current_dir

    input_path = os.path.join(project_root, INPUT_FILE)
    
    if category:
        output_file = f"scripts/songs_{category.lower()}.csv"
    else:
        output_file = DEFAULT_OUTPUT_FILE
        
    output_path = os.path.join(project_root, output_file)

    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found.")
        print(f"Current working directory: {current_dir}")
        return

    print(f"Loading data from {input_path}...")
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading JSON: {e}")
        return

    if not data or not isinstance(data, list):
        print("Error: JSON is empty or not a list of songs.")
        return

    # Filter by category if provided
    if category:
        print(f"Filtering for category: {category}")
        data = [s for s in data if s.get('category', '').lower() == category.lower()]
        if not data:
            print(f"No songs found for category '{category}'")
            return

    # Extract all unique field names from the list of objects
    headers = set()
    for item in data:
        headers.update(item.keys())
    
    fieldnames = sorted(list(headers))

    print(f"Exporting {len(data)} songs to {output_path}...")
    try:
        with open(output_path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
        
        print(f"Success!")
    except Exception as e:
        print(f"Error writing CSV: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export songs from JSON to CSV.")
    parser.add_argument("-c", "--category", help="Filter by category (e.g., Anime, Popular, Custom)", type=str)
    args = parser.parse_args()

    convert(category=args.category)
