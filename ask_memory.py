import json

from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_chroma import Chroma
from langchain_neo4j import Neo4jGraph

# 1. Setup Connections
llm = OllamaLLM(model="llama3")
embeddings = OllamaEmbeddings(model="nomic-embed-text")

vector_store = Chroma(
    collection_name="product_memory",
    embedding_function=embeddings,
    persist_directory="./local_chroma"
)

graph = Neo4jGraph(
    url="bolt://localhost:7687",
    username="neo4j",
    password="startup123"
)

def ask_question(question):
    print(f"\nQuestion: {question}")
    
    # --- STEP A: VECTOR RETRIEVAL (The Context) ---
    # Finds the exact Slack messages related to the topic
    docs = vector_store.similarity_search(question, k=2)
    context_text = "\n".join([doc.page_content for doc in docs])
    
    # --- STEP B: GRAPH RETRIEVAL (The Logic) ---
    # We ask the LLM to write a simple Cypher query based on the question
    # For now, let's pull all Decisions and Reasons to show the LLM
    graph_data = graph.query("""
    MATCH (d:Decision)-[:BECAUSE_OF]->(r:Reason) 
    RETURN d.name as Decision, r.text as Reason
    """)
    
    graph_context = json.dumps(graph_data)

    # --- STEP C: SYNTHESIS ---
    # The LLM combines both "The Facts" and "The Why"
    prompt = f"""
    You are an Organizational Memory Assistant. 
    Use the following pieces of context to answer the user's question.
    
    SLACK CONTEXT (Vector DB):
    {context_text}
    
    DECISION GRAPH (Neo4j):
    {graph_context}
    
    USER QUESTION: {question}
    
    Answer clearly. If the graph shows a decision, explain the reasoning. 
    If you find quotes in the Slack context, use them.
    """
    
    response = llm.invoke(prompt)
    print("\n--- ENGINE RESPONSE ---")
    print(response)

if __name__ == "__main__":
    query = input("Ask your Organizational Memory: ")
    ask_question(query)