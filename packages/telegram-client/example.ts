// example.ts - Example usage of the Telegram client

import { TelegramClient } from './index';

/**
 * Example bot implementation
 * This shows how to use the Telegram client in a real bot
 */

// Replace with your actual bot token
const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';

async function main() {
  // Initialize the client
  const client = new TelegramClient(BOT_TOKEN);
  
  try {
    // Get bot information
    console.log('Getting bot information...');
    const me = await client.getMe();
    console.log(`Bot name: ${me.first_name}`);
    console.log(`Username: @${me.username}`);
    
    // For demonstration purposes, we won't actually send a message
    // as it requires a valid chat ID
    console.log('\nClient is ready to send messages!');
    console.log('Use client.sendMessage({ chat_id: YOUR_CHAT_ID, text: "Hello World" }) to send a message.');
    
    // Example of how to get updates (this would be used in a polling bot)
    console.log('\nGetting updates...');
    const updates = await client.getUpdates({
      timeout: 30,
      offset: 0
    });
    console.log(`Received ${updates.length} updates`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
if (import.meta.main) {
  main();
}