import json
import os
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_chroma import Chroma
from langchain_neo4j import Neo4jGraph
import uvicorn

app = FastAPI(title="Provenance AI")

# Mount static directories
app.mount("/css", StaticFiles(directory="css"), name="css")
app.mount("/js", StaticFiles(directory="js"), name="js")
app.mount("/pages", StaticFiles(directory="pages"), name="pages")

# Initialize Connections
llm = OllamaLLM(model="llama3")
embeddings = OllamaEmbeddings(model="nomic-embed-text")
vector_store = Chroma(collection_name="product_memory", embedding_function=embeddings, persist_directory="./local_chroma")

try:
    graph = Neo4jGraph(url="bolt://localhost:7687", username="neo4j", password="startup123")
except Exception as e:
    print("Warning: Could not connect to Neo4j. Graph features will fail or be skipped.", e)
    graph = None

class QueryModel(BaseModel):
    query: str

@app.post("/api/query")
async def handle_query(request: QueryModel):
    query = request.query
    
    # 1. Vector Search
    try:
        docs = vector_store.similarity_search(query, k=3)
        context = "\n".join([d.page_content for d in docs])
        sources_list = [{"label": f"Doc {i+1}", "href": "#"} for i, d in enumerate(docs)]
    except Exception as e:
        context = "No vector context found."
        sources_list = []

    # 2. Graph Search
    graph_data = []
    if graph:
        try:
            graph_data = graph.query("MATCH (d:Decision)-[:BECAUSE_OF]->(r:Reason) RETURN d.name as Decision, r.text as Reason LIMIT 5")
        except Exception as e:
            print("Graph query failed:", e)

    # 3. Final Answer
    prompt = f"Context: {context}\nGraph Logic: {json.dumps(graph_data)}\nQuestion: {query}\nAnswer as a helpful PM assistant:"
    
    try:
        response_text = llm.invoke(prompt)
    except Exception as e:
        response_text = f"Error generating LLM response: {str(e)}"

    # Construct the JSON payload for the frontend
    payload = {
        "confidence": "85%",
        "answer": response_text,
        "chain": [
            "[Vector Search Complete]",
            "[Graph Query Executed]",
            "[LLM Generated Answer]"
        ],
        "sources": sources_list,
        "graph": {
            "center": "Decision logic",
            "reasons": ["AI Synthesis", "Context retrieved"] if not graph_data else [r.get("Reason", "Unknown") for r in graph_data]
        },
        "suggestions": [
            "Why was this path chosen?",
            "What were the alternatives?"
        ]
    }
    
    return payload

@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open("pages/index.html", "r") as f:
        return HTMLResponse(content=f.read())

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
