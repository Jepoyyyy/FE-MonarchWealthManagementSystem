import { api } from '~/shared/api/client';
import type {
  QuestionnaireQuestion,
  ProfilerSubmissionDTO,
  ProfilerResultDTO,
} from './profiler.types';

export const ProfilerApi = {
  getQuestionnaire: () =>
    api.get<QuestionnaireQuestion[]>('/api/v1/me/profiler'),

  submitAnswers: (dto: ProfilerSubmissionDTO) =>
    api.put<ProfilerResultDTO>('/api/v1/me/profiler', dto),
};
