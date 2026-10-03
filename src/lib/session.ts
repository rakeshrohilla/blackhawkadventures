/** Edge-safe session constants. Kept free of Prisma/Node imports so that
 *  middleware can use them without pulling the database client in. */
export const SESSION_COOKIE = "bha_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
