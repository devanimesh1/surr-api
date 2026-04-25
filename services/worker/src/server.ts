import express from "express";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

app.get("/healthz", (_req, res) => {
  res.json({ ok: true, data: { status: "healthy" } });
});

app.post("/jobs/:name", (req, res) => {
  // Cron jobs (refreshUserEmbeddings, embedNewTracks, recomputeTrending,
  // refreshSpotifyMetadata, cleanupActivity) wire in here in Phase 5.
  res.json({ ok: true, data: { stubbed: req.params.name } });
});

const port = Number(process.env.PORT ?? 8080);
if (require.main === module) {
  app.listen(port, () => {
    console.log(`worker listening on :${port}`);
  });
}

export { app };
