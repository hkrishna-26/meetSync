import os
import json
import re
from typing import List, Optional, TypedDict
from dotenv import load_dotenv

from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq

# Load environment variables
load_dotenv()

# Step 1 - Define AgentState
class AgentState(TypedDict):
    transcript: str
    action_items: list
    decisions: list
    blockers: list

# Step 2 - Create ChatGroq LLM
groq_api_key = os.getenv("GROQ_API_KEY")
llm = ChatGroq(
    model="llama3-8b-8192",
    groq_api_key=groq_api_key,
    temperature=0.0  # Set temperature to 0 for structured/consistent outputs
)

def parse_json_safely(text: str) -> list:
    """
    Helper function to locate and parse JSON array from LLM response.
    """
    try:
        # Try to find a JSON array in the text
        match = re.search(r'\[\s*\{.*\}\s*\]', text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        # If no brackets match, try full load
        return json.loads(text.strip())
    except Exception as e:
        print(f"Failed to parse JSON array from text: {text}. Error: {str(e)}")
        # Try basic cleaning for malformed outputs
        try:
            cleaned = text.strip()
            start = cleaned.find('[')
            end = cleaned.rfind(']')
            if start != -1 and end != -1:
                return json.loads(cleaned[start:end+1])
        except Exception:
            pass
        return []

# Step 3 - Create 3 node functions

def extract_action_items(state: AgentState) -> dict:
    """
    Extracts action items from the meeting transcript.
    """
    transcript = state["transcript"]
    prompt = f"""You are analysing a meeting transcript. Extract all action items - things people committed to do.
For each action item, return a JSON array of objects with the following fields:
- "owner" (string, the name of the person responsible)
- "task" (string, description of what needs to be done)
- "deadline" (string, the deadline if mentioned, or null)
- "confidence" (string, must be one of: "high", "medium", "low")

Transcript:
{transcript}

Return ONLY a valid JSON array, nothing else. Do not include markdown formatting like ```json or any introductory text.
"""
    try:
        response = llm.invoke(prompt)
        items = parse_json_safely(response.content)
        return {**state, "action_items": items}
    except Exception as e:
        print(f"Error in extract_action_items node: {str(e)}")
        return {**state, "action_items": []}


def extract_decisions(state: AgentState) -> dict:
    """
    Extracts decisions made during the meeting.
    """
    transcript = state["transcript"]
    prompt = f"""You are analysing a meeting transcript. Extract all key decisions that were made.
For each decision, return a JSON array of objects with the following field:
- "content" (string, the description of the decision)

Transcript:
{transcript}

Return ONLY a valid JSON array, nothing else. Do not include markdown formatting like ```json or any introductory text.
"""
    try:
        response = llm.invoke(prompt)
        decisions = parse_json_safely(response.content)
        return {**state, "decisions": decisions}
    except Exception as e:
        print(f"Error in extract_decisions node: {str(e)}")
        return {**state, "decisions": []}


def extract_blockers(state: AgentState) -> dict:
    """
    Extracts blockers or obstacles mentioned in the meeting.
    """
    transcript = state["transcript"]
    prompt = f"""You are analysing a meeting transcript. Extract all blockers, issues, or obstacles mentioned.
For each blocker, return a JSON array of objects with the following fields:
- "content" (string, description of the blocker/issue)
- "blocked_by" (string, the person or thing causing the block, or null)

Transcript:
{transcript}

Return ONLY a valid JSON array, nothing else. Do not include markdown formatting like ```json or any introductory text.
"""
    try:
        response = llm.invoke(prompt)
        blockers = parse_json_safely(response.content)
        return {**state, "blockers": blockers}
    except Exception as e:
        print(f"Error in extract_blockers node: {str(e)}")
        return {**state, "blockers": []}


# Step 4 - Build graph
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("action_items", extract_action_items)
workflow.add_node("decisions", extract_decisions)
workflow.add_node("blockers", extract_blockers)

# Set entry point and edges
workflow.set_entry_point("action_items")
workflow.add_edge("action_items", "decisions")
workflow.add_edge("decisions", "blockers")
workflow.add_edge("blockers", END)

# Compile graph
app = workflow.compile()


# Step 5 - Create run_agent function
def run_agent(transcript: str) -> dict:
    """
    Runs the compiled LangGraph agent to extract action items, decisions, and blockers.
    """
    initial_state = {
        "transcript": transcript,
        "action_items": [],
        "decisions": [],
        "blockers": []
    }
    try:
        final_state = app.invoke(initial_state)
        return {
            "action_items": final_state.get("action_items", []),
            "decisions": final_state.get("decisions", []),
            "blockers": final_state.get("blockers", [])
        }
    except Exception as e:
        print(f"Error executing agent workflow: {str(e)}")
        return {
            "action_items": [],
            "decisions": [],
            "blockers": []
        }
