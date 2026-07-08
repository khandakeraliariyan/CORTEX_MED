export interface ApiResponse<T> {
  success: boolean;
  message: string;
  meta: unknown;
  data: T;
}
