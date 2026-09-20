import os
import sys
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]

def authenticate_google_drive(credentials_path: str = None):
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    credentials_path = credentials_path or os.path.join(root_dir, "credentials.json")
    token_path = os.path.join(root_dir, "token.json")

    if not os.path.exists(credentials_path):
        print("=" * 60)
        print("AUTHENTICATION SETUP REQUIRED")
        print("=" * 60)
        print(f"Could not find: {credentials_path}")
        print("\nTo authenticate with your Google Account:")
        print("1. In Google Cloud Console, go to: APIs & Services -> Credentials")
        print("2. Click 'Create Credentials' -> 'OAuth client ID'")
        print("3. Application type: Choose 'Desktop app'")
        print("4. Name it 'PhotoFinder Desktop' and click Create")
        print("5. Click 'Download JSON' and save it as 'credentials.json' in this project folder:")
        print(f"   {root_dir}\\credentials.json")
        print("6. Run this command again: python -m worker.auth_drive")
        print("=" * 60)
        sys.exit(1)

    print("\nStarting Google Drive authorization flow...")
    print("A browser window will open automatically. Sign in with your Google account and grant Read-Only access to Drive.\n")

    try:
        flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
        creds = flow.run_local_server(port=0)

        with open(token_path, "w", encoding="utf-8") as token_file:
            token_file.write(creds.to_json())

        print("\n" + "=" * 60)
        print("SUCCESS! Google Drive authentication complete!")
        print(f"Saved token to: {token_path}")
        print("The backend and worker can now access your Google Drive photos seamlessly.")
        print("=" * 60)
    except Exception as e:
        print(f"\nAuthentication failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    authenticate_google_drive()
