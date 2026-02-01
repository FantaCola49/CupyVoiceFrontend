import { http } from "./http";

export type SeriesListItemDto = {
  id: string;
  title: string;
  description?: string | null;
  posterUrl?: string | null;
};

export async function getSeriesList(): Promise<SeriesListItemDto[]> {
  const res = await http.get<SeriesListItemDto[]>("/api/series");
  return res.data;
}