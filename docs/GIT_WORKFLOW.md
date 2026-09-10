# Git Workflow & Commit Conventions

This project strictly adheres to conventional commit semantics to maintain a clean and readable history.

## Commit Message Format
All commits must follow this format:
`<type>: <description>`

### Allowed Types
- **feat:** A new feature
- **fix:** A bug fix
- **test:** Adding missing tests or correcting existing tests
- **docs:** Documentation only changes
- **refactor:** A code change that neither fixes a bug nor adds a feature
- **chore:** Routine tasks, dependency updates, or repository maintenance

### Examples
- `feat: integrate LiteLLM`
- `feat: add MCP code analysis tool`
- `fix: handle invalid code input`
- `test: add review API tests`
- `docs: update setup instructions`
- `refactor: simplify review graph`
- `chore: update project dependencies`

### Rules
1. One completed feature/fix/documentation task = one meaningful commit.
2. Avoid meaningless commit messages such as `update`, `changes`, `fixed`, `working`, or `final`.
3. Follow the workflow: `IMPLEMENT -> TEST -> FIX -> VERIFY -> COMMIT`.
