# Navy Night Odyssey

A single-page, standalone, mobile-first website created as a surprise gift for a 23-year-old engineering student.

Featuring a deep navy night sky (`#050B1F` to `#0B1F4D`), drifting ice-white stars, electric-cyan glows, soft-gold accents, synthesized ambient celestial soundscapes (Web Audio API), interactive constellation blueprints, and starlight games.

---

## Deploying from GitHub (GitHub Pages)

This project is configured with zero-config GitHub Actions deployment and relative asset paths (`base: './'` in `vite.config.ts`) so it works automatically under any GitHub repository name:

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of Navy Night Odyssey"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Enable GitHub Pages via Actions**:
   - In your GitHub repository, click on **Settings** (top tab).
   - In the left sidebar, click on **Pages**.
   - Under **Build and deployment** → **Source**, change from "Deploy from a branch" to **GitHub Actions**.

3. **Automatic Deployment**:
   - Every push to `main` or `master` will trigger the workflow at `.github/workflows/deploy.yml`.
   - Your live website will be available at `https://<your-username>.github.io/<your-repo-name>/`.

---

## Local Development

```bash
# Install dependencies
npm install

# Start local development server (port 3000)
npm run dev

# Build production bundle to /dist
npm run build

# Preview production build locally
npm run preview
```

---

## Website Features

- **Constellation Maker**: Connect glowing stars to draw four engineering traits: *Strength and Discipline*, *Direction and Purpose*, *Brilliant Ideas*, and *Loyalty*.
- **Meteor Dodge**: Glide a small ship through sparse stardust meteors for 20 seconds with 5 protective shields and forgiving hitboxes.
- **Wish Catcher**: Tap gentle falling stars to fill the Hope Meter with no misses counted.
- **Grand Finale**: Star rearrangement into a luminous **"N"**, a shooting star shower, and reveal of **"Secret Code: STARDUST"**.
- **Interactive Surprises**:
  - Tapping the moon cycles its 8 phases (tapping 7 times unlocks the "Moonwalker" easter egg).
  - Drifting comet appears every 20 seconds; tap it to catch it.
  - Secret Dawn scene toggle reveals a morning horizon.
  - Type `"hello"` or send it via the cosmic transmitter for a secret signal greeting.
  - Faint star in the corner reveals the "Starlight Secret" badge.
- **Reset Button**: Available in both the top header and bottom navigation bar with a gentle in-app confirmation modal.
