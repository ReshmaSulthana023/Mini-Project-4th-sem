const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(new GoogleStrategy({
    clientID: "YOUR_GOOGLE_CLIENT_ID",
    clientSecret: "YOUR_SECRET",
    callbackURL: "/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
        user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id
        });
    }

    return done(null, user);
}));