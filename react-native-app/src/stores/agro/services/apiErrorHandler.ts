import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: any;
}

export const handleApiError = (error: unknown): ApiError => {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<any>;
    const data = axiosError.response?.data;
    const statusCode = axiosError.response?.status || 500;

    let message = 'An unexpected server error occurred.';
    if (data?.detail) {
      if (typeof data.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        message = data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
      }
    } else if (data?.message) {
      message = data.message;
    } else if (axiosError.message) {
      message = axiosError.message;
    }

    return {
      message,
      statusCode,
      errors: data?.errors,
    };
  }

  return {
    message: error instanceof Error ? error.message : 'Unknown error',
    statusCode: 500,
  };
};

export default handleApiError;
