# AI Infrastructure Backend

This is the backend API for the AI Infrastructure project, built with FastAPI and managed with [uv](https://github.com/astral-sh/uv).

## Development Setup

### Prerequisites

- [uv](https://github.com/astral-sh/uv) - Python package and project manager
- Python 3.9+

### Quick Start

1. Install dependencies:
   ```bash
   uv sync
   ```

2. Run the development server:
   ```bash
   uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Dependencies

Dependencies are managed in `pyproject.toml` and locked in `uv.lock`.

- **Runtime dependencies**: Listed in `project.dependencies`
- **Development dependencies**: Listed in `tool.uv.dev-dependencies`

### Adding Dependencies

```bash
# Add a runtime dependency
uv add package-name

# Add a development dependency
uv add --dev package-name
```

### Docker

The application is containerized and uses uv for fast dependency installation:

```bash
docker build -t ainfra-backend .
docker run -p 8000:8000 ainfra-backend
```

## API Endpoints

- `POST /agent` - Process agent requests for infrastructure generation
- Health check and docs available at the FastAPI standard endpoints

## Architecture

The backend provides an AI agent specialized in generating Terraform infrastructure configurations based on user prompts and conversation history.
