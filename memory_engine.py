import os
import json
import ssl
import certifi
from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_chroma import Chroma
from langchain_neo4j import Neo4jGraph
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

# --- CONFIGURATION ---
SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN", "")
SLACK_CHANNEL_ID = os.getenv("SLACK_CHANNEL_ID", "C0ASWP1LWRW")

# 1. Connect Local AI Components
print("Connecting to Local Ollama & Databases...")
llm = OllamaLLM(model="llama3", temperature=0) # temperature 0 for logic consistency
embeddings = OllamaEmbeddings(model="nomic-embed-text")

# 2. Connect Storage
vector_store = Chroma(
    collection_name="product_memory",
    embedding_function=embeddings,
    persist_directory="./local_chroma"
)

graph = Neo4jGraph(
    url="bolt://localhost:7687",
    username="neo4j",
    password="startup123" # Ensure this matches your Neo4j Desktop password
)

def extract_reasoning(text):
    prompt = f"""
    You are a Startup PM. Identify any technical choices or tool selections in this message.
    Message: "{text}"
    
    If there is ANY mention of a tool (like PostgreSQL, Stripe, etc.) or a reason, 
    you MUST extract it. Do not be picky. 
    
    Format:
    {{
      "Decision": "Name of the tool or choice",
      "Reason": "The technical benefit mentioned",
      "Entities": []
    }}
    Return ONLY JSON.
    """
    # ... rest of the function ...

def store_data(raw_msg, extracted_json):
    """The 'Hands' - Saving to two places at once."""
    # A. Save raw text to Vector DB for semantic searching later
    vector_store.add_texts(
        texts=[raw_msg['text']],
        metadatas=[{"user": raw_msg.get('user'), "ts": raw_msg.get('ts')}]
    )
    print("  [Vector Store] Text indexed.")

    # B. Save logic to Graph DB for 'Why' reasoning
    if extracted_json and "Decision" in extracted_json:
        decision = extracted_json['Decision']
        reason = extracted_json.get('Reason', 'Unknown')
        
        # This Cypher query builds the map of your startup's mind
        cypher = f"""
        MERGE (d:Decision {{name: "{decision}"}})
        MERGE (r:Reason {{text: "{reason}"}})
        MERGE (d)-[:BECAUSE_OF]->(r)
        """
        graph.query(cypher)
        print(f"  [Graph Store] Logic mapped: {decision} -> {reason}")

if __name__ == "__main__":
    if not SLACK_BOT_TOKEN:
        raise ValueError("Set SLACK_BOT_TOKEN in your environment before running this script.")

    # --- FETCH ---
    ssl_context = ssl.create_default_context(cafile=certifi.where())
    client = WebClient(token=SLACK_BOT_TOKEN, ssl=ssl_context)
    graph.query("MERGE (n:TestNode {name: 'Hello Neo4j'})")
    print("Test node created!")
    try:
        print(f"Fetching history...")
        response = client.conversations_history(channel=SLACK_CHANNEL_ID, limit=10)
        messages = response['messages']
        print(f"Success! Found {len(messages)} messages.\n")

        # --- PROCESS ---
        for msg in reversed(messages): # Process oldest first
            if 'subtype' not in msg:
                print(f"Processing: '{msg['text'][:50]}...'")
                logic = extract_reasoning(msg['text'])
                store_data(msg, logic)

    except Exception as e:
        print(f"Error: {e}")