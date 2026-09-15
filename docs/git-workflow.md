# Git Workflow & Contribution Guide

To maintain a clean and understandable project history, this project follows a standardized Git workflow and Conventional Commits.

## Branching Strategy

We use a feature-branch workflow. **Do not commit directly to the `master` branch.**

1. **`master` branch**: The main branch. It should always reflect a production-ready (or highly stable) state.
2. **Feature branches**: When working on new features or bug fixes, create a new branch from `master`.
   
### Branch Naming Conventions
- `feature/<short-description>`: For new features (e.g., `feature/java-execution`)
- `bugfix/<short-description>`: For bug fixes (e.g., `bugfix/oauth-redirect-error`)
- `docs/<short-description>`: For documentation updates (e.g., `docs/api-guide`)
- `hotfix/<short-description>`: For urgent production fixes.

## Commit Message Guidelines

We enforce the **Conventional Commits** standard. Every commit message must be structured as follows:

```
<type>(<optional scope>): <description>
```

### Allowed Types:
- `feat`: A new feature (e.g., `feat(ui): add dark mode toggle`)
- `fix`: A bug fix (e.g., `fix(executor): resolve python timeout issue`)
- `docs`: Documentation only changes (e.g., `docs: add setup guide`)
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

### Example Commits:
- `feat(api): implement Google OAuth 2.0 router`
- `fix(frontend): stop Auto-Detect from sending invalid language tag`
- `docs: add comprehensive project architecture diagrams`

## Pull Request Process

1. Push your branch to the remote repository.
2. Open a Pull Request (PR) against the `master` branch.
3. Ensure your PR description clearly explains *what* was changed and *why*.
4. A code review is required before merging.
5. Once approved, merge using **Squash and Merge** to keep the `master` history clean and linear.
