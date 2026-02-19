// Figma Plugin Code (Compiled from code.ts)
"use strict";

figma.showUI(__html__, { width: 400, height: 600, themeColors: true });

// ── Cached File Key ──────────────────────────────────────────────
// figma.fileKey can return undefined in some plugin contexts.
// We cache it in clientStorage after the user provides it once.
var cachedFileKey = null;

async function getFileKey() {
  // 1. Try the native API first
  if (figma.fileKey) {
    cachedFileKey = figma.fileKey;
    await figma.clientStorage.setAsync("figmaFileKey", figma.fileKey);
    return figma.fileKey;
  }

  // 2. Check in-memory cache
  if (cachedFileKey) {
    return cachedFileKey;
  }

  // 3. Check clientStorage
  var stored = await figma.clientStorage.getAsync("figmaFileKey");
  if (stored) {
    cachedFileKey = stored;
    return stored;
  }

  // 4. Not available — UI will need to ask the user
  return null;
}

// ── Image Export ──────────────────────────────────────────────────
async function getSelectionImage(node) {
  var bytes = await node.exportAsync({
    format: "PNG",
    constraint: { type: "SCALE", value: 0.5 }
  });
  return figma.base64Encode(bytes);
}

// ── Figma Link ───────────────────────────────────────────────────
function buildFigmaLink(fileKey, node) {
  var webSafeNodeId = node.id.replace(/:/g, "-");
  return "https://www.figma.com/design/" + fileKey + "?node-id=" + webSafeNodeId;
}

// ── Send Selection to UI ─────────────────────────────────────────
async function sendSelectionToUI() {
  var node = figma.currentPage.selection[0];

  console.log("[code.js] sendSelectionToUI – node:", node ? node.name : "none");

  if (!node) {
    figma.ui.postMessage({ type: "no-selection" });
    return;
  }

  // Resolve the file key
  var fileKey = await getFileKey();

  if (!fileKey) {
    // File key unknown — ask the UI to prompt the user
    console.log("[code.js] fileKey is undefined, requesting from user");

    var base64 = null;
    try {
      base64 = await getSelectionImage(node);
    } catch (err) {
      console.error("[code.js] Export failed while waiting for fileKey:", err);
    }

    figma.ui.postMessage({
      type: "need-file-key",
      name: node.name,
      nodeId: node.id,
      image: base64 ? "data:image/png;base64," + base64 : null
    });
    return;
  }

  try {
    var base64 = await getSelectionImage(node);
    var link = buildFigmaLink(fileKey, node);

    console.log("[code.js] Image exported, length:", base64.length, "| link:", link);

    figma.ui.postMessage({
      type: "selection-updated",
      name: node.name,
      image: "data:image/png;base64," + base64,
      link: link
    });
  } catch (err) {
    console.error("[code.js] Export failed:", err);
    figma.ui.postMessage({
      type: "selection-updated",
      name: node.name,
      image: null,
      link: buildFigmaLink(fileKey, node)
    });
  }
}

// ── Startup ──────────────────────────────────────────────────────
console.log("[code.js] Plugin started");
sendSelectionToUI();

// ── Selection Change Listener ────────────────────────────────────
figma.on("selectionchange", function () {
  console.log("[code.js] selectionchange fired");
  sendSelectionToUI();
});

// ── Messages from UI ─────────────────────────────────────────────
figma.ui.onmessage = async function (msg) {

  // ---- File Key provided by user ----
  if (msg.type === "set-file-key") {
    cachedFileKey = msg.fileKey;
    await figma.clientStorage.setAsync("figmaFileKey", msg.fileKey);
    console.log("[code.js] File key saved:", msg.fileKey);
    figma.notify("File key saved! Links will now work correctly.");
    sendSelectionToUI();
    return;
  }

  // ---- Clear cached file key ----
  if (msg.type === "clear-file-key") {
    cachedFileKey = null;
    await figma.clientStorage.deleteAsync("figmaFileKey");
    console.log("[code.js] File key cleared");
    figma.notify("File key cleared. You will be prompted again on next selection.");
    return;
  }

  // ---- Storage: get / set / remove via clientStorage ----
  if (msg.type === "storage-get") {
    var value = await figma.clientStorage.getAsync(msg.key);
    figma.ui.postMessage({
      type: "storage-get-result",
      key: msg.key,
      value: value
    });
    return;
  }

  if (msg.type === "storage-set") {
    await figma.clientStorage.setAsync(msg.key, msg.value);
    figma.ui.postMessage({
      type: "storage-set-result",
      key: msg.key
    });
    return;
  }

  if (msg.type === "storage-remove") {
    await figma.clientStorage.deleteAsync(msg.key);
    figma.ui.postMessage({
      type: "storage-remove-result",
      key: msg.key
    });
    return;
  }

  // ---- Notifications ----
  if (msg.type === "create-ticket") {
    figma.notify("Creating request...");
  }

  if (msg.type === "ticket-created") {
    figma.notify("Request created successfully!");
  }

  if (msg.type === "error") {
    figma.notify("Error: " + msg.message, { error: true });
  }

  if (msg.type === "notify") {
    figma.notify(msg.message, msg.options || {});
  }

  // ---- Close ----
  if (msg.type === "close") {
    figma.closePlugin();
  }

  // ---- Resize ----
  if (msg.type === "resize") {
    figma.ui.resize(msg.width, msg.height);
  }
};
