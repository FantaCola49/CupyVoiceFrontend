import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import { toUserMessage } from "../api/http";
import { uploadImage } from "../api/media";

import { createSeries, getSeriesList } from "../api/series";
import type { CreateSeriesRequest, SeriesListItemDto } from "../api/series";

import { createSeason, getSeasons } from "../api/seasons";
import type { SeasonDto } from "../api/seasons";

import { createEpisode, getEpisodes } from "../api/episodes";
import type { EpisodeDto } from "../api/episodes";

type TabKey = "series" | "seasons" | "episodes";

export default function AdminPage() {
  const [tab, setTab] = useState<TabKey>("series");

  const [series, setSeries] = useState<SeriesListItemDto[]>([]);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [seriesError, setSeriesError] = useState<string | null>(null);

const refreshSeries = async (signal?: AbortSignal): Promise<void> => {
  setSeriesLoading(true);
  setSeriesError(null);
  try {
    const data = await getSeriesList({ signal });
    setSeries(data);
  } catch (e) {
    // если отменили запрос — молчим
    if (signal?.aborted) return;
    setSeriesError(toUserMessage(e));
  } finally {
    if (!signal?.aborted) setSeriesLoading(false);
  }
};

  useEffect(() => {
    void refreshSeries();}, []);

  return (
    <Stack spacing={2.2}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          Админка
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          Добавление сериалов/сезонов/эпизодов + загрузка постеров.
        </Typography>
      </Box>

      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.08)",
          backgroundImage:
            "linear-gradient(135deg, rgba(229,9,20,0.22), rgba(17,17,26,0.2) 40%, rgba(120,80,255,0.14))",
        }}
      >
        <CardContent>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v as TabKey)}
            variant="scrollable"
            allowScrollButtonsMobile
          >
            <Tab value="series" label="Сериалы" />
            <Tab value="seasons" label="Сезоны" />
            <Tab value="episodes" label="Эпизоды" />
          </Tabs>

          <Divider sx={{ my: 2 }} />

          {seriesError && <Alert severity="error">{seriesError}</Alert>}

          {tab === "series" && (
            <SeriesAdmin
              series={series}
              loading={seriesLoading}
              onCreated={refreshSeries}
            />
          )}

          {tab === "seasons" && (
            <SeasonsAdmin
              series={series}
              onChanged={refreshSeries}
            />
          )}

          {tab === "episodes" && <EpisodesAdmin series={series} />}
        </CardContent>
      </Card>
    </Stack>
  );
}

function SeriesAdmin(props: {
  series: SeriesListItemDto[];
  loading: boolean;
  onCreated: () => Promise<void>;
}) {
  const { series, loading, onCreated } = props;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [posterUrl, setPosterUrl] = useState("");

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = title.trim().length > 0 && !submitting;

  const handleUploadPoster = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      setPosterUrl(url);
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const req: CreateSeriesRequest = {
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        posterUrl: posterUrl.trim() ? posterUrl.trim() : null,
      };
      await createSeries(req);
      setTitle("");
      setDescription("");
      // posterUrl оставим (можно убрать если хочешь)
      await onCreated();
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography sx={{ fontWeight: 800 }}>Создать сериал</Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Название"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="PosterUrl (автоматически заполнится после загрузки)"
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            label="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Button
            variant="outlined"
            component="label"
            disabled={uploading}
            fullWidth
          >
            {uploading ? "Загрузка..." : "Загрузить постер (png/jpg/webp)"}
            <input
              hidden
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleUploadPoster(f);
                e.currentTarget.value = "";
              }}
            />
          </Button>
          <Typography variant="caption" sx={{ opacity: 0.75 }}>
            После загрузки URL появится в поле PosterUrl.
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Button
            variant="contained"
            disabled={!canSubmit}
            onClick={() => void submit()}
            fullWidth
          >
            {submitting ? "Сохраняю..." : "Создать сериал"}
          </Button>
        </Grid>
      </Grid>

      <Divider />

      <Typography sx={{ fontWeight: 800 }}>Существующие сериалы</Typography>
      {loading && <Typography sx={{ opacity: 0.7 }}>Загрузка...</Typography>}

      <Grid container spacing={2}>
        {series.map((s) => (
          <Grid key={s.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <CardContent>
                <Typography sx={{ fontWeight: 800 }} noWrap>
                  {s.title}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                  {s.description?.slice(0, 90) || "—"}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.6 }}>
                  {s.posterUrl ? `poster: ${s.posterUrl}` : "poster: —"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

function SeasonsAdmin(props: {
  series: SeriesListItemDto[];
  onChanged: () => Promise<void>;
}) {
  const { series } = props;

  const [seriesId, setSeriesId] = useState("");
  const [seasons, setSeasons] = useState<SeasonDto[]>([]);
  const [loading, setLoading] = useState(false);

  const [number, setNumber] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!seriesId) return;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSeasons(seriesId, { signal: controller.signal });
        setSeasons(data);
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(toUserMessage(e));
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [seriesId]);

  const canSubmit = seriesId && number > 0 && !submitting;

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const dto = await createSeason(seriesId, { number });
      setSeasons((prev) => [...prev, dto].sort((a, b) => a.number - b.number));
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography sx={{ fontWeight: 800 }}>Сезоны</Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            select
            label="Сериал"
            value={seriesId}
            onChange={(e) => setSeriesId(e.target.value)}
            fullWidth
          >
            <MenuItem value="">— выбери сериал —</MenuItem>
            {series.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.title}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            label="Номер сезона"
            type="number"
            value={number}
            onChange={(e) => setNumber(Number(e.target.value))}
            fullWidth
            inputProps={{ min: 1 }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Button
            variant="contained"
            disabled={!canSubmit}
            onClick={() => void submit()}
            fullWidth
            sx={{ height: "100%" }}
          >
            {submitting ? "Сохраняю..." : "Добавить сезон"}
          </Button>
        </Grid>
      </Grid>

      <Divider />

      <Typography sx={{ fontWeight: 800 }}>Список сезонов</Typography>
      {!seriesId && (
        <Typography sx={{ opacity: 0.7 }}>Выбери сериал выше.</Typography>
      )}
      {seriesId && loading && <Typography sx={{ opacity: 0.7 }}>Загрузка...</Typography>}

      {seriesId && !loading && (
        <Stack spacing={1}>
          {seasons.map((x) => (
            <Box
              key={x.id}
              sx={{
                p: 1.2,
                borderRadius: 2,
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography>Сезон {x.number}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                id: {x.id}
              </Typography>
            </Box>
          ))}
          {seasons.length === 0 && (
            <Typography sx={{ opacity: 0.7 }}>Сезонов пока нет.</Typography>
          )}
        </Stack>
      )}
    </Stack>
  );
}

function EpisodesAdmin(props: { series: SeriesListItemDto[] }) {
  const { series } = props;

  const [seriesId, setSeriesId] = useState("");
  const [seasons, setSeasons] = useState<SeasonDto[]>([]);
  const [seasonId, setSeasonId] = useState("");

  const [episodes, setEpisodes] = useState<EpisodeDto[]>([]);
  const [loading, setLoading] = useState(false);

  const [number, setNumber] = useState<number>(1);
  const [title, setTitle] = useState("");
  const [durationSeconds, setDurationSeconds] = useState<number>(1400);
  const [videoUrl, setVideoUrl] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!seriesId) {
      setSeasons([]);
      setSeasonId("");
      return;
    }
    const controller = new AbortController();

    (async () => {
      setError(null);
      try {
        const data = await getSeasons(seriesId, { signal: controller.signal });
        setSeasons(data);
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(toUserMessage(e));
      }
    })();

    return () => controller.abort();
  }, [seriesId]);

  useEffect(() => {
    if (!seasonId) {
      setEpisodes([]);
      return;
    }

    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getEpisodes(seasonId, { signal: controller.signal });
        setEpisodes(data);
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(toUserMessage(e));
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [seasonId]);

  const canSubmit = seasonId && title.trim() && number > 0 && durationSeconds > 0 && !submitting;

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const dto = await createEpisode(seasonId, {
        number,
        title: title.trim(),
        durationSeconds,
        videoUrl: videoUrl.trim() ? videoUrl.trim() : null,
      });
      setEpisodes((prev) => [...prev, dto].sort((a, b) => a.number - b.number));
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const seasonsForSelect = useMemo(() => seasons.slice().sort((a, b) => a.number - b.number), [seasons]);

  return (
    <Stack spacing={2}>
      <Typography sx={{ fontWeight: 800 }}>Эпизоды</Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            select
            label="Сериал"
            value={seriesId}
            onChange={(e) => {
              setSeriesId(e.target.value);
              setSeasonId("");
            }}
            fullWidth
          >
            <MenuItem value="">— выбери сериал —</MenuItem>
            {series.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.title}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            select
            label="Сезон"
            value={seasonId}
            onChange={(e) => setSeasonId(e.target.value)}
            fullWidth
            disabled={!seriesId}
          >
            <MenuItem value="">— выбери сезон —</MenuItem>
            {seasonsForSelect.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                Сезон {s.number}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="VideoUrl (пока ссылка)"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            fullWidth
            disabled={!seasonId}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            label="Номер эпизода"
            type="number"
            value={number}
            onChange={(e) => setNumber(Number(e.target.value))}
            fullWidth
            inputProps={{ min: 1 }}
            disabled={!seasonId}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Название эпизода"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            disabled={!seasonId}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            label="Длительность (сек)"
            type="number"
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(Number(e.target.value))}
            fullWidth
            inputProps={{ min: 1 }}
            disabled={!seasonId}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Button
            variant="contained"
            disabled={!canSubmit}
            onClick={() => void submit()}
            fullWidth
          >
            {submitting ? "Сохраняю..." : "Добавить эпизод"}
          </Button>
        </Grid>
      </Grid>

      <Divider />

      <Typography sx={{ fontWeight: 800 }}>Список эпизодов</Typography>
      {loading && <Typography sx={{ opacity: 0.7 }}>Загрузка...</Typography>}

      {!loading && episodes.length === 0 && (
        <Typography sx={{ opacity: 0.7 }}>Эпизодов пока нет.</Typography>
      )}

      <Stack spacing={1}>
        {episodes.map((e) => (
          <Box
            key={e.id}
            sx={{
              p: 1.2,
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 700 }}>
                {e.number}. {e.title}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                {e.durationSeconds}s · {e.videoUrl ? e.videoUrl : "videoUrl: —"}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              id: {e.id}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
