const jwt = require('jsonwebtoken');

module.exports.isAuth = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if(!authHeader) {
    const error = new Error('Not authorized / authenticated');
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1];
  const decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.secretOrPublicKey);
  } 
  catch (err) {
      err.statusCode = 500;
      throw err;
  }
  if(!decodedToken) {
    const error = new Error('Authorization failed');
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};