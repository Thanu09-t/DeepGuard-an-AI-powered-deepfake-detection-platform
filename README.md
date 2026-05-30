# DeepGuard — AI Deepfake Detection Platform

<div align="center">

![DeepGuard Banner](https://img.shields.io/badge/DeepGuard-AI%20Deepfake%20Detection-00f0ff?style=for-the-badge&logo=shield&logoColor=white)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**AI-powered deepfake detection platform for video, image & audio — with real-time webcam scanning, forensic PDF reports, analytics dashboard, and a Gemini AI chatbot.**

[🚀 Live Demo](#) · [📖 Documentation](#getting-started) · [🐛 Report Bug](../../issues) · [✨ Request Feature](../../issues)

</div>

---

## ✨ Features

- 🎥 **Multi-Modal Detection** — Analyze video, image, and audio files for synthetic manipulation
- 📷 **Live Webcam Scanning** — Real-time deepfake detection directly in the browser
- 🧠 **Advanced ML Models** — Vision Transformer (images), TimeSformer+LSTM (video), Wav2Lip CNN (audio)
- 📄 **Forensic PDF Reports** — Download detailed audit reports of every scan
- 📊 **Analytics Dashboard** — Track detection trends, risk distributions and manipulation typology
- 🤖 **Gemini AI Chatbot** — Integrated Google Gemini chatbot for contextual guidance
- 🌌 **Cinematic UI** — Space-travel inspired glassmorphism design with smooth micro-animations

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | Core UI framework |
| Vite 8 | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations |
| Recharts | Analytics charts |
| React Router v7 | Client-side routing |
| jsPDF + html2canvas | PDF report generation |
| Google Gemini API | AI Chatbot |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| SQLAlchemy + Alembic | ORM & database migrations |
| PostgreSQL | Database |
| Pydantic | Data validation |
| Uvicorn | ASGI server |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **Python** 3.10+
- **PostgreSQL** (or use SQLite for development)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/deepguard.git
cd deepguard
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run the server
uvicorn main:app --reload
```
Backend will be available at `http://localhost:8000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start the dev server
npm run dev
```
Frontend will be available at `http://localhost:5173`

---

## 📁 Project Structure

```
deepguard/
├── backend/
│   ├── api/             # API route handlers
│   ├── core/            # Core config & dependencies
│   ├── database/        # DB models & migrations
│   ├── services/        # Business logic & ML services
│   ├── main.py          # FastAPI application entry
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route-level page components
│   │   └── index.css    # Global styles
│   ├── vite.config.ts
│   └── package.json
│
├── .gitignore
├── .env.example
├── LICENSE
└── README.md
```

---

## 🔑 Environment Variables

Create a `.env` file in both `backend/` and `frontend/` directories. See [`.env.example`](.env.example) for reference.

### Backend `.env`
```env
DATABASE_URL=postgresql://user:password@localhost:5432/deepguard
SECRET_KEY=your_secret_key_here
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 📸 Screenshots

> Add screenshots of your application here.

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Google Gemini API](https://ai.google.dev/) for the AI chatbot
- [FastAPI](https://fastapi.tiangolo.com/) for the blazing fast backend
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Lucide React](https://lucide.dev/) for icons

---



