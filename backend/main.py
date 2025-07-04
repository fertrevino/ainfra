from fastapi import FastAPI
from openai import AssistantEventHandler, OpenAI
from pydantic import BaseModel
import os

app = FastAPI()


class AgentRequest(BaseModel):
    prompt: str
    project_id: str


@app.post("/agent")
async def run_agent(request: AgentRequest):
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    assistant = client.beta.assistants.create(
        name="Math Tutor",
        instructions="You are a personal math tutor. Write and run code to answer math questions.",
        tools=[{"type": "code_interpreter"}],
        model="gpt-4-turbo",
    )
    thread = client.beta.threads.create()
    message = client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=request.prompt,
    )
    run = client.beta.threads.runs.create_and_poll(
        thread_id=thread.id,
        assistant_id=assistant.id,
        instructions="Please address the user as Jane Doe. The user has a premium account.",
    )

    if run.status == "completed":
        messages = client.beta.threads.messages.list(thread_id=thread.id)
        return {"response": messages.data[0].content[0].text.value}
    else:
        return {"response": "An error occurred."}
