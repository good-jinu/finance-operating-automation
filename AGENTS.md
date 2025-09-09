## Overview

This is an AI-powered automation system for financial institution customer support. It uses Gmail API for email processing and LangChain with ReAct agents to automatically generate appropriate responses to customer inquiries. The system is written in Korean and designed specifically for Korean financial services.

## Project Structure

This is a pnpm monorepo with two main packages:
- `packages/core`: Core business logic, agents, and services
- `packages/webapp`: Next.js web application with real-time chat interface

### Core Architecture

The system follows a **multi-agent architecture** using LangChain's LangGraph:

1. **RouterAgent**: Main orchestrator that routes requests to appropriate sub-agents
2. **ChatAgent**: Interactive conversational agent using createReactAgent with custom tools and streaming capabilities
3. **GuideProviderAgent**: Provides procedural guides for common tasks
4. **FileReaderAgent**: Reads and processes document files
5. **CustomerDatabaseAgent**: Updates customer database with processed information

The agents use a **ReAct pattern** (Reasoning + Acting) for intelligent decision making and maintain conversation context through memory management.

### Database Schema

Uses SQLite with better-sqlite3, structured around:
- Customer companies and individual customers
- Authorized persons and payment accounts
- Email processing logs and Gmail message tracking
- Reply mails and file attachments

## Development Commands

### Initial Setup
```bash
pnpm install
```

### Development
```bash
# Run development server (Next.js + Socket.IO)
pnpm dev
```
> **Note:** This command starts a custom `server.ts` using `tsx`, which handles Socket.IO connections and manages the Next.js app in development mode.

```bash
# Build the webapp
pnpm build

# Start production server
pnpm start

# Build and start (production deployment)
pnpm build-and-start
```

### Code Quality
```bash
# Run Biome linter and formatter
pnpm check

# Check specific files
biome check <file-path>
```

The project uses **Biome 2.2.2** for fast linting and formatting instead of ESLint/Prettier.

### Running the Test Suite
The project uses **Vitest** as its primary testing framework. To run all tests for all packages, use the following command:

```bash
# Run all tests
pnpm test

# Run tests with coverage report
pnpm coverage
```
This command will execute the `vitest run` script in both `packages/core` and `packages/webapp`.

### Testing Individual Components
For more granular testing of specific components, you can use `tsx` to run individual test files:
```bash
# Test specific agent (use tsx for TypeScript execution)
npx tsx packages/core/src/agents/RouterAgent/RouterAgent.ts

# Test ChatAgent with all tools
npx tsx packages/core/src/agents/ChatAgent/test.ts

# Run ChatAgent examples
npx tsx packages/core/src/agents/ChatAgent/examples.ts

# Interactive ChatAgent mode
npx tsx packages/core/src/agents/ChatAgent/examples.ts --interactive

# Test Gmail client functions
npx tsx packages/core/src/services/gmailClient.ts

# Test database operations
npx tsx packages/core/src/services/databaseService.ts
```

## Key Technical Details

### LLM Integration
- Uses **Ollama** with `midm-2.0-base` model (Korean language model)
- Chat model created via `createChatModel()` factory function
- All agents utilize the same base model configuration

### Real-time Communication
- **Socket.IO** for real-time chat between client and AI agents
- Streaming responses from LangGraph workflows
- Session-based chat history persistence

### File Processing
- Supports Word documents via `mammoth` library and PDF documents via `pdf-parse`.
- File attachments stored in `.storage/files`
- Database references to processed files for customer records

### Email Automation
- Gmail API integration with OAuth2 authentication
- Automatic processing of unread emails
- HTML/text email content parsing with `html-to-text`
- Automated reply generation and sending

### Agent Workflow Pattern

Each LangGraph-based agent follows a consistent structure:
- `workflow.ts`: LangGraph state machine definition with StateGraph
- `nodes.ts`: Individual processing nodes for workflow steps
- `schemas.ts`: Type definitions and state annotations using Annotation
- `prompts.ts`: LLM prompt templates with Korean language support
- `AgentName.ts`: Public interface functions (runAgentName, streamAgentName)

#### Current Sub-Agents in RouterAgent
1. **GuideProvider**: Provides procedural guides for authority_change, payment_account_change, seal_sign_change
2. **FileReaderToDatabase**: Processes uploaded files and updates customer database automatically

### ChatAgent Architecture

The ChatAgent uses a different pattern based on **createReactAgent**:

- **tools.ts**: Custom LangChain tools for business operations
- **ChatAgent.ts**: Main agent using createReactAgent with MemorySaver
- **test.ts**: Integration tests for all tools
- **examples.ts**: Usage examples and interactive mode

#### ChatAgent Functions
1. **invokeChatAgent()**: Single request processing with thread support
2. **continueChatAgent()**: Continue conversation in existing thread
3. **streamChatAgent()**: Streaming responses for real-time interaction
4. **streamContinueChatAgent()**: Streaming continuation of existing conversation
5. **resetChatAgent()**: Clear conversation history for a thread

#### Available Tools
1. **gmail_list**: Gmail message list retrieval
2. **reply_mail_list**: Reply mail status and management
3. **company_search**: Customer company information lookup
4. **authorized_person**: Authorized person management (search/update)
5. **payment_account**: Payment account management (search/update)
6. **official_seal**: Official seal/signature management (search/update)

#### Usage Pattern
```typescript
import {
  invokeChatAgent,
  continueChatAgent,
  streamChatAgent,
  streamContinueChatAgent,
  resetChatAgent
} from './agents/ChatAgent/ChatAgent';

// Single request
const response = await invokeChatAgent("ABC회사의 수권자 목록을 보여주세요.");

// Continuous conversation with context
const followUp = await continueChatAgent(
  "김수권 수권자의 전화번호를 변경해주세요.",
  "session-id"
);

// Streaming response
for await (const chunk of streamChatAgent("실시간 스트리밍 요청", { thread_id: "stream-session" })) {
  console.log(chunk);
}

// Reset conversation history
await resetChatAgent("session-id");
```

## Configuration

### Required Files
- `credentials.json`: Google API credentials (not in repo)
- `token.json`: OAuth2 access tokens (generated on first auth)

### Storage Locations
- Database: `.storage/database.db`
- Files: `.storage/files/`
- Both directories auto-created on first run

### Environment Requirements
- Node.js: `>=22.18.0`
- pnpm: `10.15.1` (as specified in `packageManager`)
- Ollama server running locally with `midm-2.0-base` model

## Development Patterns

### Adding New Agents
1. Create agent directory in `packages/core/src/agents/`
2. Implement the standard files (workflow, nodes, schemas, prompts, main)
3. Export from `packages/core/src/agents/index.ts`
4. Register in RouterAgent's `SUB_AGENTS` configuration

### Database Changes
1. Update schema files in `packages/core/src/database/schema/`
2. Run migration logic through database service
3. Update corresponding model types in `packages/core/src/models/`

### Frontend Components
- Uses **Radix UI** components with **Tailwind CSS**
- **Zustand** for state management
- **TanStack Query** for server state
- Real-time updates via Socket.IO hooks

## Business Context

This system automates three main customer service processes:
1. **Authority Change Guidance** (`authority_change`): Corporate authorized person changes
2. **Payment Account Change Guidance** (`payment_account_change`): Direct debit account modifications
3. **Seal/Signature Change Guidance** (`seal_sign_change`): Corporate seal and signature updates

The AI agents understand Korean financial terminology and provide appropriate responses in Korean language.
