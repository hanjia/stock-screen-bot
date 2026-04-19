---
name: telegram-notifier
description: Sends messages and notifications to Telegram. Use when you need to alert the user via Telegram, send status updates, or share information to a Telegram chat.
---

# Telegram Notifier

This skill provides a simple way to send notifications to a Telegram chat via a bot.

## Quick Start

To send a message, use the bundled script:

```bash
node scripts/send_telegram_message.js "Hello from Gemini CLI!"
```

## Setup & Credentials

Before using this skill, ensure you have a Telegram Bot Token and Chat ID.
Refer to [references/setup.md](references/setup.md) for detailed instructions on how to create a bot and find your Chat ID.

The script expects the following environment variables:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Alternatively, you can pass them as arguments:
```bash
node scripts/send_telegram_message.js "Message content" --token <TOKEN> --chat_id <CHAT_ID>
```

## Workflows

### Sending Automated Alerts
When a long-running process completes or an error occurs, use this skill to notify the user.

```javascript
// Example: Notifying after a build
const message = "Build successful! Artifacts are ready.";
// Trigger send_telegram_message.js script
```
