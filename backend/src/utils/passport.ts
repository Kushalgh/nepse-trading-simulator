import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";
import { CONSTANTS } from "../constants/constants";

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: CONSTANTS.GOOGLE.CLIENT_ID,
      clientSecret: CONSTANTS.GOOGLE.CLIENT_SECRET,
      callbackURL: CONSTANTS.GOOGLE.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: { email: profile.emails![0].value },
        });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: profile.emails![0].value,
              username: profile.displayName,
              passwordHash: "",
              cashBalance: CONSTANTS.USER.CASH_BALANCE_DEFAULT,
            },
          });
        }
        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

export default passport;
