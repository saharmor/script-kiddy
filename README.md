# Script Kiddy

A web application with React frontend and Python backend.

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- npm or yarn package manager
- Vite (install globally with `npm install -g vite` or `yarn global add vite`)

## Installation

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the development server:
```bash
python app.py
```

The backend API will be available at `http://localhost:8000`

## Development

### Frontend

- Run lint checks:
```bash
npm run lint
# or
yarn lint
```

- Build for production:
```bash
npm run build
# or
yarn build
```

### Backend

- Run tests:
```bash
python -m pytest
```
