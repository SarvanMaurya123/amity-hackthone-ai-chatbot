# AI System Architecture

## High-Level Flow

```text
User
  |
  v
Frontend (Next.js / React)
  |
  v
FastAPI Backend
  |
  +-- Emotion / Intent Detection (.pkl Models)
  +-- Prompt Builder
  +-- LLM API (Mistral)
  +-- Safety Guardrails
  |
  v
MongoDB Atlas
```

## Request Lifecycle

```text
1. User sends a message from the frontend chat UI
2. Frontend sends authenticated request to FastAPI
3. FastAPI loads user context and conversation record
4. Backend runs local .pkl classifiers for internal signal
5. Backend builds a safer, context-aware prompt
6. Backend calls the LLM provider
7. Backend applies response shaping / safety rules
8. Backend stores messages and conversation state in MongoDB Atlas
9. Frontend renders the final assistant response
```

## Architecture Layers

### 1. Frontend Layer

Purpose:
- Handles user interaction
- Shows chat, sessions, settings, and auth state
- Calls backend APIs only

Key files:
- `frontend/ai-chat-app/src/app/(dashboard)/chat/page.tsx`
- `frontend/ai-chat-app/src/app/components/ChatArea.tsx`
- `frontend/ai-chat-app/src/app/components/Sidebar.tsx`
- `frontend/ai-chat-app/src/lib/api/client.ts`
- `frontend/ai-chat-app/src/services/chat-service.ts`
- `frontend/ai-chat-app/src/services/conversation-service.ts`
- `frontend/ai-chat-app/src/services/workspace-service.ts`

Responsibilities:
- Collect user message
- Send token-authenticated API requests
- Render backend-generated AI responses
- Show saved conversations and workspace settings

## 2. FastAPI Backend Layer

Purpose:
- Central orchestration layer
- Authentication, chat processing, conversation persistence, workspace data

Key files:
- `backend/app/main.py`
- `backend/app/api/routes/auth.py`
- `backend/app/api/routes/chat.py`
- `backend/app/api/routes/conversations.py`
- `backend/app/api/routes/workspace.py`
- `backend/app/api/routes/health.py`

Responsibilities:
- Validate requests
- Authenticate users with JWT
- Route business logic to services
- Return structured JSON responses

## 3. Emotion / Intent Detection Layer

Purpose:
- Use local trained `.pkl` models before LLM generation
- Add internal emotional / conversational context

Model files:
- `backend/models/production_mental_health_model.pkl`
- `backend/models/binary_conversation_classifier.pkl`
- `backend/models/multiclass_all_labels_classifier.pkl`

Key files:
- `backend/app/services/classifier_service.py`
- `backend/app/core/config.py`

Responsibilities:
- Predict primary mental-health / intent label
- Predict binary conversation class
- Predict tertiary fine-grained label
- Pass classifier outputs into prompt building

Important:
- These classifier results are used internally
- They are not shown directly to the end user in chat

## 4. Prompt Builder Layer

Purpose:
- Turn raw user text + classifier output into a better LLM prompt
- Make responses more practical, safe, and context-aware

Key file:
- `backend/app/services/chat_service.py`

Responsibilities:
- Interpret typo-heavy or informal user messages
- Add internal classifier context
- Add response rules for stress, exhaustion, hackathon pressure, sleep loss, etc.
- Ensure internal model details are not leaked to users

## 5. LLM API Layer

Purpose:
- Generate the final natural-language response

Current provider:
- Mistral API

Key file:
- `backend/app/services/chat_service.py`

Current env vars:
- `MISTRAL_API_KEY`
- `LLM_MODEL_NAME`

Responsibilities:
- Receive structured prompt from backend
- Generate final reply
- Return response to FastAPI

## 6. Safety Guardrails Layer

Purpose:
- Keep responses safe, especially for sensitive mental-health-related inputs

Implemented in:
- `backend/app/services/chat_service.py`
- `backend/app/api/routes/chat.py`

Responsibilities:
- Detect crisis-like phrases
- Prefer urgent help guidance when risk is high
- Avoid exposing internal labels / scores
- Keep tone supportive and practical
- Avoid generic or unsafe advice

## 7. Database Layer

Purpose:
- Persist user data and application state

Database:
- MongoDB Atlas

Key files:
- `backend/app/db/mongodb.py`
- `backend/app/repositories/user_repository.py`
- `backend/app/repositories/conversation_repository.py`

Stored data:
- Users
- Auth-linked profiles
- Preferences
- Conversations
- Messages
- Session metadata such as pinned state and timestamps

## Backend Internal Structure

```text
backend/app/
  api/
    routes/
      auth.py
      chat.py
      conversations.py
      workspace.py
      health.py
    dependencies/
      auth.py
  core/
    config.py
    security.py
  db/
    mongodb.py
  repositories/
    user_repository.py
    conversation_repository.py
  schemas/
    auth.py
    chat.py
    conversation.py
    workspace.py
    health.py
  services/
    auth_service.py
    classifier_service.py
    chat_service.py
    conversation_service.py
    workspace_service.py
```

## Frontend Internal Structure

```text
frontend/ai-chat-app/src/
  app/
    (dashboard)/
      chat/page.tsx
      settings/page.tsx
    components/
      ChatArea.tsx
      ChatInput.tsx
      MessageBubble.tsx
      Sidebar.tsx
  hooks/
    use-auth.ts
    use-conversations.ts
    use-workspace.ts
    use-system.ts
  lib/
    api/client.ts
    auth/token-storage.ts
  services/
    auth-service.ts
    chat-service.ts
    conversation-service.ts
    workspace-service.ts
    system-service.ts
```

## Production Summary

This project now follows this real architecture:

- Frontend handles UI only
- FastAPI handles orchestration
- `.pkl` models provide internal emotional / intent detection
- Prompt builder shapes the LLM call
- Mistral generates the final answer
- Safety rules protect sensitive interactions
- MongoDB Atlas stores user, workspace, and conversation data

## Future Improvements

- Add conversation search API for the header search bar
- Add moderation / safety scoring before LLM call
- Add response audit logs for admin review
- Add streaming responses from backend to frontend
- Add analytics for classifier confidence and fallback usage
