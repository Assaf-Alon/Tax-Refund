#!/usr/bin/env python3
"""
import_refined_songs.py

This script imports the refined song metadata from 'new-songs-thorough.tsv' into
'public/data/songs.json'. 

IMPORTANT: This script is only half of the process. The other half was a 
rigorous manual cleanup process applying "AI Judgment" to ensure high-quality 
metadata. 

### SONG LIBRARY CLEANUP STANDARDS (SOP)
To maintain the quality of the Vinyl song library, follow these rules:

1. AI JUDGMENT VS. AUTOMATION:
   - Never rely solely on generic scripts. Always perform a line-by-line audit.
   - Standardize artist names (e.g., replace YouTube channel names with actual artist names).
   - Fix character encoding and remove decorative Japanese characters like 『 』 or ＜ ＞.

2. DEDUPLICATION:
   - Monitor for duplicate songs and YouTube links.
   - If two versions of the same song exist, either keep the best one or clearly 
     distinguish them in the title (e.g., "Song Name (Movie Version)").

3. ANIME ATTRIBUTION:
   - For all Japanese songs, research if they are part of an anime soundtrack.
   - Populate the 'info' field with the series name and the specific role (OP, ED, Insert).
   - numbering is mandatory: Always use 'OP 1', 'ED 2', etc., even if there's only one.

4. ICONIC TIMESTAMPS:
   - Start/End (0-25s): Capture the iconic introduction/hook of the song.
   - AltStart/AltEnd (~30s): Capture the most iconic part of the song, usually the chorus.
   - Research specific chorus start times to ensure the mini-game feels professional.

5. METADATA SCRUBBING:
   - Remove redundant parentheticals like "Song Title (Song Title)".
   - Move context-specific parentheticals (like Saga info for EPIC: The Musical) 
     to the Notes/Info field to keep the Title clean.

USAGE:
    python3 scripts/import_refined_songs.py
"""

import json
import time
import os

TSV_PATH = 'new-songs-thorough.tsv'
JSON_PATH = 'public/data/songs.json'

def import_songs():
    if not os.path.exists(TSV_PATH):
        print(f"Error: {TSV_PATH} not found.")
        return

    # Load existing songs
    try:
        with open(JSON_PATH, 'r', encoding='utf-8') as f:
            songs = json.load(f)
    except Exception as e:
        print(f"Error loading {JSON_PATH}: {e}")
        return

    existing_links = {s.get('youtubeId') for s in songs}
    max_id = 0
    if songs:
        # Some IDs are large timestamps, some are small ints. 
        # We'll use timestamps for new ones to avoid collisions.
        pass 

    new_entries = []
    
    with open(TSV_PATH, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        header = lines[0].strip().split('\t')
        
        for i, line in enumerate(lines[1:]):
            parts = line.strip().split('\t')
            if len(parts) < 9:
                continue
                
            artist = parts[0]
            title = parts[1]
            year = parts[2]
            start = int(parts[3])
            end = int(parts[4])
            alt_start = int(parts[5]) if parts[5] else 0
            alt_end = int(parts[6]) if parts[6] else 0
            category = parts[7]
            link = parts[8]
            notes = parts[9] if len(parts) > 9 else ""
            
            # Extract YouTube ID
            yt_id = link.split('v=')[-1].split('&')[0]
            
            if yt_id in existing_links:
                print(f"Skipping duplicate link: {yt_id} ({title})")
                continue
            
            # Create entry
            # Using timestamp + index to ensure uniqueness for bulk import
            new_id = int(time.time() * 1000) + i
            
            entry = {
                "id": new_id,
                "query": f"{artist} - {title}",
                "info": notes if notes else f"{artist} - {title}",
                "name": f"{artist} - {title}",
                "youtubeId": yt_id,
                "startTime": start,
                "endTime": end,
                "status": "completed",
                "altStartTime": alt_start,
                "altEndTime": alt_end,
                "year": year,
                "category": category
            }
            
            new_entries.append(entry)
            existing_links.add(yt_id)

    if not new_entries:
        print("No new songs to import.")
        return

    songs.extend(new_entries)
    
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(songs, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully imported {len(new_entries)} songs into {JSON_PATH}.")

if __name__ == "__main__":
    import_songs()
