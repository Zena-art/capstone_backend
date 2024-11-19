module.exports = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ msg: "Access denied. Not an admin" });
  }
};