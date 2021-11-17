const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt");

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateuser = async (email, password, done) => {
    const user = getUserByEmail(email);
    if (user == null) {
      return done(null, false, {
        message: "No user found with that email"
      })
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, {
          message: "No user with that password found"
        })
      }
    } catch (err) {
      return done(err)
    }
  }
  passport.use(new LocalStrategy({
    usrnameField: "email"
  }, authenticateuser))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}

module.exports = initialize;
