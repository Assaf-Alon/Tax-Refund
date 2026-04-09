import json
import subprocess
import sys
import os

JSON_PATH = "public/data/anime_songs.json"

def get_release_year(youtube_id):
    if not youtube_id:
        return ""
    
    try:
        # Fetch copyright, platform release date, and upload date
        result = subprocess.run(
            ["yt-dlp", "--print", "release_year,release_date,upload_date", "--", youtube_id],
            capture_output=True,
            text=True,
            check=True
        )
        lines = result.stdout.strip().split('\n')
        
        years = []
        for line in lines:
            if line != "NA" and len(line) >= 4:
                years.append(int(line[:4]))

        if years:
            return str(min(years))
    except subprocess.CalledProcessError:
        print(f"Failed to fetch metadata for {youtube_id}")
    except FileNotFoundError:
        print("Error: yt-dlp not found. Please install it with 'pip install yt-dlp' or 'sudo apt install yt-dlp'")
        sys.exit(1)
        
    return ""

def main():
    if not os.path.exists(JSON_PATH):
        print(f"Error: {JSON_PATH} not found.")
        return

    print(f"Loading {JSON_PATH}...")
    with open(JSON_PATH, "r") as f:
        songs = json.load(f)

    updated_count = 0
    total_with_id = sum(1 for s in songs if s.get("youtubeId"))
    
    print(f"Found {len(songs)} songs ({total_with_id} with YouTube IDs).")

    for i, song in enumerate(songs):
        youtube_id = song.get("youtubeId")
        current_year = song.get("year")
        
        # Only fetch if we have an ID and no year
        if youtube_id and not current_year:
            print(f"[{i+1}/{len(songs)}] Fetching year for: {song.get('name')} ({youtube_id})...")
            year = get_release_year(youtube_id)
            if year:
                song["year"] = year
                updated_count += 1
                # Save periodically to avoid losing progress
                if updated_count % 10 == 0:
                    with open(JSON_PATH, "w") as f:
                        json.dump(songs, f, indent=2)

    # Final save
    with open(JSON_PATH, "w") as f:
        json.dump(songs, f, indent=2)

    print(f"Finished! Updated {updated_count} entries.")

if __name__ == "__main__":
    main()
