const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'config.json');

function readConfig() {
  try {
    const rawData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(rawData);
  } catch (err) {
    console.error('Error reading config.json:', err);
    // Return a default structure if config reading fails
    return {
      prefix: "?",
      ownerUsername: "zenixx.dev",
      status: "working for zenixx dev",
      statusType: "PLAYING",
      roles: [],
      channels: []
    };
  }
}

function writeConfig(newConfig) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing config.json:', err);
    return false;
  }
}

module.exports = {
  readConfig,
  writeConfig
};
