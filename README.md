# Update Metadata from Axiell Collections (Remote Action)

A WoodWing Assets external action plugin for updating metadata from Axiell Collections.

## Description

This plugin allows users to request metadata updates for selected assets from Axiell Collections. When invoked, it sets the `cf_acStatus` to "Metadata update requested" and resets the `cf_acTimestamp`, triggering the sync process.

## Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server (http://localhost:4003)
npm run dev

# Build for production
npm run build
```

### Deployment
Build the plugin and host the `dist` folder as a static website.

## Configuration

Edit `config/config.json` to configure:
- `CLIENT_URL_WHITELIST`: Add your WoodWing Assets Server URL(s)

## Setup in WoodWing Assets

1. Go to Management Console > Plugins > External Action plugins
2. Add a new plugin with:
   - **Name**: Update metadata from AC (Remote)
   - **URL**: [Your hosted URL]/index.html
   - **Title**: Update metadata from Axiell Collections
   - **User interface**: Dialog
   - **Add location**: Toolbar, Asset context menu
   - **Required roles**: ROLE_CUSTOM_SYNC_AXIELL_COLLECTIONS

## Usage

1. Select one or more assets in WoodWing Assets
2. Click the "Update metadata from AC (Remote)" button
3. The plugin will process each asset and display results
4. Assets with `cf_acRecordId` will be queued for metadata update
5. The sync process runs every minute to fetch updated metadata
