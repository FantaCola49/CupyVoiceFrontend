import { http } from "./http";

export type SeriesListItemDto = {
  id: string;
  title: string;
  description?: string | null;
  posterUrl?: string | null;
};

export type SeriesDetailsDto = {
  id: string;
  title: string;
  description?: string | null;
  posterUrl?: string | null;
};

export type CreateSeriesRequest = {
  title: string;
  description?: string | null;
  posterUrl?: string | null;
};


export async function getSeriesList(opts?: {signal?: AbortSignal}): Promise<SeriesListItemDto[]> {
  const res = await http.get<SeriesListItemDto[]>("/api/series", {signal: opts?.signal});
  return res.data;
}

export async function createSeries(req: CreateSeriesRequest): Promise<SeriesDetailsDto> {
  const res = await http.post<SeriesDetailsDto>("/api/series", req);
  return res.data;
}
