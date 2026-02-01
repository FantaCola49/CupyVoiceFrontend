import { http } from "./http";

export type EpisodeDto = {
  id: string;
  seasonId: string;
  number: number;
  title: string;
  durationSeconds: number;
  videoUrl?: string | null;
};

export type CreateEpisodeRequest = {
  number: number;
  title: string;
  durationSeconds: number;
  videoUrl?: string | null;
};

export async function getEpisodes(seasonId: string, opts?: { signal?: AbortSignal }): Promise<EpisodeDto[]> {
  const res = await http.get<EpisodeDto[]>(`/api/seasons/${seasonId}/episodes`, { signal: opts?.signal });
  return res.data;
}

export async function createEpisode(seasonId: string, req: CreateEpisodeRequest): Promise<EpisodeDto> {
  const res = await http.post<EpisodeDto>(`/api/seasons/${seasonId}/episodes`, req);
  return res.data;
}
