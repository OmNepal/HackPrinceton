"""
Snowflake Cortex Audio Transcription Service
Handles audio file transcription using Snowflake Cortex AI_TRANSCRIBE SQL function
"""

import os
import json
import tempfile
import snowflake.connector
from dotenv import load_dotenv

load_dotenv()

# Snowflake connection parameters
SNOWFLAKE_ACCOUNT = os.getenv("SNOWFLAKE_ACCOUNT")
SNOWFLAKE_USER = os.getenv("SNOWFLAKE_USER")
SNOWFLAKE_PASSWORD = os.getenv("SNOWFLAKE_PASSWORD")
SNOWFLAKE_WAREHOUSE = os.getenv("SNOWFLAKE_WAREHOUSE")
SNOWFLAKE_DATABASE = os.getenv("SNOWFLAKE_DATABASE")
SNOWFLAKE_SCHEMA = os.getenv("SNOWFLAKE_SCHEMA")
SNOWFLAKE_ROLE = os.getenv("SNOWFLAKE_ROLE")

# Stage name for audio files (will be created if it doesn't exist)
AUDIO_STAGE_NAME = os.getenv("SNOWFLAKE_AUDIO_STAGE", "audio_transcription_stage")


def get_snowflake_connection():
    """
    Create and return a Snowflake connection using password authentication.
    """
    if not SNOWFLAKE_ACCOUNT or not SNOWFLAKE_USER:
        raise ValueError("SNOWFLAKE_ACCOUNT and SNOWFLAKE_USER must be set in environment variables")

    if not SNOWFLAKE_PASSWORD:
        raise ValueError("SNOWFLAKE_PASSWORD must be set in environment variables")

    conn = snowflake.connector.connect(
        account=SNOWFLAKE_ACCOUNT,
        user=SNOWFLAKE_USER,
        password=SNOWFLAKE_PASSWORD,
        warehouse=SNOWFLAKE_WAREHOUSE,
        database=SNOWFLAKE_DATABASE,
        schema=SNOWFLAKE_SCHEMA,
        role=SNOWFLAKE_ROLE
    )
    return conn


def ensure_stage_exists(conn):
    """
    Ensure the audio stage exists. Create it if it doesn't.
    """
    cursor = conn.cursor()
    try:
        cursor.execute(f"USE DATABASE {SNOWFLAKE_DATABASE}")
        cursor.execute(f"USE SCHEMA {SNOWFLAKE_SCHEMA}")

        cursor.execute(f"SHOW STAGES LIKE '{AUDIO_STAGE_NAME}'")
        stages = cursor.fetchall()

        if not stages:
            create_stage_sql = f"""
            CREATE OR REPLACE STAGE {AUDIO_STAGE_NAME}
              DIRECTORY = (ENABLE = TRUE)
              ENCRYPTION = (TYPE = 'SNOWFLAKE_SSE')
            """
            cursor.execute(create_stage_sql)
            print(f"Created stage: {AUDIO_STAGE_NAME}")
        else:
            print(f"Stage {AUDIO_STAGE_NAME} already exists")
    finally:
        cursor.close()


async def transcribe_audio_from_bytes(audio_bytes: bytes, filename: str = "recording.webm") -> str:
    """
    Transcribe audio from bytes using Snowflake Cortex AI_TRANSCRIBE SQL function.
    """
    if not SNOWFLAKE_ACCOUNT or not SNOWFLAKE_USER:
        raise ValueError("SNOWFLAKE_ACCOUNT and SNOWFLAKE_USER must be set in environment variables")

    conn = None
    temp_file_path = None

    try:
        # Save audio to a temp file with a fixed name (recording.webm)
        temp_dir = tempfile.gettempdir()
        temp_file_path = os.path.join(temp_dir, "recording.webm")
        with open(temp_file_path, "wb") as temp_file:
            temp_file.write(audio_bytes)
        print(f"Temporary audio file created: {temp_file_path}")

        # Connect to Snowflake
        conn = get_snowflake_connection()
        ensure_stage_exists(conn)

        cursor = conn.cursor()
        try:
            # Set DB and Schema context
            cursor.execute(f"USE DATABASE {SNOWFLAKE_DATABASE}")
            cursor.execute(f"USE SCHEMA {SNOWFLAKE_SCHEMA}")

            # Upload file to stage
            normalized_path = temp_file_path.replace("\\", "/")
# ensure Windows drive letter has an extra slash after 'C:'
            if normalized_path[1:3] == ":/":
                normalized_path = f"/{normalized_path}"

            put_sql = (
                f"PUT 'file://{normalized_path}' "
                f"@{AUDIO_STAGE_NAME} "
                f"AUTO_COMPRESS=FALSE OVERWRITE=TRUE"
            )


            cursor.execute(put_sql)
            print(f"Uploaded recording.webm to stage {AUDIO_STAGE_NAME}")

            # Confirm file exists
            cursor.execute(f"LIST @{AUDIO_STAGE_NAME}")
            files = cursor.fetchall()
            print("Files currently in stage:", files)

            # Run AI_TRANSCRIBE
            transcribe_sql = f"SELECT AI_TRANSCRIBE(TO_FILE('@{AUDIO_STAGE_NAME}/recording.webm')) AS transcript;"

            cursor.execute(transcribe_sql)
            result = cursor.fetchone()
            print("Raw transcription result:", result)

            if not result or not result[0]:
                raise Exception("AI_TRANSCRIBE returned empty result")

            transcript_data = result[0]

            # Parse result JSON
            if isinstance(transcript_data, str):
                transcript_data = json.loads(transcript_data)

            if isinstance(transcript_data, dict):
                transcript = transcript_data.get("text", "")
                if transcript:
                    return transcript.strip()
                else:
                    raise Exception(f"Unexpected AI_TRANSCRIBE response format: {transcript_data}")
            else:
                raise Exception(f"Unexpected AI_TRANSCRIBE response type: {type(transcript_data)}")

        finally:
            cursor.close()
    except Exception as e:
        print(f"Error during Snowflake transcription: {e}")
        raise Exception(f"Snowflake transcription error: {str(e)}") from e
    finally:
        if conn:
            conn.close()
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception as cleanup_error:
                print(f"Warning: Could not delete temporary file {temp_file_path}: {cleanup_error}")


async def transcribe_audio(audio_file_path: str) -> str:
    """
    Transcribe a saved audio file using the same Snowflake process.
    """
    if not os.path.exists(audio_file_path):
        raise FileNotFoundError(f"Audio file not found: {audio_file_path}")

    with open(audio_file_path, "rb") as f:
        audio_bytes = f.read()
        return await transcribe_audio_from_bytes(audio_bytes, os.path.basename(audio_file_path))
