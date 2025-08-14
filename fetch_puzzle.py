import requests
import json
from datetime import datetime

def fetch_and_save_puzzle():
    """
    Fetches the latest Connections puzzle data and saves the words to a JSON file.
    """
    try:
        # The URL for the source that provides Connections data.
        # We fetch the data for the current date.
        today_str = datetime.now().strftime("%Y-%m-%d")
        url = f"https://www.nytimes.com/svc/connections/v2/{today_str}.json"

        # Make the request to the URL.
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)

        # Parse the JSON data from the response.
        data = response.json()

        # The words are in the 'startingWords' key.
        words = data.get("startingWords", [])
        
        if not words:
            print("Could not find 'startingWords' in the response.")
            return

        # Prepare the data to be saved.
        output_data = {"words": words}

        # Save the words to a file named puzzle.json.
        with open("puzzle.json", "w") as f:
            json.dump(output_data, f, indent=2)

        print(f"Successfully fetched and saved {len(words)} words for {today_str}.")

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
    except KeyError as e:
        print(f"Error parsing JSON data: Missing key {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    fetch_and_save_puzzle()
