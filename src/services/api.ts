import axios from 'axios';
import type {
  SymptomRequest,
  SymptomAssessment,
  MedicalRecord,
  RecordDetails,
  ReportExplanation,
  HealthTrend,
  ChatResponse,
  ChatMessage,
  DashboardStats,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const analyzeSymptoms = async (symptomData: SymptomRequest): Promise<SymptomAssessment> => {
  const response = await apiClient.post('/symptoms/analyze', symptomData);
  return response.data;
};

export const uploadMedicalRecord = async (formData: FormData) => {
  const response = await apiClient.post('/records/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getMedicalRecords = async (params?: {
  limit?: number;
  offset?: number;
  record_type?: string;
}): Promise<{ total: number; records: MedicalRecord[] }> => {
  const response = await apiClient.get('/records', { params });
  return response.data;
};

export const getRecordDetails = async (recordId: string): Promise<RecordDetails> => {
  const response = await apiClient.get(`/records/${recordId}`);
  return response.data;
};

export const explainReport = async (recordId: string): Promise<{ explanation: ReportExplanation }> => {
  const response = await apiClient.post('/reports/explain', { record_id: recordId });
  return response.data;
};

export const getHealthTrends = async (recordId: string): Promise<{ test_trends: HealthTrend[] }> => {
  const response = await apiClient.get(`/reports/${recordId}/trends`);
  return response.data;
};

export const askQuestion = async (question: string, sessionId?: string): Promise<ChatResponse> => {
  const response = await apiClient.post('/chat/ask', { question, session_id: sessionId });
  return response.data;
};

export const getChatHistory = async (sessionId: string): Promise<{ session_id: string; messages: ChatMessage[] }> => {
  const response = await apiClient.get(`/chat/history/${sessionId}`);
  return response.data;
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get('/dashboard/stats');
  return response.data;
};
