const levels = { info: "\x1b[36m", warn: "\x1b[33m", error: "\x1b[31m", success: "\x1b[32m" };
const reset = "\x1b[0m";

function log(level, ...args) {
  const color = levels[level] || "";
  console.log(`${color}[${level.toUpperCase()}]${reset}`, ...args);
}

module.exports = {
  info: (...a) => log("info", ...a),
  warn: (...a) => log("warn", ...a),
  error: (...a) => log("error", ...a),
  success: (...a) => log("success", ...a)
};
