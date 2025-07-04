from fastapi import FastAPI
from agents import Agent, Runner
from pydantic import BaseModel
from typing import List, Optional
import os
import asyncio
import re

app = FastAPI()


class ConversationMessage(BaseModel):
    id: str
    project_id: str
    role: str
    content: str
    created_at: str


class AgentRequest(BaseModel):
    prompt: str
    project_id: str
    conversation_history: Optional[List[ConversationMessage]] = []


# Create the infrastructure agent
infrastructure_agent = Agent(
    name="Terraform Infrastructure Generator",
    instructions="""You are a specialized Terraform code generator. Your ONLY job is to generate Terraform configurations based on user requests.

STRICT RULES:
1. ALWAYS respond with valid Terraform (.tf) code
2. Use proper Terraform syntax and best practices
3. Include provider configurations when needed
4. Add meaningful variable definitions
5. Include outputs for important resources
6. Add comments explaining the infrastructure components
7. Use appropriate resource naming conventions
8. Consider security best practices in your configurations

SUPPORTED PROVIDERS:
- AWS (aws)
- Azure (azurerm)
- Google Cloud (google)
- Kubernetes (kubernetes)
- Helm (helm)

RESPONSE FORMAT:
Always structure your response as:
```hcl
# Brief description of what this infrastructure does

# Provider configuration
terraform {
  required_providers {
    # provider blocks
  }
}

# Variables (if needed)
variable "example" {
  description = "Description"
  type        = string
  default     = "default_value"
}

# Resources
resource "provider_resource" "name" {
  # resource configuration
}

# Outputs (if needed)
output "example" {
  description = "Description"
  value       = resource.provider_resource.name.attribute
}
```

DO NOT:
- Provide explanations outside of Terraform comments
- Suggest manual steps or CLI commands
- Generate anything other than Terraform code
- Ask questions - make reasonable assumptions and document them in comments

When conversation history is provided, build upon previous Terraform configurations and maintain consistency.""",
)


@app.post("/agent")
async def run_agent(request: AgentRequest):
    print(f"Processing agent request for project: {request.project_id}")
    print(f"Latest prompt: {request.prompt[:100]}...")
    print(
        f"Conversation history length: {len(request.conversation_history) if request.conversation_history else 0}"
    )

    try:
        # Build conversation context from history
        conversation_context = ""
        if request.conversation_history:
            print(
                f"Building conversation context from {len(request.conversation_history)} messages"
            )
            context_messages = []
            for msg in request.conversation_history:
                if msg.role == "user":
                    context_messages.append(f"Previous request: {msg.content}")
                elif msg.role == "assistant":
                    # Extract just the essence of previous Terraform configs for context
                    if (
                        "terraform" in msg.content.lower()
                        or "resource" in msg.content.lower()
                    ):
                        context_messages.append(
                            f"Previous Terraform response: {msg.content[:500]}..."
                        )

            if context_messages:
                conversation_context = (
                    "\n\nPrevious infrastructure requests and configurations:\n"
                    + "\n\n".join(context_messages)
                )

        # Prepare the full prompt with context for Terraform generation
        full_prompt = f"""Generate Terraform code for the following infrastructure request:

Project ID: {request.project_id}

{conversation_context}

INFRASTRUCTURE REQUEST: {request.prompt}

Requirements:
- Generate complete, valid Terraform code
- Use appropriate cloud provider (AWS/Azure/GCP)
- Include all necessary resources, variables, and outputs
- Add descriptive comments
- Follow Terraform best practices
- Make reasonable assumptions if details are missing

Generate the Terraform configuration now:"""

        print("Generating Terraform code with conversation context...")

        # Run the agent with the full context
        result = await Runner.run(infrastructure_agent, full_prompt)

        response_content = result.final_output
        print(f"Generated Terraform code: {response_content[:200]}...")

        # Validate that the response contains Terraform code
        if not validate_terraform_response(response_content):
            print("Warning: Generated response may not contain valid Terraform code")
            # You could implement retry logic here if needed

        return {"response": response_content}

    except Exception as e:
        print(f"Agent run failed with error: {str(e)}")
        return {
            "response": f"An error occurred while processing your request: {str(e)}"
        }


# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "agent": "terraform_generator",
        "specialization": "Infrastructure as Code",
    }


def validate_terraform_response(response: str) -> bool:
    """Basic validation to ensure response contains Terraform code"""
    terraform_keywords = [
        "terraform",
        "resource",
        "provider",
        "variable",
        "output",
        "data",
        "module",
        "locals",
    ]

    # Check if response contains HCL code blocks
    has_hcl_block = "```hcl" in response or "```terraform" in response

    # Check if response contains Terraform keywords
    has_terraform_keywords = any(
        keyword in response.lower() for keyword in terraform_keywords
    )

    return has_hcl_block or has_terraform_keywords
