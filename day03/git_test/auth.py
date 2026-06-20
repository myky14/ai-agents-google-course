import os
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

# Google OAuth2 scopes required for user profile and email access
SCOPES = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
]

def login():
    """
    Performs Google OAuth2 authentication using client credentials.
    Saves the user session token locally for subsequent requests.
    """
    creds = None
    token_path = 'token.json'
    client_secrets_path = 'credentials.json'
    
    # Load cached tokens if they exist
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
        
    # Re-authenticate if credentials are missing or invalid
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("Refreshing expired Google credentials...")
            creds.refresh(Request())
        else:
            if not os.path.exists(client_secrets_path):
                raise FileNotFoundError(
                    f"Required Google client secrets file '{client_secrets_path}' not found."
                )
            print("Starting local OAuth web server for Google login...")
            flow = InstalledAppFlow.from_client_secrets_file(client_secrets_path, SCOPES)
            creds = flow.run_local_server(port=0)
            
        # Cache credentials for subsequent authorizations
        with open(token_path, 'w') as token_file:
            token_file.write(creds.to_json())
            
    print("Google authentication successful.")
    return creds

