const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    let checkBearer = "Bearer "
    if(token.startsWith(checkBearer)){
        token = token.slice(checkBearer.length, token.length);
    }




    if(token) {
        let adminToken = process.env.ADMIN_SECRET;
        jwt.verify(token, adminToken, (err, decoded) => {
            if (err) {
                res.json({
                    success: false,
                    message: "Failed to authenticate"
                })
            } else {
                req.decoded = decoded
                next()
            }
        })
    } else {
        res.json({
            success: false,
            message: "Failed to authenticate"
        });
    }
}
