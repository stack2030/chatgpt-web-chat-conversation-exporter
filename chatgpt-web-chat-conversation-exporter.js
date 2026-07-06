//
// ChatGPT Web Chat Conversation Exporter
// Version: 0.1.0
//
// Copyright (c) 2026 ChatGPT Web Chat Conversation Exporter contributors
// SPDX-License-Identifier: MIT
//
// Disclaimer:
// This project is an independent open-source tool and is not affiliated with,
// endorsed by, sponsored by, or officially associated with OpenAI.
// ChatGPT and OpenAI are trademarks or registered trademarks of OpenAI.
// All product names, logos, and brands are property of their respective owners.
//
// Purpose:
// Export the currently open ChatGPT web conversation to local files.
//
// Security notes:
// - Runs locally in your browser console.
// - Does not send conversation data to any third-party server.
// - Does not use analytics, tracking, CDN scripts, external APIs, or remote code.
// - Does not use Chrome extension APIs.
// - Does not use Google OAuth, Notion OAuth, or cloud conversion services.
// - Interacts only with the currently open ChatGPT web session.
// - Uses same-origin ChatGPT endpoints only when available.
// - Does not intentionally collect or export credentials, cookies, API keys, or tokens.
// - Review the source before running. Do not run modified versions from untrusted sources.
//
// Current scope:
// - Markdown export by default.
// - Optional local TXT / HTML / JSON / Word-compatible HTML export.
// - No real PDF generation.
// - No real DOCX generation.
// - No Google Docs export.
// - No Notion export.
// - No Gmail compose.
// - No Chrome extension UI.
// - No backend conversion service.
//

async function setupChatGPTExporter() {
  const VERSION = "0.1.0";

  const CONFIG = {
    outputs: {
      markdown: true,
      text: false,
      html: false,
      json: false,
      wordHtml: false
    },

    includeUserMessages: true,
    includeAssistantMessages: true,

    preferBackendApi: true,
    fallbackToDom: true,

    timestampedFilename: true,
    filenamePrefix: "chatgpt_conversation",

    statusRemoveDelayMs: 15000
  };

  const SELECTORS = {
    message: "[data-message-author-role]",
    userMessage: '[data-message-author-role="user"]',
    assistantMessage: '[data-message-author-role="assistant"]',
    markdown: ".markdown, .prose, [class*='markdown'], [class*='prose']",
    userText: ".whitespace-pre-wrap"
  };

  const statusDiv = document.createElement("div");
  statusDiv.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 100000;
    background: #10a37f;
    color: white;
    padding: 10px 15px;
    border-radius: 6px;
    font-family: monospace;
    font-size: 12px;
    line-height: 1.45;
    box-shadow: 0 2px 10px rgba(0,0,0,0.35);
    max-width: 560px;
    white-space: pre-line;
  `;
  document.body.appendChild(statusDiv);

  function updateStatus(text, mode = "info") {
    if (mode === "error") statusDiv.style.background = "#d93025";
    else if (mode === "warning") statusDiv.style.background = "#f29900";
    else if (mode === "success") statusDiv.style.background = "#188038";
    else statusDiv.style.background = "#10a37f";

    statusDiv.textContent =
      `ChatGPT Web Chat Conversation Exporter ${VERSION}\n` + text;
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function sanitizeFilename(value) {
    return String(value || CONFIG.filenamePrefix)
      .replace(/\s*-\s*ChatGPT\s*$/i, "")
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
      .replace(/\s+/g, "_")
      .replace(/_{2,}/g, "_")
      .replace(/^_+|_+$/g, "")
      .toLowerCase()
      .substring(0, 120) || CONFIG.filenamePrefix;
  }

  function timestampForFilename() {
    const d = new Date();
    const pad = n => String(n).padStart(2, "0");

    return [
      d.getFullYear(),
      pad(d.getMonth() + 1),
      pad(d.getDate())
    ].join("-") + "_" + [
      pad(d.getHours()),
      pad(d.getMinutes()),
      pad(d.getSeconds())
    ].join("-");
  }

  function getBaseFilename() {
    const rawTitle =
      document.title && document.title !== "ChatGPT"
        ? document.title
        : CONFIG.filenamePrefix;

    const clean = sanitizeFilename(rawTitle);

    return CONFIG.timestampedFilename
      ? `${clean}_${timestampForFilename()}`
      : clean;
  }

  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(a.href);
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cleanText(text) {
    return String(text || "")
      .replace(/\uE200[\s\S]*?\uE201/g, "")
      .replace(/【\d+†[^】]*】/g, "")
      .replace(/\bsandbox:\/[^\s]+/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function getConversationIdFromUrl() {
    const match = window.location.pathname.match(/\/c\/([a-f0-9-]{20,})/i);
    return match ? match[1] : null;
  }

  async function getAccessTokenSameOriginOnly() {
    const endpoints = [
      "/api/auth/session?unstable_client=true",
      "/api/auth/session"
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          credentials: "include",
          headers: { Accept: "application/json" }
        });

        if (!response.ok) continue;

        const data = await response.json();

        if (data && data.accessToken) {
          return data.accessToken;
        }
      } catch {
        // Ignore and try next option.
      }
    }

    try {
      if (window.__NEXT_DATA__?.props?.pageProps?.accessToken) {
        return window.__NEXT_DATA__.props.pageProps.accessToken;
      }
    } catch {
      // Ignore.
    }

    return null;
  }

  function getCurrentBranchNodeIds(conversationData) {
    const mapping = conversationData?.mapping;

    if (!mapping || typeof mapping !== "object") {
      return [];
    }

    if (conversationData.current_node && mapping[conversationData.current_node]) {
      const result = [];
      const seen = new Set();
      let nodeId = conversationData.current_node;

      while (nodeId && mapping[nodeId] && !seen.has(nodeId)) {
        seen.add(nodeId);
        result.unshift(nodeId);
        nodeId = mapping[nodeId].parent;
      }

      return result;
    }

    let rootId = null;

    for (const [id, node] of Object.entries(mapping)) {
      if (node && node.parent === null) {
        rootId = id;
        break;
      }
    }

    if (!rootId && mapping["client-created-root"]) {
      rootId = "client-created-root";
    }

    if (!rootId) {
      return [];
    }

    const result = [];
    const seen = new Set();
    let nodeId = rootId;

    while (nodeId && mapping[nodeId] && !seen.has(nodeId)) {
      seen.add(nodeId);
      result.push(nodeId);

      const children = mapping[nodeId].children || [];
      nodeId = children.length ? children[children.length - 1] : null;
    }

    return result;
  }

  function extractTextFromContent(content) {
    if (!content) return "";

    if (typeof content === "string") {
      return content;
    }

    const parts = [];

    if (typeof content.text === "string") {
      parts.push(content.text);
    }

    if (Array.isArray(content.parts)) {
      for (const part of content.parts) {
        if (typeof part === "string") {
          parts.push(part);
          continue;
        }

        if (!part || typeof part !== "object") {
          continue;
        }

        if (typeof part.text === "string") {
          parts.push(part.text);
          continue;
        }

        if (typeof part.content === "string") {
          parts.push(part.content);
          continue;
        }

        if (part.content_type === "image_asset_pointer" && part.asset_pointer) {
          parts.push(`[Image: ${part.asset_pointer}]`);
          continue;
        }

        if (Array.isArray(part.parts)) {
          const nested = part.parts
            .map(x => typeof x === "string" ? x : (x?.text || x?.content || ""))
            .filter(Boolean)
            .join("\n\n");

          if (nested) parts.push(nested);
        }
      }
    }

    return parts.join("\n\n");
  }

  function messageFromApiNode(node, order) {
    const msg = node?.message;

    if (!msg) return null;

    const role = msg.author?.role;

    if (role !== "user" && role !== "assistant") {
      return null;
    }

    if (role === "user" && !CONFIG.includeUserMessages) {
      return null;
    }

    if (role === "assistant" && !CONFIG.includeAssistantMessages) {
      return null;
    }

    const content = cleanText(extractTextFromContent(msg.content));

    if (!content) return null;

    return {
      order,
      role,
      label: role === "user" ? "User" : "ChatGPT",
      content,
      source: "api",
      messageId: msg.id || node.id || null,
      createTime: msg.create_time || null,
      model: msg.metadata?.model_slug || msg.metadata?.default_model_slug || null
    };
  }

  async function fetchMessagesFromBackendApi() {
    const conversationId = getConversationIdFromUrl();

    if (!conversationId) {
      return null;
    }

    const headers = {
      Accept: "application/json"
    };

    const accessToken = await getAccessTokenSameOriginOnly();

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(`/backend-api/conversation/${conversationId}`, {
      credentials: "include",
      headers
    });

    if (!response.ok) {
      throw new Error(`ChatGPT backend API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const nodeIds = getCurrentBranchNodeIds(data);
    const messages = [];

    let order = 0;

    for (const nodeId of nodeIds) {
      const node = data.mapping?.[nodeId];
      const message = messageFromApiNode(node, order);

      if (message) {
        messages.push(message);
        order++;
      }
    }

    return messages.length ? messages : null;
  }

  function extractDomMessageText(element, role) {
    const clone = element.cloneNode(true);

    clone.querySelectorAll(
      [
        "button",
        "svg",
        "form",
        "textarea",
        "input",
        "select",
        "[data-testid*='copy']",
        "[aria-label*='Copy']",
        "[aria-label*='copy']",
        "[class*='action']",
        "[class*='toolbar']"
      ].join(",")
    ).forEach(node => node.remove());

    if (role === "user") {
      const userText = clone.querySelector(SELECTORS.userText);
      return cleanText(userText ? userText.innerText : clone.innerText);
    }

    const markdown = clone.querySelector(SELECTORS.markdown);

    return cleanText(markdown ? markdown.innerText : clone.innerText);
  }

  function fetchMessagesFromDom() {
    const nodes = Array.from(document.querySelectorAll(SELECTORS.message));
    const messages = [];
    let order = 0;

    for (const node of nodes) {
      const role = node.getAttribute("data-message-author-role");

      if (role !== "user" && role !== "assistant") {
        continue;
      }

      if (role === "user" && !CONFIG.includeUserMessages) {
        continue;
      }

      if (role === "assistant" && !CONFIG.includeAssistantMessages) {
        continue;
      }

      const content = extractDomMessageText(node, role);

      if (!content) continue;

      messages.push({
        order,
        role,
        label: role === "user" ? "User" : "ChatGPT",
        content,
        source: "dom",
        messageId: node.getAttribute("data-message-id") || null,
        createTime: null,
        model: null
      });

      order++;
    }

    return messages;
  }

  function countRoles(messages) {
    let user = 0;
    let assistant = 0;

    for (const msg of messages) {
      if (msg.role === "user") user++;
      if (msg.role === "assistant") assistant++;
    }

    return { user, assistant, total: messages.length };
  }

  function buildMarkdown(messages) {
    let output = "# Conversation with ChatGPT\n\n";
    output += `Exported: ${new Date().toISOString()}\n\n`;
    output += "---\n\n";

    for (const msg of messages) {
      output += `## ${msg.label}:\n\n`;
      output += `${msg.content}\n\n`;
      output += "---\n\n";
    }

    return output;
  }

  function buildText(messages) {
    let output = "Conversation with ChatGPT\n\n";
    output += `Exported: ${new Date().toISOString()}\n\n`;
    output += "========================================\n\n";

    for (const msg of messages) {
      output += `${msg.label}:\n\n`;
      output += `${msg.content}\n\n`;
      output += "----------------------------------------\n\n";
    }

    return output;
  }

  function buildHtml(messages) {
    const rows = messages.map(msg => {
      const cls = msg.role === "user" ? "user" : "assistant";

      return `
        <section class="message ${cls}">
          <h2>${escapeHtml(msg.label)}</h2>
          <pre>${escapeHtml(msg.content)}</pre>
        </section>
      `;
    }).join("\n");

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Conversation with ChatGPT</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.5;
      max-width: 900px;
      margin: 40px auto;
      padding: 0 20px;
      color: #111;
      background: #fff;
    }
    h1 {
      border-bottom: 1px solid #ddd;
      padding-bottom: 12px;
    }
    .meta {
      color: #666;
      font-size: 13px;
      margin-bottom: 28px;
    }
    .message {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      margin: 18px 0;
    }
    .message.user {
      background: #eef6ff;
    }
    .message.assistant {
      background: #f7f7f7;
    }
    .message h2 {
      font-size: 16px;
      margin: 0 0 12px 0;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: inherit;
      margin: 0;
    }
  </style>
</head>
<body>
  <h1>Conversation with ChatGPT</h1>
  <div class="meta">Exported: ${escapeHtml(new Date().toISOString())}</div>
  ${rows}
</body>
</html>`;
  }

  function buildJson(messages) {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      pageUrl: window.location.href,
      pageTitle: document.title,
      exporter: "ChatGPT Web Chat Conversation Exporter",
      version: VERSION,
      messages
    }, null, 2);
  }

  function downloadOutputs(messages) {
    const base = getBaseFilename();
    let files = 0;

    if (CONFIG.outputs.markdown) {
      downloadFile(
        buildMarkdown(messages),
        `${base}.md`,
        "text/markdown;charset=utf-8"
      );
      files++;
    }

    if (CONFIG.outputs.text) {
      downloadFile(
        buildText(messages),
        `${base}.txt`,
        "text/plain;charset=utf-8"
      );
      files++;
    }

    if (CONFIG.outputs.html) {
      downloadFile(
        buildHtml(messages),
        `${base}.html`,
        "text/html;charset=utf-8"
      );
      files++;
    }

    if (CONFIG.outputs.json) {
      downloadFile(
        buildJson(messages),
        `${base}.json`,
        "application/json;charset=utf-8"
      );
      files++;
    }

    if (CONFIG.outputs.wordHtml) {
      downloadFile(
        buildHtml(messages),
        `${base}.doc`,
        "application/msword;charset=utf-8"
      );
      files++;
    }

    return files;
  }

  try {
    updateStatus("Starting export...");

    let messages = null;
    let source = "unknown";

    if (CONFIG.preferBackendApi) {
      try {
        updateStatus("Fetching conversation from ChatGPT same-origin API...");
        messages = await fetchMessagesFromBackendApi();
        source = "same-origin API";
      } catch (error) {
        console.warn("[ChatGPT Exporter] API extraction failed:", error);
      }
    }

    if ((!messages || !messages.length) && CONFIG.fallbackToDom) {
      updateStatus("Using DOM fallback extraction...", "warning");
      messages = fetchMessagesFromDom();
      source = "DOM fallback";
    }

    if (!messages || !messages.length) {
      throw new Error("No exportable ChatGPT messages found.");
    }

    const counts = countRoles(messages);
    const files = downloadOutputs(messages);

    updateStatus(
      `SUCCESS\n` +
      `Source: ${source}\n` +
      `User: ${counts.user} | ChatGPT: ${counts.assistant} | Total: ${counts.total}\n` +
      `Downloaded files: ${files}`,
      "success"
    );

    console.log("[ChatGPT Exporter] Export complete:", {
      version: VERSION,
      source,
      counts,
      files,
      messages
    });

    await delay(CONFIG.statusRemoveDelayMs);

    if (document.body.contains(statusDiv)) {
      document.body.removeChild(statusDiv);
    }
  } catch (error) {
    updateStatus(`ERROR: ${error.message}`, "error");
    console.error("[ChatGPT Exporter] Export failed:", error);
  }
}

setupChatGPTExporter();