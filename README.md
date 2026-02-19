# Design System Request Portal - Figma Plugin

A modern Figma plugin that seamlessly integrates with the Design System Request Portal, allowing designers to create component requests directly from Figma with automatic frame previews.

## Features

✨ **Key Capabilities:**
- 🔐 Secure API key authentication
- 📐 Select any Figma frame to create requests
- 🖼️ Automatic frame preview capture
- 🔗 Auto-fill Figma links
- 📋 View all your requests in-app
- 🎨 Modern, clean UI matching the web portal

## Setup Instructions

### 1. Build the Plugin

First, compile the TypeScript code to JavaScript:

```bash
cd figma-plugin
# Install TypeScript if you haven't
npm install -g typescript

# Compile the code
tsc code.ts --target es2017 --lib es2017 --outDir .
```

### 2. Install in Figma

1. Open Figma Desktop App
2. Go to `Plugins` → `Development` → `Import plugin from manifest...`
3. Select the `manifest.json` file from the `/figma-plugin` directory
4. The plugin will now appear in your Plugins menu

### 3. Get Your API Key

1. Open the Design System Request Portal in your browser
2. Sign in with your authorized email
3. Navigate to **Profile** page
4. Click **Generate Key** button
5. Copy the generated API key

### 4. Connect the Plugin

1. Run the plugin from Figma: `Plugins` → `Design System Request Portal`
2. Enter your API key
3. Enter your Portal URL: `https://your-project.supabase.co`
4. Click **Connect**

## How to Use

### Creating a Request

1. **Select a Frame** in Figma that you want to request as a component
2. **Open the Plugin** from the Plugins menu
3. Click **📐 Select Frame from Canvas** button
4. The plugin will automatically:
   - Capture a preview image of the frame
   - Fill in the component name from the frame name
   - Generate the Figma link
5. **Fill in the details:**
   - Select a project
   - Choose priority level
   - Add a description explaining why this component is needed
6. Click **Create Request**

### Viewing Requests

1. Open the plugin
2. Switch to the **My Requests** tab
3. See all your component requests with:
   - Status badges (Backlog, In Progress, In Review, Completed, Rejected)
   - Priority levels
   - Creation dates
   - Ticket IDs

## Plugin Interface

### Home Screen
- API Key input
- Portal URL configuration
- Connection status

### Create Request Tab
- Frame preview area
- Select frame button
- Component name field (auto-filled)
- Project dropdown
- Figma link field (auto-filled)
- Priority selector
- Description textarea
- Submit button

### My Requests Tab
- Scrollable list of all your requests
- Color-coded status badges
- Priority indicators
- Quick view of ticket details
- Auto-refreshes every 30 seconds

## Technical Details

### Files Structure

```
figma-plugin/
├── manifest.json       # Plugin configuration
├── code.ts            # Main plugin code (Figma sandbox)
├── code.js            # Compiled JavaScript
└── ui.html            # Plugin UI (HTML + embedded CSS/JS)
```

### API Integration

The plugin communicates with the Design System Request Portal backend:

**Endpoint:** `https://your-project.supabase.co/functions/v1/make-server-3a357b9b`

**Routes Used:**
- `POST /tickets` - Create new requests
- `GET /tickets` - Fetch all requests
- `GET /settings` - Load available projects

### Image Handling

1. Frame is exported as PNG at 2x scale
2. Image bytes are converted to array
3. Sent to backend in request body as `preview_image`
4. Backend uploads to Supabase Storage
5. Signed URL is generated and stored with ticket
6. Preview displays in both plugin and web portal

## Troubleshooting

### Plugin Won't Load
- Ensure you're using Figma Desktop App (not browser)
- Check that `code.js` was compiled from `code.ts`
- Verify `manifest.json` is valid JSON

### Can't Connect / API Errors
- Verify API key is correct (copy from Profile page)
- Check Portal URL format: `https://project-id.supabase.co`
- Ensure your email is in the allowed emails list (Admin Settings)

### Frame Preview Not Showing
- Make sure you have a frame selected (not a group or component)
- Try with a simpler frame first
- Check console for export errors

### Requests Not Appearing
- Check your network connection
- Verify API key hasn't expired
- Try logging out and back in on the web portal

## Development

### Modifying the Plugin

1. Edit `code.ts` for Figma sandbox code
2. Edit `ui.html` for the user interface
3. Recompile: `tsc code.ts --target es2017 --lib es2017`
4. Reload plugin in Figma: Right-click plugin → Reload

### Adding Features

The plugin is built with:
- **TypeScript** for type-safe Figma API interactions
- **Vanilla HTML/CSS/JS** for the UI (no build step required)
- **Figma Plugin API** for frame selection and export
- **Fetch API** for backend communication

## Support

For issues or questions:
1. Check the web portal is accessible
2. Verify your API key is active
3. Review browser/Figma console for errors
4. Contact your Design System team admin

## Security Notes

- API keys are stored securely in Figma's clientStorage
- Keys never expire but can be regenerated
- All requests require valid API key authentication
- Image uploads are stored in private Supabase buckets

---

**Version:** 1.0.0  
**Compatible with:** Figma Desktop App  
**Last Updated:** February 2026
