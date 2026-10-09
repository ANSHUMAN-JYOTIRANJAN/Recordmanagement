const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Make sure authentication middleware
    // has already attached the user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated.",
      });
    }

    // Check whether user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission.",
      });
    }

    // User has required role
    next();
  };
};

module.exports = authorizeRoles;
