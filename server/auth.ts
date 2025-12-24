
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "./models";
import { insertUserSchema, loginSchema } from "@shared/routes";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  if (!stored) {
    return false;
  }
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) {
    return false;
  }
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "super secret session key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      // Using email as username for login
      const user = await storage.getUserByEmail(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    try {
      // Handle both Sequelize model instances and plain objects
      const userId = user && typeof user === 'object' ? (user as any).id : null;
      if (!userId) {
        return done(new Error('User ID not found'), null);
      }
      done(null, userId);
    } catch (error) {
      done(error, null);
    }
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id as number);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  app.post("/api/auth/signup", async (req, res, next) => {
    try {
      const validationResult = insertUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          field: validationResult.error.issues[0]?.path[0]
        });
      }

      const userData = validationResult.data;
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const hashedPassword = await hashPassword(userData.password);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid input", 
        field: validationResult.error.issues[0]?.path[0] 
      });
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
