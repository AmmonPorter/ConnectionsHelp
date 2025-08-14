import requests
import json
from datetime import datetime

def fetch_and_save_puzzle():
    """
    Fetches the latest Connections puzzle data from an alternative source
    and saves the words to a JSON file.
    """
    try:
        # A more reliable, unofficial source for Connections data
        url = "https://connections.swellgarfo.com/nyt/latest"
        
        # Add a User-Agent header to mimic a browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        # Make the request to the URL with the headers
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes

        # Parse the JSON data from the response
        data = response.json()

        # The words are in the 'startingWords' key
        words = data.get("startingWords", [])
        
        if not words:
            print("Could not find 'startingWords' in the response from the new source.")
            return

        # Prepare the data to be saved
        output_data = {"words": words}

        # Save the words to a file named puzzle.json
        with open("puzzle.json", "w") as f:
            json.dump(output_data, f, indent=2)

        today_str = data.get("print_date", "today")
        print(f"Successfully fetched and saved {len(words)} words for {today_str}.")

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}. Response text: {response.text}")
    except KeyError as e:
        print(f"Error parsing JSON data: Missing key {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    fetch_and_save_puzzle()
