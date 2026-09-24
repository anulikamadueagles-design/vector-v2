const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function file(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function read(name) {
  const f = file(name);
  if (!fs.existsSync(f)) return [];

  try {
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch {
    return [];
  }
}

function write(name, data) {
  fs.writeFileSync(
    file(name),
    JSON.stringify(data, null, 2)
  );
  return data;
}

function id(prefix) {
  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

module.exports = {
  read,
  write,
  id
};
