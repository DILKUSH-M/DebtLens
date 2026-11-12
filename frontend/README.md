# DebtLens frontend

The frontend is a responsive React/Vite dashboard for the DebtLens silent technical
debt prototype. It starts with a clearly labelled local mock view so the UI can be
worked on before the backend contract is available.

## Run locally

```bash
npm install
npm run dev
```

The dashboard uses mock analysis data when `VITE_API_BASE_URL` is empty. The
**Run analysis** button simulates a short run in this mode; it does not hide API
errors when a backend URL is configured.

To connect the backend, copy `.env.example` to `.env.local` and set:

```text
VITE_API_BASE_URL=http://localhost:8000
```

The API service currently expects:

- `GET /api/analyses/latest` for the latest analysis.
- `GET /api/analyses/:runId` for a specific run.
- `POST /api/analyses` with `{ "repository": "...", "branch": "..." }` to start
  an analysis.

The response should include `score`, `timestamp`, `repository`, `branch`,
`methodology`, `status`, `categories`, `hotspots`, and `findings`. Finding
`line`, `evidence`, and `suggestion` fields are optional.

## Notes

- The score is a prototype maintainability metric: **higher means more detected
  debt**, not more security risk.
- LLM-generated text is displayed as an explanation or suggested refactor, never
  as a verified fix.
- History is currently a static mock view and must be replaced with API data when
  the history endpoint is agreed.
