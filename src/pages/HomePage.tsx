import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { getSeriesList, SeriesListItemDto } from "../api/series";
import { toUserMessage } from "../api/http";

export default function HomePage() {
  const [items, setItems] = useState<SeriesListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSeriesList();
        if (!alive) return;
        setItems(data);
      } catch (e) {
        if (!alive) return;
        setError(toUserMessage(e));
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => (x.title || "").toLowerCase().includes(q));
  }, [items, query]);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Главная
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Список сериалов из backend: <code>GET /api/series</code>
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
            <Grid item key={x.id} xs={12} sm={6} md={4} lg={3}>
              <Card>
                <CardActionArea
                  onClick={() => {
                    // пока просто заглушка: позже сделаем страницу деталей /series/:id
                    alert(`Откроем сериал позже: ${x.title}`);
                  }}
                >
                  {x.posterUrl ? (
                    <CardMedia component="img" height="160" image={x.posterUrl} alt={x.title} />
                  ) : (
                    <Box
                      sx={{
                        height: 160,
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
                    <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>
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
