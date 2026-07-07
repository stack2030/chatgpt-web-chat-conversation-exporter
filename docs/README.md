# ChatGPT Web Chat Conversation Exporter Documentation

Welcome to the documentation page for **ChatGPT Web Chat Conversation Exporter**.

This project helps users export ChatGPT web conversations locally to Markdown.

Project repo:

```text
https://github.com/stack2030/chatgpt-web-chat-conversation-exporter
```

If the tool helps you, star the repo, watch it for ChatGPT web UI breakage updates, and share it with people who need private local ChatGPT conversation exports.

---

## Quick summary

ChatGPT Web Chat Conversation Exporter is a local browser-console script for saving ChatGPT web chat conversations as Markdown files.

It is useful for:

- backups
- knowledge bases
- research archives
- coding sessions
- planning documents
- multi-AI workflows
- reusable context
- documentation trails
- local AI chat history archives

It is built around a simple privacy promise:

```text
Your ChatGPT conversation should not need to visit another server just to become a file on your computer.
```

The current version runs inside your browser, uses same-origin ChatGPT conversation data when available, falls back to visible page content when needed, and downloads a local Markdown file.

---

## Current public version

```text
Version: 0.1.0
Status: Working as of 2026-07
Output: Markdown
Target: ChatGPT web chat
Mode: Browser console script
```

Current baseline behavior:

- exports User messages
- exports final ChatGPT response messages
- uses same-origin ChatGPT conversation data when available
- downloads a local `.md` file
- does not use a backend
- does not use analytics
- does not upload your conversation anywhere

---

## Visual demo

### Screenshots

<table>
  <tr>
    <td width="33%">
      <img src="assets/chatgpt-web-chat-conversation-exporter_v010_01.png" alt="ChatGPT Web Chat Conversation Exporter screenshot 1" width="100%">
    </td>
    <td width="33%">
      <img src="assets/chatgpt-web-chat-conversation-exporter_v010_02.png" alt="ChatGPT Web Chat Conversation Exporter screenshot 2" width="100%">
    </td>
    <td width="33%">
      <img src="assets/chatgpt-web-chat-conversation-exporter_v010_03.png" alt="ChatGPT Web Chat Conversation Exporter screenshot 3" width="100%">
    </td>
  </tr>
  <tr>
    <td width="33%">
      <img src="assets/chatgpt-web-chat-conversation-exporter_v010_04.png" alt="ChatGPT Web Chat Conversation Exporter screenshot 4" width="100%">
    </td>
    <td width="33%">
      <img src="assets/chatgpt-web-chat-conversation-exporter_v010_05.png" alt="ChatGPT Web Chat Conversation Exporter screenshot 5" width="100%">
    </td>
    <td width="33%">
      <img src="assets/chatgpt-web-chat-conversation-exporter_v010_06.png" alt="ChatGPT Web Chat Conversation Exporter exported Markdown screenshot" width="100%">
    </td>
  </tr>
</table>

### Demo videos

<div align="center">

<table>
  <tr>
    <td width="50%" align="center">
      <strong>Part A</strong><br>
      <img src="assets/chatgpt-web-chat-conversation-exporter_v010_a.gif" alt="ChatGPT Web Chat Conversation Exporter demo part A" width="100%">
    </td>
    <td width="50%" align="center">
      <strong>Part B</strong><br>
      <img src="assets/chatgpt-web-chat-conversation-exporter_v010_b.gif" alt="ChatGPT Web Chat Conversation Exporter demo part B" width="100%">
    </td>
  </tr>
</table>

</div>

---

## How to use

1. Open the ChatGPT web conversation.
2. Open browser developer tools.
3. Open the **Console** tab.
4. Paste the full JavaScript from:

```text
chatgpt-web-chat-conversation-exporter.js
```

5. Press Enter.
6. Wait for the export to complete.
7. Review the downloaded Markdown file.

The script shows a small progress overlay in the top-right corner while it runs.

The overlay reports:

- User message count
- ChatGPT response count
- total exported messages
- source and fallback status
- success or partial export status

---

## Expected result

A successful export downloads a Markdown file named from the ChatGPT conversation title.

Example:

```text
my_chatgpt_conversation.md
```

The Markdown file contains a readable User / ChatGPT conversation transcript.

Example structure:

```markdown
# Conversation with ChatGPT

## User:

User message...

---

## ChatGPT:

ChatGPT response...

---
```

---

## Privacy notes

The tool runs locally in your browser.

It does not include:

- analytics
- tracking
- third-party upload
- external scripts
- remote execution service
- backend storage
- account synchronization

The current script is deliberately readable so users can inspect what it does before running it.

The exporter does not intentionally collect or export:

- credentials
- cookies
- API keys
- tokens
- browser profile data

It only interacts with the currently open ChatGPT web page and the visible conversation UI.

---

## Why Markdown

Markdown is portable.

It works with:

- GitHub
- Obsidian
- Logseq
- static sites
- documentation systems
- local search
- AI context windows
- code repositories
- editors

Plain text export is planned, but Markdown is the first format because it preserves conversation structure better.

---

## Typical workflows

### Save important ChatGPT work

Export a conversation after a useful research, coding, writing, brainstorming, or planning session.

### Move context between AI tools

Use a ChatGPT conversation as context for another AI tool.

This is useful when comparing answers, continuing work in another assistant, or asking a second model to review prior reasoning.

### Keep versioned snapshots manually

Until timestamped filenames are added, rename exported files manually if you export the same conversation multiple times.

Example:

```text
my-chatgpt-project-2026-07-05-1430.md
my-chatgpt-project-2026-07-05-1810.md
```

### Archive into a knowledge base

Save the Markdown into your local knowledge base or project folder.

Useful destinations include:

- project folders
- research archives
- writing folders
- coding notes
- documentation repositories
- local AI context libraries

### Preserve useful AI work locally

ChatGPT conversations often contain project plans, code explanations, research notes, architectural decisions, drafts, and debugging trails.

Exporting them locally makes that work easier to search, reuse, cite, compare, and archive.

---

## Current limitations

Version `0.1.0` is a baseline Markdown exporter.

Not included yet:

- plain text export
- timestamped filenames
- optional generated file/artifact export
- Chrome extension
- one-click browser UI
- automatic update mechanism

ChatGPT is a changing web application. If ChatGPT changes its web interface, selectors may break.

---

## Status and generated content

ChatGPT may show interface states, tool results, generated files, artifacts, or other UI-specific content depending on the product surface and account configuration.

In `v0.1.0`, the baseline exporter is focused on the readable conversation transcript.

Future versions may add optional export modes for:

- generated files
- artifacts
- richer metadata
- additional local output formats

These should remain optional because many users only want the clean conversation transcript.

---

## If something breaks

Open an issue on GitHub.

Please include:

- browser
- operating system
- date tested
- ChatGPT web UI behavior
- console output
- expected result
- actual result
- whether the exported Markdown was complete
- whether the overlay showed success or partial export

Do not paste private conversation content unless you intentionally choose to share it.

If possible, use the ChatGPT UI breakage issue template.

---

## Good bug reports

A useful bug report includes:

```text
Browser:
Operating system:
ChatGPT plan / UI variant if known:
Conversation length:
Exporter version:
Overlay result:
Console output:
What was missing:
Was the Markdown downloaded:
```

Screenshots are useful, but remove or blur private information first.

---

## Planned improvements

Public roadmap items include:

- timestamped filenames
- plain text export
- optional generated-file/artifact export
- additional local export modes
- optional generated file/artifact export
- Chrome extension roadmap
- troubleshooting guide
- improved screenshots and demo material

See the GitHub Issues page for the current roadmap:

```text
https://github.com/stack2030/chatgpt-web-chat-conversation-exporter/issues
```

---

## Community request

If you use this project:

- star it so others find it
- watch it if you rely on it
- open issues when ChatGPT changes something
- share it with people who need private AI chat exports

The best bug report is the one opened before everyone quietly rage-clicks into the void.
