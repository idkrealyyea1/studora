# 🎓 Studora — Setup & Deployment Guide

A premium academic services marketplace — hosted 100% free on GitHub Pages.

---

## 📁 Project Structure

```
studora/
├── index.html               ← Main website file
├── assets/
│   ├── css/
│   │   └── main.css         ← All styles (Dark Purple & Gold theme)
│   ├── js/
│   │   └── main.js          ← All JavaScript
│   └── images/              ← (Add your images here)
├── data/
│   └── services.json        ← ⭐ Edit this to manage your services
├── google-apps-script.js    ← Paste this into Google Apps Script
└── README.md                ← This file
```

---

## 🚀 Step 1 — Set Up Google Sheets (Free Backend)

### A. Create the Spreadsheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: **Studora Applications**

### B. Connect Apps Script
1. Click **Extensions** → **Apps Script**
2. Delete any existing code
3. Open `google-apps-script.js` from this project
4. Copy ALL the code and paste it into Apps Script
5. Click **Save** (Ctrl+S or ⌘S)

### C. Deploy as Web App
1. Click **Deploy** → **New Deployment**
2. Click the gear icon ⚙️ → Select **Web App**
3. Set:
   - **Description:** Studora Form Handler
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. Click **Authorize access** and allow permissions
6. **Copy the Web App URL** — you'll need this next

---

## ⚙️ Step 2 — Connect Website to Google Sheets

1. Open `assets/js/main.js`
2. Find the `CONFIG` object at the top:

```javascript
const CONFIG = {
  GOOGLE_SCRIPT_URL: "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE",  // ← Paste URL here
  WHATSAPP_NUMBER:   "970XXXXXXXXX",    // ← Your WhatsApp (e.g. "970591234567")
  EMAIL:             "hello@studora.com", // ← Your email
  ...
};
```

3. Replace each value with your real information
4. Save the file

---

## 📝 Step 3 — Edit Your Services

Open `data/services.json` to add, edit, or remove services.

### Service Object Structure:
```json
{
  "id":              "s001",           // Unique ID (don't repeat)
  "title":           "Essay Writing",  // Service name
  "description":     "Short summary",  // Shown on card
  "longDescription": "Full details",   // Shown in popup modal
  "category":        "Writing",        // Filter category
  "emoji":           "✍️",            // Card image (emoji)
  "price":           "From $10",       // Display price
  "priceValue":      10,               // Numeric price (for sorting)
  "deliveryTime":    "24 – 72 hours",  // Delivery estimate
  "features": [                        // Bullet points in modal
    "Feature one",
    "Feature two"
  ],
  "active": true                       // Set false to hide service
}
```

### To add a new service:
1. Copy an existing service object
2. Change the `id` (must be unique, e.g. `"s013"`)
3. Edit title, description, price, etc.
4. Save the file

### To hide a service (without deleting):
Set `"active": false`

### Categories (create any you want):
- `"Writing"` — Essays, assignments, research
- `"Academic"` — Thesis, lit review, statistics
- `"Tutoring"` — Tutoring, exam prep
- `"Design"` — Presentations
- `"Translation"` — Translation services

---

## 🌐 Step 4 — Deploy to GitHub Pages (Free Hosting)

### A. Create a GitHub Repository
1. Go to [github.com](https://github.com) and sign in
2. Click **+** → **New Repository**
3. Name it: `studora` (or any name)
4. Set to **Public**
5. Click **Create Repository**

### B. Upload Your Files
**Option 1 — Using GitHub website:**
1. Click **Add file** → **Upload files**
2. Drag all your project files
3. Click **Commit changes**

**Option 2 — Using Git (recommended):**
```bash
git init
git add .
git commit -m "Initial Studora deployment"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/studora.git
git push -u origin main
```

### C. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select: **Deploy from a branch**
4. Select branch: **main**, folder: **/ (root)**
5. Click **Save**
6. Wait 2-3 minutes

Your site will be live at:
`https://YOURUSERNAME.github.io/studora/`

---

## ✏️ Step 5 — Customize the Website

### Update Contact Info (index.html)
Search for these placeholders and replace:
- `970XXXXXXXXX` → Your WhatsApp number
- `hello@studora.com` → Your email
- Social media links in the footer

### Update WhatsApp Number (main.js)
```javascript
WHATSAPP_NUMBER: "970591234567",  // Your number with country code, no +
```

### Change Colors (main.css)
Edit the CSS variables at the top of `main.css`:
```css
:root {
  --gold: #c9a84c;        /* Main gold color */
  --purple-accent: #4a2fa0; /* Purple accent */
  ...
}
```

### Edit Testimonials (index.html)
Find the `.testimonials-grid` section and edit each `.testimonial-card`

### Edit FAQ (index.html)
Find the `.faq-list` section and edit each `.faq-item`

---

## 🔄 Updating Services After Deployment

Every time you edit `services.json`:
1. Save the file
2. Push to GitHub:
```bash
git add data/services.json
git commit -m "Updated services"
git push
```
3. Changes go live within 1-2 minutes

---

## 📊 Managing Applications in Google Sheets

When a student submits a form, a new row appears in your sheet with:
- **Timestamp** — When they applied
- **Name** — Student's name
- **Phone** — Contact number (call or WhatsApp them)
- **Email** — Optional email
- **Service** — What they need
- **Price** — Service price shown
- **Notes** — Their requirements/message
- **Status** — Default "New" (change to "Contacted", "In Progress", "Done")

To filter by status: **Data → Create a filter**

---

## 🔧 Troubleshooting

### Form not submitting to Google Sheets?
- Make sure you deployed the Apps Script as a **Web App**
- Make sure **Who has access** is set to **Anyone**
- Check that the URL in `main.js` CONFIG is correct
- Test by opening: `YOUR_SCRIPT_URL` in browser — should show `{"status":"running"}`

### Website not loading on GitHub Pages?
- Make sure all file paths are relative (not absolute)
- Check that `index.html` is in the root folder
- GitHub Pages takes up to 10 minutes for first deployment

### Services not showing?
- Make sure `data/services.json` is valid JSON (check with [jsonlint.com](https://jsonlint.com))
- Make sure services have `"active": true`

---

## 📞 Need Help?

Contact information is already set up in the website's contact section. Update the WhatsApp and email in `index.html` and `main.js` to point to your real contact details.

---

*Built with ❤️ for Studora — 100% free, forever.*
