import { http } from "./http";

export type SeasonDto = {
  id: string;
  seriesId: string;
  number: number;
};

export type CreateSeasonRequest = {
  number: number; // seriesId берём из route
};

export async function getSeasons(seriesId: string, opts?: { signal?: AbortSignal }): Promise<SeasonDto[]> {
  const res = await http.get<SeasonDto[]>(`/api/series/${seriesId}/seasons`, { signal: opts?.signal });
  return res.data;
}

export async function createSeason(seriesId: string, req: CreateSeasonRequest): Promise<SeasonDto> {
  const res = await http.post<SeasonDto>(`/api/series/${seriesId}/seasons`, req);
  return res.data;
}
