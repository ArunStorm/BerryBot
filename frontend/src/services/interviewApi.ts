import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

export type StartInterviewRequest = {
  topics: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  mode: 'VOICE' | 'TEXT';
  questionCount: number;
};
export type SessionQuestion = { questionId: string; position: number; topic: string; type: string; difficulty: string; prompt: string };
export type InterviewSession = { sessionId: string; topics: string[]; difficulty: string; mode: 'VOICE' | 'TEXT'; status: string; totalQuestions: number; currentQuestion: number; startedAt: string; completedAt?: string; question: SessionQuestion };
export type AnswerResponse = { score: number; feedback: string; adaptiveFollowUp?: string; interviewCompleted: boolean; nextQuestion?: SessionQuestion };
export type ReportItem = { questionId: string; topic: string; question: string; answer: string; score: number; feedback: string; adaptiveFollowUp?: string };
export type InterviewReport = { sessionId: string; overallScore: number; answeredQuestions: number; results: ReportItem[] };
type ApiEnvelope<T> = { success: boolean; message: string; data: T; errorCode?: string };

export async function startInterview(request: StartInterviewRequest) { const response = await api.post<ApiEnvelope<InterviewSession>>('/api/v1/interviews', request); return response.data.data; }
export async function getInterviewSession(sessionId: string) { const response = await api.get<ApiEnvelope<InterviewSession>>(`/api/v1/interviews/${sessionId}`); return response.data.data; }
export async function submitInterviewAnswer(sessionId: string, questionId: string, answer: string) { const response = await api.post<ApiEnvelope<AnswerResponse>>(`/api/v1/interviews/${sessionId}/answers`, { questionId, answer }); return response.data.data; }
export async function getInterviewReport(sessionId: string) { const response = await api.get<ApiEnvelope<InterviewReport>>(`/api/v1/interviews/${sessionId}/report`); return response.data.data; }
