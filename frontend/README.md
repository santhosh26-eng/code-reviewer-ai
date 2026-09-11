# Code Reviewer and Explainer - Frontend

This is the Next.js frontend for the Code Reviewer and Explainer platform. It provides a LeetCode-style dual-pane interface with an AI Chat panel on the left and a Workspace on the right.

## Features

- **Monaco Editor Integration**: Write code with syntax highlighting.
- **Language Support**: Python, JavaScript, TypeScript, C, C++, Java, and more.
- **AI Review & Refactor**: Get static analysis, bugs, and security issues via the FastAPI backend.
- **AI Code Chat**: Ask contextual questions about your code using the LangGraph AI assistant.
- **Test Case Execution**: Securely run your code against custom test cases via the Docker Sandbox Executor.
- **Clerk Authentication**: Secure login to access API endpoints.

## Local Setup

1. Copy `.env.example` to `.env.local` and add your Clerk Publishable Key and the backend API URL.
2. Run `npm install`
3. Run `npm run dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
