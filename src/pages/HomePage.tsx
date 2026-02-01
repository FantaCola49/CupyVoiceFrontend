import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { getSeriesList, type SeriesListItemDto } from "../api/series";
import { toUserMessage } from "../api/http";
import Grid from "@mui/material/Grid";

export default function HomePage() {
  const [items, setItems] = useState<SeriesListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
  const controller = new AbortController();

  (async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getSeriesList({ signal: controller.signal });
      setItems(data);
    } catch (e) {
      // если отменили — молчим
      if (controller.signal.aborted) return;
      setError(toUserMessage(e));
    } finally {
      // finally без return
      if (!controller.signal.aborted) setLoading(false);
    }
  })();

  return () => controller.abort();
}, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => (x.title || "").toLowerCase().includes(q));
  }, [items, query]);

  return (
    <Stack spacing={2.2}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: 0.2 }}>
          Главная
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          Каталог сериалов (backend: <code>GET /api/series</code>)
        </Typography>
      </Box>

      <Box
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          p: { xs: 2, md: 3 },
          background:
            "linear-gradient(135deg, rgba(229,9,20,0.35), rgba(17,17,26,0.2) 40%, rgba(120,80,255,0.18))",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          Смотри сериалы в своём стиле
        </Typography>
        <Typography sx={{ mt: 1, maxWidth: 780, opacity: 0.85 }}>
          Это главная страница каталога. Дальше сделаем страницу сериала, сезоны и
          плеер.
        </Typography>
      </Box>

      <TextField
        label="Поиск по названию"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        fullWidth
      />

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && filtered.length === 0 && (
        <Alert severity="info">
          Ничего не найдено. Создай сериал через Swagger и обнови страницу.
        </Alert>
      )}

      {!loading && !error && filtered.length > 0 && (
        <Grid container spacing={2}>
          {filtered.map((x) => (
            <Grid key={x.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transition: "transform 140ms ease, box-shadow 140ms ease",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
              >
                <CardActionArea
                  onClick={() => {
                    // позже сделаем /series/:id
                    alert(`Откроем сериал позже: ${x.title}`);
                  }}
                >
                  {x.posterUrl ? (
                    <CardMedia
                      component="img"
                      height="180"
                      image={x.posterUrl}
                      alt={x.title}
                      sx={{ filter: "contrast(1.05) saturate(1.05)" }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 180,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "action.hover",
                      }}
                    >
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        No poster
                      </Typography>
                    </Box>
                  )}

                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 800 }} noWrap>
                      {x.title}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {x.description?.slice(0, 120) || "—"}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}
