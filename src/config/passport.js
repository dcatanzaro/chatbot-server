import passport from "passport";
import passportLocal from "passport-local";
import bCrypt from "bcrypt-nodejs";
import Users from "../models/users";

const LocalStrategy = passportLocal.Strategy;

passport.use(
    new LocalStrategy({ passReqToCallback: true }, function(
        req,
        username,
        password,
        done
    ) {
        return Users.findOne({
            email: username
        }).then(function(data) {
            if (!data) {
                return done(null, {
                    error: true,
                    message: "Usuario o contraseña incorrecta."
                });
            }

            if (!isValidPassword(data.password, password)) {
                return done(null, {
                    error: true,
                    message: "Usuario o contraseña incorrecta."
                });
            }

            data.password = "";

            return done(null, data);
        });
    })
);

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

function generateHash(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
}

function isValidPassword(userpass, password) {
    return bCrypt.compareSync(password, userpass);
}
