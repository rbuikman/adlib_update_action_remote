# GitHub Pages Deployment Instructions

## Step 1: Create a New GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `adlib-update-action-remote`)
3. Make it **public** (required for GitHub Pages on free accounts)
4. Do NOT initialize with README, .gitignore, or license (we already have these)

## Step 2: Initialize Git and Link to Repository

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Axiell Collections update action plugin"

# Add your GitHub repository as remote (replace with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/adlib-update-action-remote.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to GitHub Pages

```bash
# Build and deploy to GitHub Pages
npm run deploy
```

This will:
1. Build the production version (`npm run build`)
2. Deploy the `dist` folder to the `gh-pages` branch
3. Make it available at: `https://YOUR_USERNAME.github.io/adlib-update-action-remote/`

## Step 4: Configure in WoodWing Assets

After deployment, configure the plugin in Assets Management Console:

1. Go to **Management Console > Plugins > External Action plugins**
2. Click **Add Plugin**
3. Configure:
   - **Name**: Update metadata from AC (Remote)
   - **URL**: `https://YOUR_USERNAME.github.io/adlib-update-action-remote/index.html`
   - **Title**: Update metadata from Axiell Collections
   - **User interface**: Dialog
   - **Dialog width**: 800
   - **Dialog height**: 400
   - **Add to**: Toolbar, Asset context menu
   - **Required roles**: ROLE_CUSTOM_SYNC_AXIELL_COLLECTIONS

## Step 5: Update Configuration

After deployment, update `config/config.json` with your actual Assets server URL:

```json
{
    "CLIENT_URL_WHITELIST": [
        "https://your-assets-server.com",
        "http://localhost:8080"
    ]
}
```

Then redeploy:
```bash
npm run deploy
```

## Future Updates

Whenever you make changes:

```bash
# Make your changes to src/ files
# Then deploy:
npm run deploy
```

The plugin will be automatically updated on GitHub Pages.

## Troubleshooting

### GitHub Pages not working?
- Repository must be **public** (or you need GitHub Pro for private repos)
- Check GitHub repository Settings > Pages
- Source should be set to "gh-pages" branch
- Wait a few minutes after first deployment

### Plugin not loading in Assets?
- Check browser console for CORS or loading errors
- Verify the URL in plugin configuration matches exactly
- Make sure your Assets server URL is in the whitelist
