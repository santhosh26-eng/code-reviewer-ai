# Frontend Architecture

The frontend is built using **Streamlit** to rapidly prototype a full-featured Integrated Development Environment (IDE) inside the browser.

## Key Features

### 1. Monaco Code Editor
We integrate the `streamlit-code-editor` plugin, which uses the official Microsoft Monaco editor (the engine behind VS Code). It supports:
- Syntax highlighting for 50+ languages.
- Auto-indentation and bracket pairing.
- Code folding and line numbers.

### 2. Dynamic Theming (Light / Dark Mode)
The UI features a robust custom CSS engine that overrides Streamlit's default styles to create a premium aesthetic.
- **Cyber Dark Mode**: Deep radial gradients, soft slates, and neon-glowing interactive elements (Frosted Glassmorphism).
- **Premium Light Mode**: A sleek blend of whites, silvers, and golden accents for high-contrast visibility.
- **Theme Persistence**: The user's theme selection is stored in `st.session_state` and seamlessly applies custom CSS injections on the fly.

### 3. Google OAuth 2.0 Gatekeeper
The frontend is fully protected. If `token` is missing from `st.session_state` or the URL parameters, the entire application is hidden behind a highly attractive Google Login screen.
Once logged in, the `api.py` utility class automatically attaches the JWT Bearer token to all outbound REST requests to the backend.

### 4. Real-time AI Streaming
When "AI Review" is clicked, the frontend opens a Server-Sent Events (SSE) connection. The Streamlit Chat interface dynamically updates character-by-character as Mistral AI generates the code review, creating a highly engaging user experience.
