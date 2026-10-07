import os
from typing import List
from tool import debug_print, add_to_log
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import time
from langchain_openai import ChatOpenAI

load_dotenv()

app = FastAPI()

model_name = "inception/mercury-2"

# Initialize model
Model = ChatOpenAI(
    model=model_name,
    base_url="https://api.aicredits.in/v1",
    api_key=os.getenv("OPENAI_API_KEY"),
)

# Allow CORS (development only)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class SegmentRequest(BaseModel):
    text: str = Field(..., description="Text to segment into clauses")

class RewriteRequest(BaseModel):
    clauses: List[str] = Field(..., description="Clauses to rewrite for better memorability")

System_prompt = """
Split the text into clauses.

Return a few clauses per line.
Don't make the Clauses more than a few words.

Do not number them.
Do not explain anything.
Do not rewrite the text.
Copy each clause exactly.
"""


@app.post("/segment")
async def segment(request: SegmentRequest):
    # Receive JSON payload: { "text": "..." }
    text = request.text
    debug_print(f"Received text for segmentation: {text[:50]}...")
    START = time.time()
    response = Model.invoke([
        ("system", System_prompt),
        ("human", text),
    ])
    END = time.time()
    debug_print(f"Received response from model")
    #so that later we can read this time and take an average and see the average time taken
    #add_to_log(f"{model_name}: {END - START:.2f}")


    # Normalize to a list of clauses (one per line). Filter out empty lines.
    raw = response.content or ""
    clauses = [line.strip() for line in raw.splitlines() if line.strip()]
    debug_print(f"Extracted {len(clauses)} clauses from response, now sending to frontend")
    return {"clauses": clauses}

Rewrite_prompt = """
Rewrite each clause to be more memorable.

Keep the original meaning and length similar.
Make the language more vivid, concrete, and easier to remember.

Return exactly one rewritten clause per line.
Do not number them.
Do not explain anything.
Keep the same number of clauses as provided.
"""


@app.post("/rewrite")
async def rewrite(request: RewriteRequest):
    # Receive JSON payload: { "clauses": ["...", "..."] }
    clauses = request.clauses
    debug_print(f"Received {len(clauses)} clauses for rewriting")
    START = time.time()

    # Join clauses with newlines so the model rewrites them all in one pass
    joined = "\n".join(clauses)
    response = Model.invoke([
        ("system", Rewrite_prompt),
        ("human", joined),
    ])
    END = time.time()
    debug_print("Received response from model")
    #add_to_log(f"{model_name}: {END - START:.2f}")

    # Normalize to a list of rewritten clauses (one per line)
    raw = response.content or ""
    rewritten = [line.strip() for line in raw.splitlines() if line.strip()]

    # The frontend maps rewritten clauses back to the same clause IDs,
    # so the count must match the input. Fall back to the original text
    # if the model returns a different number of lines.
    if len(rewritten) != len(clauses):
        debug_print(f"Model returned {len(rewritten)} clauses, expected {len(clauses)}; falling back to originals")
        rewritten = clauses

    debug_print(f"Returning {len(rewritten)} rewritten clauses to frontend")
    return {"clauses": rewritten}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)