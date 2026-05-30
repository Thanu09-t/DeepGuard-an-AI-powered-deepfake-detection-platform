# Contributing to DeepGuard

Thank you for your interest in contributing to DeepGuard! We welcome all contributions — bug fixes, new features, documentation improvements, and more.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Commit Message Convention](#commit-message-convention)

---

## 📜 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Harassment, discrimination, or abusive behavior of any kind will not be tolerated.

---

## 🤝 How to Contribute

### Reporting Bugs
1. Check if the bug has already been reported in [Issues](../../issues).
2. If not, open a new issue with a clear title, description, steps to reproduce, and expected vs actual behavior.

### Suggesting Features
1. Open a [Feature Request](../../issues/new) issue.
2. Describe the feature clearly and explain why it would be valuable to the project.

### Submitting Code Changes
1. Fork the repository.
2. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```
3. Make your changes following the style guidelines below.
4. Test your changes thoroughly.
5. Push your branch and open a Pull Request.

---

## 🛠️ Development Setup

See [README.md](README.md#getting-started) for the full setup guide.

**Quick Start:**
```bash
# Backend
cd backend && pip install -r requirements.txt && uvicorn main:app --reload

# Frontend
cd frontend && npm install && npm run dev
```

---

## ✅ Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR.
- Include a clear description of what the PR does and why.
- Reference any related issues (e.g., `Closes #42`).
- Make sure the project builds successfully (`npm run build`).
- Add or update documentation if your change affects public-facing behavior.

---

## 💬 Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): short description

Examples:
feat(chatbot): add retry logic for API failures
fix(report): resolve PDF download crash on dark themes
docs(readme): update setup instructions
chore(deps): upgrade vite to v8
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

Thank you for helping make DeepGuard better! 🙏
