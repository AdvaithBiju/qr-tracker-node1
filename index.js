const express = require("express");
const app = express();

const PORT = process.env.PORT || 5000;

// Read form data
app.use(express.urlencoded({ extended: true }));

// In-memory data (later can be DB)
const tagData = {};

// HTML layout + CSS
function renderPage(title, content) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      :root {
        --bg: #020617;
        --bg2: #0f172a;
        --card: #020617;
        --accent: #22c55e;
        --accent-soft: rgba(34, 197, 94, 0.15);
        --border: rgba(148, 163, 184, 0.4);
        --text-main: #e5e7eb;
        --text-muted: #9ca3af;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: radial-gradient(circle at top, #0f172a, #020617 50%, #020617);
        color: var(--text-main);
      }
      .page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .card {
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.97));
        border-radius: 20px;
        padding: 24px 28px;
        width: 100%;
        max-width: 460px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
        border: 1px solid var(--border);
      }
      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      .title {
        font-size: 1.6rem;
        font-weight: 700;
        letter-spacing: 0.03em;
      }
      .badge {
        background: var(--accent-soft);
        color: var(--accent);
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 0.75rem;
        font-weight: 600;
        border: 1px solid rgba(34, 197, 94, 0.35);
      }
      .subtitle {
        margin: 0 0 18px 0;
        font-size: 0.9rem;
        color: var(--text-muted);
      }
      .field { margin-bottom: 14px; }
      .label {
        display: block;
        font-size: 0.85rem;
        font-weight: 500;
        margin-bottom: 4px;
        color: #cbd5f5;
      }
      .input,
      .textarea {
        width: 100%;
        padding: 9px 10px;
        border-radius: 10px;
        border: 1px solid rgba(148, 163, 184, 0.5);
        background: rgba(15, 23, 42, 0.9);
        color: var(--text-main);
        font-size: 0.9rem;
        outline: none;
      }
      .input:focus,
      .textarea:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 1px var(--accent-soft);
      }
      .textarea { resize: vertical; min-height: 70px; }
      .btn-row {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 10px;
      }
      .btn {
        border: none;
        border-radius: 999px;
        padding: 8px 16px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .btn-primary {
        background: var(--accent);
        color: #022c22;
      }
      .btn-primary:hover { filter: brightness(1.05); }
      .btn-ghost {
        background: transparent;
        color: var(--text-muted);
        border: 1px solid rgba(148, 163, 184, 0.4);
      }
      .btn-ghost:hover {
        border-color: var(--accent);
        color: var(--accent);
      }
      .meta {
        margin-top: 12px;
        font-size: 0.8rem;
        color: var(--text-muted);
        border-top: 1px dashed rgba(148, 163, 184, 0.4);
        padding-top: 8px;
      }
      .detail-row { margin-bottom: 8px; }
      .detail-label {
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.09em;
        color: var(--text-muted);
      }
      .detail-value {
        font-size: 0.95rem;
        font-weight: 500;
      }
      a { color: var(--accent); text-decoration: none; }
      a:hover { text-decoration: underline; }
      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas;
        font-size: 0.8rem;
        background: rgba(15, 23, 42, 0.9);
        padding: 2px 6px;
        border-radius: 6px;
        border: 1px solid rgba(148, 163, 184, 0.4);
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="card">
        ${content}
      </div>
    </div>
  </body>
  </html>
  `;
}

// Home
app.get("/", (req, res) => {
  res.send(
    renderPage(
      "QR Tracker",
      `
        <div class="card-header">
          <div class="title">QR Tracker</div>
          <div class="badge">Live</div>
        </div>
        <p class="subtitle">
          Attach a unique QR to your items. The first scan registers details,
          future scans show the owner info.
        </p>
        <p style="font-size:0.9rem;">
          For testing, open <code>/tag/tag001</code> in the URL bar.
        </p>
        <div class="meta">
          Tip: Use different IDs like <code>tag001</code>, <code>tag002</code>, etc.
        </div>
      `
    )
  );
});

// View / first-time register
app.get("/tag/:id", (req, res) => {
  const id = req.params.id;
  const data = tagData[id];

  if (!data) {
    // registration form
    res.send(
      renderPage(
        `Register tag ${id}`,
        `
          <div class="card-header">
            <div class="title">Register Tag</div>
            <div class="badge">ID: ${id}</div>
          </div>
          <p class="subtitle">
            First time scan detected. Add your contact details for this tag.
          </p>

          <form method="POST" action="/tag/${id}">
            <div class="field">
              <label class="label">Full name</label>
              <input class="input" type="text" name="name" required />
            </div>

            <div class="field">
              <label class="label">Phone number</</label>
              <input class="input" type="text" name="phone" required />
            </div>

            <div class="field">
              <label class="label">Message for finder (optional)</label>
              <textarea
                class="textarea"
                name="message"
                rows="3"
                placeholder="Example: Call me if found near campus."
              ></textarea>
            </div>

            <div class="btn-row">
              <button type="submit" class="btn btn-primary">
                Save details
              </button>
            </div>
          </form>

          <div class="meta">
            Anyone scanning this QR later will see these details.
            You can update them anytime using the edit option.
          </div>
        `
      )
    );
  } else {
    // details view
    res.send(
      renderPage(
        `Tag ${id} details`,
        `
          <div class="card-header">
            <div class="title">Owner Details</div>
            <div class="badge">ID: ${id}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">Name</div>
            <div class="detail-value">${data.name}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">Phone</div>
            <div class="detail-value">
              <a href="tel:${data.phone}">${data.phone}</a>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-label">Message</div>
            <div class="detail-value">
              ${data.message || "No message provided."}
            </div>
          </div>

          <div class="btn-row">
            <a href="/tag/${id}/edit" class="btn btn-ghost">✏️ Edit details</a>
          </div>

          <div class="meta">
            Share this QR only with people you trust.
            Anyone with the QR can view these details.
          </div>
        `
      )
    );
  }
});

// Save first-time registration
app.post("/tag/:id", (req, res) => {
  const id = req.params.id;
  const { name, phone, message } = req.body;
  tagData[id] = { name, phone, message };
  res.redirect(`/tag/${id}`);
});

// Edit form
app.get("/tag/:id/edit", (req, res) => {
  const id = req.params.id;
  const data = tagData[id];
  if (!data) return res.redirect(`/tag/${id}`);

  res.send(
    renderPage(
      `Edit tag ${id}`,
      `
        <div class="card-header">
          <div class="title">Edit Tag Details</div>
          <div class="badge">ID: ${id}</div>
        </div>
        <p class="subtitle">
          Update your contact information. Changes are saved instantly.
        </p>

        <form method="POST" action="/tag/${id}/edit">
          <div class="field">
            <label class="label">Full name</label>
            <input class="input" type="text" name="name" value="${data.name}" required />
          </div>

          <div class="field">
            <label class="label">Phone number</label>
            <input class="input" type="text" name="phone" value="${data.phone}" required />
          </div>

          <div class="field">
            <label class="label">Message for finder (optional)</label>
            <textarea class="textarea" name="message" rows="3">${data.message || ""}</textarea>
          </div>

          <div class="btn-row">
            <a href="/tag/${id}" class="btn btn-ghost">⬅ Back</a>
            <button type="submit" class="btn btn-primary">Save changes</button>
          </div>
        </form>
      `
    )
  );
});

// Handle edit submit
app.post("/tag/:id/edit", (req, res) => {
  const id = req.params.id;
  const { name, phone, message } = req.body;
  tagData[id] = { name, phone, message };
  res.redirect(`/tag/${id}`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
