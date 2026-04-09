import json
import os

def find_songs_for_phrase(phrase, data_path):
    with open(data_path, 'r', encoding='utf-8') as f:
        songs = json.load(f)
    
    phrase = phrase.lower().replace(" ", "")
    results = {}
    
    for char in sorted(set(phrase)):
        matches = []
        for song in songs:
            name = song.get('name', '')
            artist = "Unknown"
            song_title = name

            if " - " in name:
                parts = name.split(" - ", 1)
                artist = parts[0].strip()
                song_title = parts[1].strip()
            
            # Check song title
            if song_title.lower().startswith(char):
                matches.append({
                    "type": "Song",
                    "text": song_title,
                    "full": name,
                    "info": song.get('info', '')
                })
            # Check artist name
            elif artist.lower().startswith(char):
                 matches.append({
                    "type": "Artist",
                    "text": artist,
                    "full": name,
                    "info": song.get('info', '')
                })
        results[char] = matches

    return results

def main():
    phrase = "Lovers Bench"
    data_path = "public/data/anime_songs.json"
    
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return

    options = find_songs_for_phrase(phrase, data_path)
    
    print(f"Options for phrase: '{phrase}'\n")
    
    for char in phrase.lower():
        if char == " ":
            print("--- SPACE ---")
            continue
            
        print(f"Letter: {char.upper()}")
        matches = options.get(char, [])
        if not matches:
            print("  No matches found")
        else:
            # Show top unique full names
            seen = set()
            count = 0
            for m in matches:
                if m['full'] not in seen:
                    print(f"  - [{m['type']}] {m['full']} ({m['info']})")
                    seen.add(m['full'])
                    count += 1
                if count >= 8:
                    break
        print()

if __name__ == "__main__":
    main()
