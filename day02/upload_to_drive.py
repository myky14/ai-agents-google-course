import argparse
import os
import mimetypes
import google.auth
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload

def get_credentials(credentials_path=None):
    """
    Get Google API credentials.
    Attempts to load from a specified service account JSON file, 
    otherwise falls back to Google Application Default Credentials (ADC).
    """
    if credentials_path:
        if not os.path.exists(credentials_path):
            raise FileNotFoundError(f"Credentials file not found at: {credentials_path}")
        print(f"Loading credentials from service account file: {credentials_path}")
        scopes = ['https://www.googleapis.com/auth/drive']
        return service_account.Credentials.from_service_account_file(credentials_path, scopes=scopes)
    
    print("Loading Application Default Credentials (ADC)...")
    creds, _ = google.auth.default(scopes=['https://www.googleapis.com/auth/drive'])
    return creds

def upload_file(file_path, drive_filename=None, folder_id=None, mime_type=None, credentials_path=None):
    """
    Upload a file to Google Drive.
    
    Args:
        file_path (str): Path to the local file to upload.
        drive_filename (str, optional): The name of the file on Google Drive. Defaults to the local file name.
        folder_id (str, optional): The ID of the parent folder in Google Drive.
        mime_type (str, optional): The MIME type of the file. Defaults to auto-detected type.
        credentials_path (str, optional): Path to a service account credentials JSON file.
        
    Returns:
        str: The ID of the uploaded file, or None if the upload failed.
    """
    if not os.path.exists(file_path):
        print(f"Error: Local file '{file_path}' does not exist.")
        return None
        
    if not drive_filename:
        drive_filename = os.path.basename(file_path)
        
    if not mime_type:
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            mime_type = "application/octet-stream"
            print(f"MIME type could not be guessed. Defaulting to: {mime_type}")
        else:
            print(f"Guessed MIME type: {mime_type}")

    try:
        creds = get_credentials(credentials_path)
        service = build("drive", "v3", credentials=creds)

        file_metadata = {"name": drive_filename}
        if folder_id:
            file_metadata["parents"] = [folder_id]

        media = MediaFileUpload(file_path, mimetype=mime_type, resumable=True)
        
        print(f"Uploading '{file_path}' to Google Drive as '{drive_filename}'...")
        file = (
            service.files()
            .create(body=file_metadata, media_body=media, fields="id, name, webViewLink")
            .execute()
        )
        
        print("\n=== Upload Successful ===")
        print(f"File Name: {file.get('name')}")
        print(f"File ID: {file.get('id')}")
        print(f"Web View Link: {file.get('webViewLink')}")
        return file.get("id")

    except HttpError as error:
        print(f"\nAn API error occurred: {error}")
    except Exception as e:
        print(f"\nAn error occurred: {e}")
        
    return None

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload a file to Google Drive using Drive API v3.")
    parser.add_argument("--file", required=True, help="Path to the local file to upload.")
    parser.add_argument("--name", help="Custom name for the file on Google Drive (default: same as local file).")
    parser.add_argument("--folder-id", help="Optional ID of the Google Drive folder to upload into.")
    parser.add_argument("--mime", help="Optional MIME type for the file (default: auto-detect).")
    parser.add_argument("--creds", help="Optional path to service account credentials JSON file.")
    
    args = parser.parse_args()
    
    upload_file(
        file_path=args.file,
        drive_filename=args.name,
        folder_id=args.folder_id,
        mime_type=args.mime,
        credentials_path=args.creds
    )
