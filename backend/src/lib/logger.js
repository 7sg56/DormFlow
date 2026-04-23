const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = levels[process.env.LOG_LEVEL || 'info'] ?? levels.info;

function fmt(level, msg, meta) {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level.toUpperCase()}] ${msg}`;
  if (meta && Object.keys(meta).length) return `${base} ${JSON.stringify(meta)}`;
  return base;
}

const logger = {
  error: (msg, meta) => { if (currentLevel >= levels.error) console.error(fmt('error', msg, meta)); },
  warn:  (msg, meta) => { if (currentLevel >= levels.warn)  console.warn(fmt('warn', msg, meta)); },
  info:  (msg, meta) => { if (currentLevel >= levels.info)  console.log(fmt('info', msg, meta)); },
  debug: (msg, meta) => { if (currentLevel >= levels.debug) console.log(fmt('debug', msg, meta)); },
};

module.exports = logger;
