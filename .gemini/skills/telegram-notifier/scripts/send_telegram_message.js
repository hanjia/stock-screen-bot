#!/usr/bin/env node

/**
 * Sends a message to a Telegram chat using the Telegram Bot API.
 * 
 * Usage:
 * node send_telegram_message.js "Your message here" [--token TOKEN] [--chat_id CHAT_ID]
 */

const https = require('https');

async function sendTelegramMessage() {
  const args = process.argv.slice(2);
  let message = args[0];
  
  if (!message) {
    console.error('Error: No message provided.');
    process.exit(1);
  }

  const tokenArgIndex = args.indexOf('--token');
  const chatIDArgIndex = args.indexOf('--chat_id');

  const botToken = tokenArgIndex !== -1 ? args[tokenArgIndex + 1] : process.env.TELEGRAM_BOT_TOKEN;
  const chatId = chatIDArgIndex !== -1 ? args[chatIDArgIndex + 1] : process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('Error: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be provided as environment variables or arguments.');
    process.exit(1);
  }

  const data = JSON.stringify({
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown'
  });

  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${botToken}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('Success: Message sent to Telegram.');
      } else {
        console.error(`Error: Telegram API returned status ${res.statusCode}`);
        console.error(responseData);
        process.exit(1);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error sending message:', error);
    process.exit(1);
  });

  req.write(data);
  req.end();
}

sendTelegramMessage();
