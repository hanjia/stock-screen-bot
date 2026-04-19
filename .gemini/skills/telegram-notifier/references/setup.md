# Telegram Bot Setup

To use this skill, you need a Telegram Bot and the Chat ID where messages should be sent.

## 1. Create a Bot
1. Search for `@BotFather` on Telegram.
2. Send `/newbot` and follow the instructions to get your **Bot Token**.
3. Save the token as `TELEGRAM_BOT_TOKEN`.

## 2. Get Chat ID
1. Send a message to your new bot.
2. Visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`.
3. Look for the `"chat":{"id":...}` field in the JSON response.
4. Save the ID as `TELEGRAM_CHAT_ID`.

## 3. Environment Variables
Ensure these are set in your environment:
- `TELEGRAM_BOT_TOKEN`: Your bot's API token.
- `TELEGRAM_CHAT_ID`: The ID of the chat/user to send messages to.
