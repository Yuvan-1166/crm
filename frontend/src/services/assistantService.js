import api from "./api";

export const createAssistantSession = async ({ queryType = "mysql", systemInstructions = "" } = {}) => {
  const { data } = await api.post("/assistant/sessions", {
    queryType,
    systemInstructions,
  });
  return data;
};

export const getAssistantSession = async (sessionToken) => {
  const { data } = await api.get(`/assistant/sessions/${sessionToken}`);
  return data;
};

export const getAssistantHistory = async (sessionToken) => {
  const { data } = await api.get(`/assistant/sessions/${sessionToken}/history`);
  return data;
};

export const sendAssistantMessage = async (sessionToken, payload) => {
  const { data } = await api.post(`/assistant/sessions/${sessionToken}/chat`, payload);
  return data;
};

export const deleteAssistantSession = async (sessionToken) => {
  await api.delete(`/assistant/sessions/${sessionToken}`);
};

export const getAssistantHealth = async () => {
  const { data } = await api.get("/assistant/health");
  return data;
};
