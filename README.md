# Nutri-Fit

**Nutri-Fit** is a personalized fitness and nutrition web application that generates custom workout and meal plans based on your body type, fitness goals, equipment access, and dietary preferences. It uses adaptive logic, progress tracking, and real-time feedback to keep users consistent and motivated.

---

## 🚀 Features

* **Personalized Onboarding**: Tailor recommendations based on age, height, weight, and goal (cut, bulk, maintain).
* **Custom Workouts**: Generate exercise routines matching available equipment and preferred training styles.
* **Meal Suggestions**: AI-driven food options with macro tracking, USDA integration, and dietary preference filtering.
* **Smart Feedback**: Log completed workouts and meals; system adjusts your weekly plan dynamically.
* **Visual Dashboards**: Track body-fat %, consistency streaks, calorie consumption, and workout stats over time.
* **Firebase Authentication**: Secure user sign-up, login, and session management.
* **Interactive Exercise Guides**: View animated demos with step-by-step or video modes.
* **Quick-Fit Workouts**: Build short routines based on time, day, and session frequency.
* **Gamified Friends & Streaks**: Add friends, earn badges, and share fitness challenges.
* **Dark Mode & Accessibility**: Toggle light/dark themes, high contrast, and font scaling.

---

## 📁 Project Structure

```
nutri-fit/             # Root directory
├── backend/           # Flask API, database schema, business logic
│   ├── app.py         # Entry point for Flask server
│   ├── database.py    # SQLite schema and CRUD functions
│   ├── nutrition_utils.py  # Food search, USDA integration
│   ├── fitness_utils.py    # Workout generation and recommendations
│   └── ...            # Other modules and utilities

├── frontend/          # React single-page application
│   ├── src/           # Components, pages, hooks
│   ├── public/        # Static assets, index.html
│   ├── package.json   # Frontend dependencies and scripts
│   └── ...

└── README.md          # Project overview and setup instructions
```

---

## 🛠️ Prerequisites

* **Node.js** (v14+) & **npm**
* **Python** (3.8+)
* **pip**
* **Git**

---

## 🔧 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/nutri-fit.git
   cd nutri-fit
   ```

2. **Backend**

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate   # macOS/Linux
   venv\Scripts\activate     # Windows PowerShell
   pip install -r requirements.txt
   ```

4. **Initialize Database**

   ```bash
   python app.py         # This auto-creates `nutrifit.db` and migrations
   ```

5. **Frontend**

   ```bash
   cd ../frontend
   npm install
   npm start            # Runs on http://localhost:3000
   ```
---

## ▶️ Running the App

* **Web Client**: `cd frontend && npm start` ([http://localhost:3000](http://localhost:3000))

Ensure your React proxy (`frontend/package.json: "proxy": "http://localhost:5000"`) is set so `/api/*` routes forward correctly.

---

## 📒 Usage

1. Sign up or log in via the frontend.
2. Complete your profile questionnaire (age, height, weight, equipment, goals).
3. Browse your personalized dashboard for meal and workout suggestions.
4. Log foods by selecting suggestions or scanning barcodes.
5. Mark workouts as complete; view progress graphs and stats.

---

## Environment

Create a `.env` in your `/backend` folder:

```bash
USDA_API_KEY=your_usda_api_key_here // You will need to set up the USDA food API key
```
---
