'use strict';

const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();

const PORT = parseInt(process.env.PORT, 10) || 3000;

app.listen(PORT, () => {
  console.log(`╔══════════════════════════════════════════╗`);
  console.log(`║   IPTV Platform API                      ║`);
  console.log(`║   → http://localhost:${PORT}               ║`);
  console.log(`║   → /health  /api/channels/:country      ║`);
  console.log(`╚══════════════════════════════════════════╝`);
});
