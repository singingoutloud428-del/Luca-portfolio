# Performer Portfolio — GitHub + Netlify ready

A responsive performer portfolio with a private in-site editor, persistent Netlify Blobs storage, image/PDF uploads, showreel embedding and a Netlify contact form.

## Included

- Public one-page performer portfolio
- Responsive phone/tablet/desktop design
- Hero/headshot, biography, showreel, skills, performance credits, training, gallery, CV, links and contact sections
- Dedicated `/login.html` sign-in page
- `/admin.html` private upload/editor dashboard
- Password login using a Netlify environment variable
- Persistent text/content storage with Netlify Blobs
- JPG/PNG/WEBP/GIF/PDF uploads up to 4 MB
- YouTube, Vimeo and direct MP4 showreel support
- Netlify Forms contact form
- No database to configure

## Recommended deployment — GitHub → Netlify

This repository is ready to be stored on GitHub and continuously deployed by Netlify. Every new commit to your GitHub `main` branch can trigger a fresh Netlify deployment automatically.

See **`GITHUB_DEPLOYMENT.md`** for browser-only, step-by-step setup instructions.

The repository also contains **`.github/workflows/build-check.yml`**, which verifies that the site builds successfully on pushes and pull requests.

### Alternative — Drag and drop

1. Sign in to Netlify first.
2. Unzip this project.
3. Drag the **whole `performer-portfolio-netlify` project folder** into Netlify Drop / Add new project. Do not drag only the `public` folder, because the project also needs its Functions.
4. Netlify will read `netlify.toml`, install the dependency, run the build and publish `dist`.
5. In Netlify open **Project configuration → Environment variables**.
6. Add `ADMIN_PASSWORD` with a strong password and make sure it is available to Functions.
7. Trigger a new production deploy so the password is available at runtime.
8. Open `https://YOUR-SITE.netlify.app/login.html`, sign in, and you will be taken to the private editor at `/admin.html`.

## Important upload note

The editor intentionally limits uploads to 4 MB because ordinary Netlify Function requests have a small payload limit. Upload your showreel to YouTube/Vimeo and paste its URL into the Showreel section. This is also much better for streaming performance.

## Local development (optional)

If you are comfortable using Terminal:

```bash
npm install
npx netlify dev
```

Then use the local URL shown by Netlify CLI. For authentication locally, set `ADMIN_PASSWORD` in your Netlify dev environment.

## Editing the default design

- Main styling: `public/assets/styles.css`
- Public rendering logic: `public/assets/site.js`
- Admin editor logic: `public/assets/admin.js`
- Starter portfolio data: `netlify/lib/default-content.mjs`

## Security

The admin password is never stored in the browser code or committed to the repository. It is read server-side from Netlify's environment variables. Successful login at `/login.html` creates an HttpOnly, Secure, SameSite cookie with a signed session token. The editor checks that session before loading and sends signed-out visitors back to the login page.
