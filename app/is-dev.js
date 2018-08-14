module.exports =
  process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath);
