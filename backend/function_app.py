import azure.functions as func
import logging
import json
import uuid
import re
from openai import AzureOpenAI
from azure.cosmos import CosmosClient, PartitionKey
import os

app = func.FunctionApp()

# Check required environment variables (log a warning if missing)
required_env = [
    "COSMOS_DB_ENDPOINT", "COSMOS_DB_KEY", "AZURE_OPENAI_API_KEY",
    "AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_DEPLOYMENT_NAME"
]
for var in required_env:
    if not os.getenv(var):
        logging.warning(f"Environment variable {var} is not set.")
        

# Retrieve Cosmos DB configuration from environment variables
COSMOS_ENDPOINT = os.getenv("COSMOS_DB_ENDPOINT")
COSMOS_KEY = os.getenv("COSMOS_DB_KEY")
DATABASE_NAME = os.getenv("COSMOS_DB_DATABASE", "TranscriptsDB")
CONTAINER_NAME = os.getenv("COSMOS_DB_CONTAINER", "Transcripts")

client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
database = client.create_database_if_not_exists(id=DATABASE_NAME)
container = database.create_container_if_not_exists(
    id=CONTAINER_NAME,
    partition_key=PartitionKey(path="/id"),
    offer_throughput=400
)

class CosmosDBStore:
    def __init__(self, container):
        self.container = container

    def save(self, key, value):
        value["id"] = key  # Cosmos DB requires an "id" field.
        self.container.create_item(body=value)

    def get(self, key):
        try:
            return self.container.read_item(item=key, partition_key=key)
        except Exception as e:
            logging.error(f"Error reading item from Cosmos DB: {e}")
            return None

    def update(self, key, updates: dict):
        item = self.get(key)
        if item:
            item.update(updates)
            self.container.replace_item(item=item, body=item)
            return item
        return None

# Instantiate the CosmosDBStore
db = CosmosDBStore(container)

def clean_transcript(raw_transcript: str) -> str:
    """
    Clean a Microsoft Teams transcript.

    This function performs the following cleaning steps:
      - Removes timestamps in the format "HH:MM:SS" (with optional AM/PM).
      - Removes speaker names that precede dialogue (assumed to be any text ending with a colon right after the timestamp).
      - Strips extra whitespace and joins the cleaned lines.

    Example Input:
      "00:01:23 John Doe: Hello, everyone!\n00:01:25 Jane Smith: Hi, John!"
    Example Output:
      "Hello, everyone! Hi, John!"
    """
    # Split transcript into individual lines
    lines = raw_transcript.splitlines()
    cleaned_lines = []
    
    # Regex pattern:
    # ^\s*                => start of line, optional whitespace
    # \d{1,2}:\d{2}:\d{2} => timestamp (e.g., "00:01:23")
    # (?:\s*(AM|PM))?     => optional AM/PM
    # \s*                 => optional whitespace
    # (?:[^\:]+:\s*)?     => optional speaker name (any characters up to a colon) followed by a colon and optional whitespace
    pattern = re.compile(r'^\s*\d{1,2}:\d{2}:\d{2}(?:\s*(?:AM|PM))?\s*(?:[^:]+:\s*)?')
    
    for line in lines:
        # Remove the timestamp and speaker name
        cleaned_line = pattern.sub('', line)
        # Collapse multiple spaces within the line
        cleaned_line = ' '.join(cleaned_line.split())
        if cleaned_line:
            cleaned_lines.append(cleaned_line)
    
    return ' '.join(cleaned_lines)

def extract_user_stories(transcript_text: str) -> list:
    """
    Processes the transcript using Azure OpenAI to generate user stories.
    
    Returns a list of user story dictionaries with keys:
      - title
      - userStory
      - acceptanceCriteria
      - storyPoints
      - priority
      - tags
    """
    try:
        # Get configuration from environment variables
        api_key = os.getenv("AZURE_OPENAI_API_KEY")
        azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")
        
        if not api_key or not azure_endpoint or not deployment_name:
            logging.error("Missing one or more Azure OpenAI configuration values.")
            return []
        
        client = AzureOpenAI(
            api_key=api_key,
            api_version="2024-02-01",
            azure_endpoint=azure_endpoint
        )
        
        # Build prompt to instruct the model to generate user stories
        prompt = f"""
You are an expert agile product owner. Convert the following transcript into well-formed user stories.

Transcript:
{transcript_text}

Instructions:
Generate between 2 and 5 user stories in JSON format with the following fields:
- title: A brief descriptive title.
- userStory: A detailed user story in the format "As a [user], I want [action] so that [benefit]".
- acceptanceCriteria: An array of acceptance criteria.
- storyPoints: A numeric value (choose from 1, 2, 3, 5, or 8).
- priority: One of "High", "Medium", "Low".
- tags: An array of relevant tags.

Return only valid JSON. For example:
{{
  "stories": [
    {{
      "title": "User Login Feature",
      "userStory": "As a user, I want to log in so that I can access personalized content.",
      "acceptanceCriteria": ["Valid credentials allow login", "Invalid credentials show error"],
      "storyPoints": 3,
      "priority": "High",
      "tags": ["Authentication", "UI"]
    }}
  ]
}}
"""
        logging.info("Sending prompt to Azure OpenAI for user story extraction.")
        response = client.completions.create(
            model=deployment_name,
            prompt=prompt,
            max_tokens=1500
        )
        logging.debug(f"Azure OpenAI raw response: {response}")
        
        # Extract and clean the text response
        completion_text = response.choices[0].text.strip()
        # Ensure we start with the JSON by locating the first '{'
        json_start = completion_text.find("{")
        if json_start != -1:
            completion_text = completion_text[json_start:]
        
        try:
            user_stories_json = json.loads(completion_text)
        except json.JSONDecodeError as je:
            logging.error(f"JSON decoding error: {je}. Raw text: {completion_text}")
            return []
        
        return user_stories_json.get("stories", [])
    
    except Exception as e:
        logging.error(f"Error during Azure OpenAI call: {e}")
        return []

# ===============================================
# Transcript Processing API
# ===============================================
@app.route(route="ProcessTranscription", methods=['POST'], auth_level=func.AuthLevel.ANONYMOUS)
def ProcessTranscription(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Received transcript processing request.')
    
    try:
        data = req.get_json()
    except Exception as e:
        logging.error(f"Error parsing JSON: {e}")
        return func.HttpResponse("Invalid JSON", status_code=400)
    
    raw_transcript = data.get("transcript")
    if not raw_transcript:
        return func.HttpResponse("Missing 'transcript' field", status_code=400)
    
    # Clean the transcript
    cleaned_transcript = clean_transcript(raw_transcript)
    transcript_id = str(uuid.uuid4())
    
    # Save the cleaned transcript and initial state to Cosmos DB
    record = {
        "transcript": cleaned_transcript,
        "status": "Submitted",
        "stories": []
    }
    db.save(transcript_id, record)
    
    # Process the transcript with Azure OpenAI to extract user stories.
    logging.info(f"Processing transcript {transcript_id} with Azure OpenAI")
    generated_stories = extract_user_stories(cleaned_transcript)
    
    # Update the record with generated stories and new status.
    db.update(transcript_id, {
        "stories": generated_stories,
        "status": "ReadyForReview"
    })
    
    response = {
        "transcript_id": transcript_id,
        "status": "ReadyForReview"
    }
    return func.HttpResponse(json.dumps(response), mimetype="application/json", status_code=202)

# ===============================================
# Stories Retrieval API
# ===============================================
@app.route(route="GetStories", methods=['GET'], auth_level=func.AuthLevel.ANONYMOUS)
def GetStories(req: func.HttpRequest) -> func.HttpResponse:
    transcript_id = req.params.get("transcript_id")
    if not transcript_id:
        return func.HttpResponse("Missing 'transcript_id' parameter", status_code=400)
    
    record = db.get(transcript_id)
    if not record:
        return func.HttpResponse("Transcript not found", status_code=404)
    
    response = {
        "transcript_id": transcript_id,
        "status": record.get("status"),
        "stories": record.get("stories")
    }
    return func.HttpResponse(json.dumps(response), mimetype="application/json", status_code=200)

# ===============================================
# DevOps Integration API
# ===============================================
@app.route(route="PublishStories", methods=['POST'], auth_level=func.AuthLevel.ANONYMOUS)
def PublishStories(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
    except Exception as e:
        logging.error(f"Error parsing JSON: {e}")
        return func.HttpResponse("Invalid JSON", status_code=400)
    
    transcript_id = data.get("transcript_id")
    approved_stories = data.get("approved_stories")
    
    if not transcript_id or not approved_stories:
        return func.HttpResponse("Both 'transcript_id' and 'approved_stories' are required", status_code=400)
    
    record = db.get(transcript_id)
    if not record:
        return func.HttpResponse("Transcript not found", status_code=404)
    
    # Simulate publishing to Azure DevOps.
    published_results = []
    for story in approved_stories:
        work_item_id = str(uuid.uuid4())
        published_results.append({
            "story_title": story.get("title"),
            "work_item_id": work_item_id,
            "devops_url": f"https://dev.azure.com/yourorg/yourproject/_workitems/edit/{work_item_id}"
        })
    
    # Update the record with published results.
    record["status"] = "Published"
    record["published_results"] = published_results
    
    response = {
        "transcript_id": transcript_id,
        "published_results": published_results
    }
    return func.HttpResponse(json.dumps(response), mimetype="application/json", status_code=200)
