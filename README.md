# MedTrack: AI-Powered Prescription Cascade Checker 💊

MedTrack is a clinical decision support tool designed to identify **"Prescription Cascades"**—a medical phenomenon where the side effects of one medication are misdiagnosed as a new condition, leading to unnecessary additional prescriptions.

By combining the reasoning power of **Llama 3.3 (via Groq)** with the visual intelligence of **Gemini 1.5 Flash**, MedTrack empowers users to understand their medication risks and facilitates safer conversations with healthcare providers.

---

## 🚀 Features

- **AI Interaction Cascade Checker:** Multi-stage analysis of drug-drug and drug-class interactions.
- **Prescription OCR:** Upload images of prescriptions to automatically extract drug names and dosages.
- **Cloud History Sync:** Secure, real-time synchronization between browser and **Firebase Firestore**.
- **Voice-Enabled Reports:** Native "Read Aloud" functionality for accessibility.
- **Interactive Risk Dashboard:** Data-driven visualizations of safety vs. risk scores.
- **Clean UI/UX:** Built with a modern, "anti-gravity" aesthetic using Tailwind CSS and Lucide Icons.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend:** Flask (Python 3.10+), Groq Llama-3.3-70B, Google Gemini 1.5 Flash.
- **Database/Auth:** Firebase Authentication & Google Firestore.
- **Deployment:** Vercel (Next.js) + Flask-ready API folder.

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- Python 3.10+ and Node.js 18+.
- A Groq API Key, Google AI Studio Key, and Firebase Project.

### 2. Backend Setup (Flask)
From the root directory:
```powershell
# Create and activate environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install flask flask-cors python-dotenv requests google-generativeai Pillow

# Start the backend
flask --app api/index run --port 5000
3. Frontend Setup (Next.js)
In a new terminal:
# Install packages
npm install

# Start development server
npm run dev
MedTrack/
├── api/
│   ├── index.py          # Main Flask API (Groq & Gemini logic)
│   └── data_parser.py    # Local DDI database store
├── src/
│   ├── app/              # Next.js Pages (Checker, Profile, History)
│   ├── components/       # UI Components (Sidebar, TopBar)
│   └── lib/              # Logic (Firebase config, History Service)
├── public/               # Static assets
├── .env                  # Backend Secrets
├── .env.local            # Frontend Secrets
└── package.json          # Node dependencies
🏥 Clinical Disclaimer
MedTrack is NOT a medical device. It is an educational and clinical decision support tool. It does not provide medical advice, diagnosis, or treatment. Always consult with a licensed physician or pharmacist before making any changes to your medication regimen.

📜 License
© 2026 MedTrack. Developed for safer medicine management.
