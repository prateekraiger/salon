require('dotenv').config();

/**
 * Admin authentication middleware
 * Validates the admin secret key from Authorization header or x-admin-key header
 */
const adminAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const adminKey = req.headers['x-admin-key'];

  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (adminKey) {
    token = adminKey;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Admin authentication required.'
    });
  }

  if (token !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({
      success: false,
      message: 'Invalid admin credentials.'
    });
  }

  next();
};

module.exports = { adminAuth };
