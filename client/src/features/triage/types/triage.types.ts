export interface AiEngineStatus {
  online: boolean;
  status: string;
  llm_backend: string | null;
  llm_model: string | null;
}
