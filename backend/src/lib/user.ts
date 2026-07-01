import { db } from "../db/index"
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export async function getLoggedInUser(clerkUserId: string) {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkUserId, clerkUserId))
        .limit(1)

    return user
}