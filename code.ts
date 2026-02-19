// Figma Plugin Code (runs in Figma sandbox)

figma.showUI(__html__, { width: 400, height: 600, themeColors: true });

// ── Cached File Key ──────────────────────────────────────────────
// figma.fileKey can return undefined in some plugin contexts.
// We cache it in clientStorage after the user provides it once.
let cachedFileKey: string | null = null;

async function getFileKey(): Promise<string | null> {
  // 1. Try the native API first
  if (figma.fileKey) {
    cachedFileKey = figma.fileKey;
    // Also persist it so it survives plugin restarts
    await figma.clientStorage.setAsync('figmaFileKey', figma.fileKey);
    return figma.fileKey;
  }

  // 2. Check in-memory cache
  if (cachedFileKey) {
    return cachedFileKey;
  }

  // 3. Check clientStorage
  const stored = await figma.clientStorage.getAsync('figmaFileKey');
  if (stored) {
    cachedFileKey = stored;
    return stored;
  }

  // 4. Not available — UI will need to ask the user
  return null;
}

// ── Image Export ──────────────────────────────────────────────────
// Export the selected node as a PNG at 0.5x scale and return a base64 string
async function getSelectionImage(node: SceneNode): Promise<string> {
  const bytes = await (node as any).exportAsync({
    format: 'PNG',
    constraint: { type: 'SCALE', value: 0.5 }
  });
  return figma.base64Encode(bytes);
}

// ── Figma Link ───────────────────────────────────────────────────
// Build the correct Figma design URL (colon → hyphen for web-safe node ID)
function buildFigmaLink(fileKey: string, node: SceneNode): string {
  const webSafeNodeId = node.id.replace(/:/g, '-');
  return `https://www.figma.com/design/${fileKey}?node-id=${webSafeNodeId}`;
}

// ── Send Selection to UI ─────────────────────────────────────────
async function sendSelectionToUI() {
  const node = figma.currentPage.selection[0];

  console.log('[code.ts] sendSelectionToUI – node:', node ? node.name : 'none');

  if (!node) {
    figma.ui.postMessage({ type: 'no-selection' });
    return;
  }

  // Resolve the file key
  const fileKey = await getFileKey();

  if (!fileKey) {
    // File key unknown — ask the UI to prompt the user
    console.log('[code.ts] fileKey is undefined, requesting from user');

    // Still export the image so the preview works
    let base64: string | null = null;
    try {
      base64 = await getSelectionImage(node);
    } catch (err) {
      console.error('[code.ts] Export failed while waiting for fileKey:', err);
    }

    figma.ui.postMessage({
      type: 'need-file-key',
      name: node.name,
      nodeId: node.id,
      image: base64 ? 'data:image/png;base64,' + base64 : null
    });
    return;
  }

  try {
    const base64 = await getSelectionImage(node);
    const link = buildFigmaLink(fileKey, node);

    console.log('[code.ts] Image exported, length:', base64.length, '| link:', link);

    figma.ui.postMessage({
      type: 'selection-updated',
      name: node.name,
      image: 'data:image/png;base64,' + base64,
      link: link
    });
  } catch (err) {
    console.error('[code.ts] Export failed:', err);
    // Still send name + link even if image export fails
    figma.ui.postMessage({
      type: 'selection-updated',
      name: node.name,
      image: null,
      link: buildFigmaLink(fileKey, node)
    });
  }
}

// ── Startup ──────────────────────────────────────────────────────
console.log('[code.ts] Plugin started');
sendSelectionToUI();

// ── Selection Change Listener ────────────────────────────────────
figma.on('selectionchange', () => {
  console.log('[code.ts] selectionchange fired');
  sendSelectionToUI();
});

// ── Messages from UI ─────────────────────────────────────────────
figma.ui.onmessage = async (msg: any) => {

  // ---- File Key provided by user ----
  if (msg.type === 'set-file-key') {
    cachedFileKey = msg.fileKey;
    await figma.clientStorage.setAsync('figmaFileKey', msg.fileKey);
    console.log('[code.ts] File key saved:', msg.fileKey);
    figma.notify('File key saved! Links will now work correctly.');
    // Re-send the current selection with the new key
    sendSelectionToUI();
    return;
  }

  // ---- Clear cached file key (e.g. user switched files) ----
  if (msg.type === 'clear-file-key') {
    cachedFileKey = null;
    await figma.clientStorage.deleteAsync('figmaFileKey');
    console.log('[code.ts] File key cleared');
    figma.notify('File key cleared. You will be prompted again on next selection.');
    return;
  }

  // ---- Storage: get / set / remove via clientStorage ----
  if (msg.type === 'storage-get') {
    const value = await figma.clientStorage.getAsync(msg.key);
    figma.ui.postMessage({
      type: 'storage-get-result',
      key: msg.key,
      value: value
    });
    return;
  }

  if (msg.type === 'storage-set') {
    await figma.clientStorage.setAsync(msg.key, msg.value);
    figma.ui.postMessage({
      type: 'storage-set-result',
      key: msg.key
    });
    return;
  }

  if (msg.type === 'storage-remove') {
    await figma.clientStorage.deleteAsync(msg.key);
    figma.ui.postMessage({
      type: 'storage-remove-result',
      key: msg.key
    });
    return;
  }

  // ---- Notifications ----
  if (msg.type === 'create-ticket') {
    figma.notify('Creating request...');
  }

  if (msg.type === 'ticket-created') {
    figma.notify('Request created successfully!');
  }

  if (msg.type === 'error') {
    figma.notify(`Error: ${msg.message}`, { error: true });
  }

  if (msg.type === 'notify') {
    figma.notify(msg.message, msg.options || {});
  }

  // ---- Close ----
  if (msg.type === 'close') {
    figma.closePlugin();
  }

  // ---- Resize ----
  if (msg.type === 'resize') {
    figma.ui.resize(msg.width, msg.height);
  }
};
