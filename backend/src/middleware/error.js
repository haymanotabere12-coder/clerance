module.exports = (err, req, res, next) => {
  if (err.code === 11000) {
    return res.status(409).json({ message: "Already exists: " + Object.keys(err.keyValue).join(", ") });
  }
  res.status(err.status || 500).json({ message: err.message || "Server error" });
};
