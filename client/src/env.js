import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET: z.string().optional().default(""),
    DATABASE_URL: z.string().url().optional().default("file:./db.sqlite"),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    AWS_ACCESS_KEY_ID: z.string().optional().default(""),
    AWS_SECRET_ACCESS_KEY: z.string().optional().default(""),
    AWS_REGION: z.string().optional().default(""),
    S3_BUCKET_NAME: z.string().optional().default(""),
    BACKEND_API_KEY: z.string().optional().default(""),
    STYLETTS2_API_ROUTE: z.string().optional().default(""),
    SEED_VC_API_ROUTE: z.string().optional().default(""),
    MAKE_AN_AUDIO_API_ROUTE: z.string().optional().default(""),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    BACKEND_API_KEY: process.env.BACKEND_API_KEY,
    STYLETTS2_API_ROUTE: process.env.STYLETTS2_API_ROUTE,
    SEED_VC_API_ROUTE: process.env.SEED_VC_API_ROUTE,
    MAKE_AN_AUDIO_API_ROUTE: process.env.MAKE_AN_AUDIO_API_ROUTE,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
