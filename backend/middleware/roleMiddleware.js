// middleware/roleMiddleware.js

/**
 * Role/permission based access control middleware
 * Because the database only has `role` = 'student'|'admin' plus
 * boolean flags (`can_borrow`, `can_lend`), the middleware interprets
 * the virtual roles used by the frontend:
 *   - 'admin'    : user.role === 'admin'
 *   - 'borrower' : user.can_borrow === true
 *   - 'owner'    : user.can_lend === true
 * Other strings are matched directly against user.role as a fallback.
 *
 * @param  {...string} allowedRoles  names to allow (e.g. 'admin','borrower','owner')
 * @returns {Function} Express middleware function
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    // authMiddleware should have attached full user record
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { role, can_borrow, can_lend } = req.user;

    const hasPermission = allowedRoles.some((r) => {
      if (r === "admin" && role === "admin") return true;
      if (r === "borrower" && can_borrow) return true;
      if (r === "owner" && can_lend) return true;
      // fallback: match raw role string
      if (role && role === r) return true;
      return false;
    });

    if (!hasPermission) {
      return res
        .status(403)
        .json({ message: "Insufficient permissions for this action" });
    }

    next();
  };
};

module.exports = roleMiddleware;
