const admin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
  }
  next();
};

export default admin;