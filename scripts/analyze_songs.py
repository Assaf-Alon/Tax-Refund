import json
import os
from collections import defaultdict

def analyze_songs(data_path):
    if not os.path.exists(data_path):
        # Try to find it if we are running from inside the scripts directory
        if os.path.basename(os.getcwd()) == 'scripts':
            data_path = os.path.join('..', data_path)
        
        if not os.path.exists(data_path):
            print(f"Error: {data_path} not found. Please run from the project root.")
            return

    with open(data_path, 'r', encoding='utf-8') as f:
        songs = json.load(f)

    # stats[year][category] = count
    stats = defaultdict(lambda: defaultdict(int))
    # We ensure these categories appear in the columns even if empty
    fixed_categories = ["Anime", "Popular", "Custom"]
    found_categories = set()
    
    total_songs = len(songs)

    for song in songs:
        year = str(song.get('year', 'Unknown'))
        # Normalize category
        cat = song.get('category', 'Anime')
        if cat == 'Personal':
            cat = 'Custom'
        
        stats[year][cat] += 1
        found_categories.add(cat)

    # Combine fixed categories with any other found ones, maintaining order
    all_categories = fixed_categories[:]
    for cat in sorted(found_categories):
        if cat not in all_categories:
            all_categories.append(cat)

    # Process years
    valid_years = [int(y) for y in stats.keys() if y.isdigit()]
    unknown_years = [y for y in stats.keys() if not y.isdigit()]

    if valid_years:
        min_year = min(valid_years)
        max_year = max(valid_years)
        # Create a range including 0-count years
        display_years = [str(y) for y in range(max_year, min_year - 1, -1)]
    else:
        display_years = []

    # Add unknown years at the end
    display_years.extend(sorted(unknown_years))

    # Print total
    print(f"Song Library Analysis: {data_path}")
    print(f"Total Songs: {total_songs}\n")

    # Header
    cols = [f"{cat:<8}" for cat in all_categories]
    header = f"{'Year':<6} | " + " | ".join(cols) + " | Total"
    print(header)
    print("-" * len(header))

    for year in display_years:
        counts = stats[year]
        year_total = sum(counts.values())
        row_label = year if year else "N/A"
        row_values = [f"{counts.get(cat, 0):<8}" for cat in all_categories]
        row = f"{row_label:<6} | " + " | ".join(row_values) + f" | {year_total}"
        print(row)

def main():
    # Target path relative to project root
    data_path = "public/data/songs.json"
    analyze_songs(data_path)

if __name__ == "__main__":
    main()
