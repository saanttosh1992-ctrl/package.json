const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'PublicSMP1.aternos.me',
  port: 31163,
  username: 'KeepAliveBot',
  auth: 'offline',
  version: false,
  reconnectDelay: 25000
};

let bot = null;
let reconnectTimer = null;
let antiAfkTimer = null;

function scheduleReconnect() {
  if (reconnectTimer) return;
  console.log(`Server offline ya restart ho raha hai. ${CONFIG.reconnectDelay / 1000}s baad dubara join karega...`);

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    createBot();
  }, CONFIG.reconnectDelay);
}

function createBot() {
  if (antiAfkTimer) {
    clearInterval(antiAfkTimer);
    antiAfkTimer = null;
  }

  console.log(`Connecting to ${CONFIG.host}:${CONFIG.port}...`);

  bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    auth: CONFIG.auth,
    version: CONFIG.version,
    checkTimeoutInterval: 60000
  });

  bot.once('spawn', () => {
    console.log('✅ Bot server mein auto-join ho gaya!');

    antiAfkTimer = setInterval(() => {
      if (!bot || !bot.entity) return;
      bot.setControlState('jump', true);
      bot.look(Math.random() * Math.PI * 2, 0);
      setTimeout(() => {
        if (bot) bot.setControlState('jump', false);
      }, 400);
    }, 45000);
  });

  bot.on('kicked', (reason) => {
    console.log('⚠️ Server ne kick kiya (Restart/Stop):', reason);
  });

  bot.on('end', () => {
    console.log('🔌 Connection band ho gaya.');
    scheduleReconnect();
  });

  bot.on('error', (err) => {
    console.log('❌ Connection error (Server abhi start ho raha hai):', err.code || err.message);
    scheduleReconnect();
  });
}

createBot();
