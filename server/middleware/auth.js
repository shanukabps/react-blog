const { User } = require('../model/user')


const auth = (req, res, next) => {
    let token = req.cookies.x_auth;
    // console.log(token)

    User.findByToken(token, (err, user) => {
        //  console.log(user)
        if (err) throw err;
        if (!user) return res.send("err token access deined")

        req.token = token
        req.user = user

        next()
    })

}




module.exports = { auth };