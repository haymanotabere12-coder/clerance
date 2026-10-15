module.exports = (err, req, res, next) => {
  if (err.code === 11000) {
    return res.status(409).json({ message: "Already exists: " + Object.keys(err.keyValue).join(", ") });
  }
  if (err.name === "MulterError") {
    const message = err.code === "LIMIT_FILE_SIZE" ? "File is too large (maximum 2 MB)" : "Upload failed";
    return res.status(400).json({ message });
  }
  res.status(err.status || 500).json({ message: err.message || "Server error" });
};
