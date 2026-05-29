import Activity from "../models/Activity";
import mongoose from "mongoose";

/**
 * Log a system or security event to the Activity audit log collection
 * @param userId ID of the user performing the action, or null for unauthenticated/system actions
 * @param action Audit category (e.g. 'LOGIN_SUCCESS', 'PROXY_ATTEMPT', 'USER_DELETED')
 * @param description Detailed text description of the event
 */
export const logAuditEvent = async (
  userId: string | mongoose.Types.ObjectId | null,
  action: string,
  description: string
): Promise<void> => {
  try {
    // Generate a fallback system ID if no user context is available (e.g., guest failed logins)
    const activeUserId = userId || new mongoose.Types.ObjectId("000000000000000000000000");

    await Activity.create({
      userId: activeUserId,
      action: action.toUpperCase(),
      description,
      createdAt: new Date()
    });

    console.log(`[AUDIT LOG] Action: ${action} | Description: ${description}`);
  } catch (err: any) {
    console.error("Failed to write system audit log:", err.message);
  }
};
