import os
import requests
import re
import json
from urllib.parse import urlparse, urljoin

# Directory to save the icons
ICON_DIR = "public/icons"
SERVICES_JSON_PATH = "public/services.json"

# Create the icons directory if it doesn't exist
if not os.path.exists(ICON_DIR):
    os.makedirs(ICON_DIR)

# User agent to mimic a web browser
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}

def sanitize_filename(filename):
    """Sanitizes a string to be a valid filename."""
    return re.sub(r'[^a-zA-Z0-9_.-]', '', filename)

def download_favicon(service_name, service_url, is_second_attempt=False):
    """Downloads the favicon for a given service."""
    print(f"Downloading favicon for {service_name.capitalize()} from {service_url}...")
    try:
        # Construct the favicon URL
        parsed_url = urlparse(service_url)
        base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
        favicon_url = f"{base_url}/favicon.ico" if not is_second_attempt else service_url

        # Make a request to the favicon URL
        response = requests.get(favicon_url, headers=HEADERS, timeout=10)
        
        # Check if the request was successful
        if response.status_code == 200 and 'image' in response.headers.get('Content-Type', ''):
            # Create a sanitized filename
            filename = sanitize_filename(f"{service_name.lower()}.ico")
            file_path = os.path.join(ICON_DIR, filename)
            
            # Save the image data to a file
            with open(file_path, 'wb') as f:
                f.write(response.content)
            print(f"Successfully downloaded icon for {service_name.capitalize()} to {file_path}")
            return f"/icons/{filename}"

        if not is_second_attempt:
            print(f"Attempting to find icon in HTML for {service_name.capitalize()}...")
            # request the base website and see if there is an icon in the head tag
            response = requests.get(service_url, headers=HEADERS, timeout=10)
            if response.status_code == 200:
                # get <link rel="icon" type="image/png" href="images/qbittorrent32.png"> tag
                icon_match = re.search(r'<link\s+rel=["\'](?:shortcut )?icon["\']\s+type=["\']image\/[^"\']+["\']\s+href=["\']([^"\']+)["\']', response.text, re.IGNORECASE)
                if icon_match:
                    icon_url = icon_match.group(1)
                    print(f"Found icon URL in HTML: {icon_url}")
                    # If the icon URL is relative, make it absolute
                    if not urlparse(icon_url).netloc:
                        icon_url = urljoin(service_url, icon_url)
                    # Download the icon
                    return download_favicon(service_name, icon_url, is_second_attempt=True)
        else:
            print(f"Could not find a valid favicon for {service_name.capitalize()} at {favicon_url}. Status code: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Error downloading favicon for {service_name.capitalize()}: {e}")
        return None

def main():
    """Main function to run the download process."""
    print("Starting favicon download script...")
    
    # Check if the services.json file exists
    if not os.path.exists(SERVICES_JSON_PATH):
        print(f"Error: {SERVICES_JSON_PATH} not found. Please create the file first.")
        return

    try:
        with open(SERVICES_JSON_PATH, 'r') as f:
            services_data = json.load(f)
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON format in {SERVICES_JSON_PATH}.")
        return
    except Exception as e:
        print(f"Error reading {SERVICES_JSON_PATH}: {e}")
        return
        
    for service in services_data:
        print(f"Processing service: {service['name']}")
        # check is service.imageUrl path doesn't already exist
        if 'imageUrl' in service and service['imageUrl']:
            image_path = os.path.join(ICON_DIR, os.path.basename(service['imageUrl']))
            if os.path.exists(image_path):
                print(f"Icon for {service['name'].capitalize()} already exists at {image_path}. Skipping download.")
                continue

        download_favicon(service['name'], service['url'])
    
    print("\nDownload process finished.")

if __name__ == "__main__":
    main()
