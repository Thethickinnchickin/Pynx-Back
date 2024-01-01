const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    let checkBearer = "Bearer "
    if(token) {
        if(token.startsWith(checkBearer)){
            token = token.slice(checkBearer.length, token.length);
        }        
    } else {
        next();
    }





    if(token) {
        let secret = process.env.ADMIN_SECRET || 'secret';
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                next();
            } else {
                req.decoded = decoded
                next();
            }
        })
    } else {
        next();
    }
}
