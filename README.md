# BFHL Full-Stack Application

Production-ready full-stack implementation for the BFHL hierarchy evaluator.

## Project Structure

```text
BAJAJ/
├── backend/
│   ├── index.js
│   ├── routes/
│   │   └── bfhl.js
│   ├── logic/
│   │   ├── validator.js
│   │   ├── treeBuilder.js
│   │   └── summarizer.js
│   ├── test.js
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
└── README.md
```

## Local Setup

### 1) Backend

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:3000`.

### 2) Run API Assertions

Keep backend server running in one terminal, then in another:

```bash
cd backend
npm test
```

This runs `test.js` and validates:
- identity fields
- hierarchy roots, depths, and cycle object shape
- invalid entries and duplicate edges
- summary totals and largest tree root

### 3) Frontend

Open `frontend/index.html` in a browser (or serve statically with any web server).

Frontend API base lives in `frontend/app.js`:

```js
const API_BASE = 'http://localhost:3000';
```

Replace this with your deployed backend URL before publishing frontend.

## API Contract

### Endpoint

- `POST /bfhl`
- Header: `Content-Type: application/json`
- Body:

```json
{
  "data": ["A->B", "A->C"]
}
```

### Response

Returns:
- `user_id`
- `email_id`
- `college_roll_number`
- `hierarchies`
- `invalid_entries`
- `duplicate_edges`
- `summary`

`has_cycle` is present only for cyclic entries.  
`depth` is present only for non-cyclic entries.

## Deployment

## Backend on Render

1. Push code to a public GitHub repo.
2. Create Render **Web Service**.
3. Set Root Directory: `backend/`
4. Build Command: `npm install`
5. Start Command: `node index.js`
6. Deploy and copy backend URL (example: `https://your-service.onrender.com`).

## Frontend on Vercel/Netlify

1. Update `frontend/app.js`:
   - `const API_BASE = 'https://your-service.onrender.com';`
2. Deploy `frontend/` as static site.
3. Verify frontend can call `POST /bfhl` on deployed backend.

## Evaluator Checklist Mapping

- CORS enabled globally before routes (`backend/index.js`).
- Validation regex and self-loop handling in `backend/logic/validator.js`.
- Multi-parent silent discard and component cycle logic in `backend/logic/treeBuilder.js`.
- Summary tie-breaking in `backend/logic/summarizer.js`.
- Sample payload assertions in `backend/test.js`.
- Frontend includes:
  - multiline parser
  - load example button
  - loading state
  - timeout warning (3s)
  - clear API/network/malformed JSON errors
  - visual recursive tree renderer (not raw JSON)
  - cycle card rendering
  - invalid and duplicate chip sections
