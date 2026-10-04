const jwt=require('jsonwebtoken'); exports.signToken=u=>jwt.sign({id:u._id.toString(),role:u.role},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN||'1d'});
