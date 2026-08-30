# Deploy this portfolio from GitHub to Netlify

This project is set up for the recommended workflow:

**GitHub stores the source code → Netlify watches the GitHub repository → every push to `main` automatically builds and publishes the site.**

You do not need GitHub Pages. GitHub Pages cannot run the Netlify Functions used by the portfolio editor, authentication, uploads and persistent content storage.

## 1. Create the GitHub repository

You can do this entirely in your browser.

1. Sign in to GitHub.
2. Choose **New repository**.
3. Name it something like `performer-portfolio`.
4. Choose **Private** if you do not want the source code publicly visible, or **Public** if that is acceptable for your coursework.
5. Do not add another README, `.gitignore` or licence when creating the repository because this project already contains the required files.
6. Create the repository.

## 2. Upload this project to GitHub

1. Open the new empty repository.
2. Choose **uploading an existing file** or **Add file → Upload files**.
3. Drag the contents of the unzipped `performer-portfolio-netlify` folder into the GitHub upload area.
4. Make sure these items are present at the top level of the repository:
   - `.github/`
   - `netlify/`
   - `public/`
   - `.gitignore`
   - `build.mjs`
   - `netlify.toml`
   - `package.json`
   - `package-lock.json`
   - `README.md`
5. Commit the files to the `main` branch.

> The generated `dist/` folder is intentionally ignored. Netlify creates it during each deployment by running `npm run build`.

## 3. Connect GitHub to Netlify

1. Sign in to Netlify.
2. Choose **Add new project → Import an existing project**.
3. Select **GitHub**.
4. Authorise Netlify to access the repository if prompted.
5. Select your `performer-portfolio` repository.
6. Netlify will read `netlify.toml`, so the expected settings are already defined:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
7. Deploy the project.

## 4. Add the private admin password

The password must never be committed to GitHub.

In Netlify:

1. Open the deployed project.
2. Open **Project configuration → Environment variables**.
3. Add a variable named `ADMIN_PASSWORD`.
4. Give it the password you want to use for the private editor.
5. Make sure it is available to Functions.
6. Trigger a new production deploy.

Your editor will then be available at:

`https://YOUR-SITE.netlify.app/admin.html`

## 5. Automatic deployments

After GitHub and Netlify are connected, the workflow is simple:

1. Edit or upload files in GitHub.
2. Commit the changes to `main`.
3. Netlify detects the commit automatically.
4. Netlify runs the build.
5. The updated portfolio becomes the new production version.

The `.github/workflows/build-check.yml` workflow also checks every push and pull request to make sure the project still builds successfully before you rely on the Netlify deployment.

## What should NOT be stored in GitHub

Never commit:

- your `ADMIN_PASSWORD`
- `.env` files containing secrets
- Netlify authentication tokens

These are already covered by the project's `.gitignore` where appropriate.

## Editing portfolio content after deployment

For normal portfolio updates, you usually do **not** need to change GitHub at all. Use `/admin.html` to update your biography, credits, skills, gallery, CV and showreel. Those changes are stored through Netlify rather than being committed to the repository.

Use GitHub when you want to change the site's actual design, HTML, CSS, JavaScript or Functions.
