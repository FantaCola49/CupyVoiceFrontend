import { http } from "./http";

export type SeriesListItemDto = {
  id: string;
  title: string;
  description?: string | null;
  posterUrl?: string | null;
};

export async function getSeriesList(opts?: {signal?: AbortSignal}): Promise<SeriesListItemDto[]> {
  const res = await http.get<SeriesListItemDto[]>("/api/series", {signal: opts?.signal});
  return res.data;
}