import api from "./api";

export interface AgentResponse {
  reply: string;
  success: boolean;
  actionTaken?: "CREATE_ASSIGNMENT" | "START_ATTENDANCE" | "UPLOAD_MATERIAL" | "REPLY_QUERY" | "NONE";
}

export const processFacultyMessage = async (
  message: string,
  user: any
): Promise<AgentResponse> => {
  try {
    // Forward the message directly to the Node backend proxy which delegates to Python
    const res = await api.post("/faculty/agent", { message });
    return res.data;
  } catch (err: any) {
    console.error("NLU Proxy Error:", err);
    return {
      success: false,
      reply: `🤖 **Faculty Agent**: I encountered an error communicating with the agent system: "${err.response?.data?.message || err.message}".`,
    };
  }
};
