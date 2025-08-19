const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

/**
 * Mapping prefix → service lokal.
 * Tambahkan baris baru jika ada bot lain.
 * Contoh:
 *  { prefix: "/wa2", target: "http://127.0.0.1:3001" },
 *  { prefix: "/tg2", target: "http://127.0.0.1:7001" },
 */
const routes = [
  { prefix: "/whatsapp", target: "http://127.0.0.1:3000" }, // Bot WA (Node) port 3000
  { prefix: "/telegram", target: "http://127.0.0.1:7000" }, // Bot TG (Flask) port 7000
];

// Buat proxy untuk tiap route.
// Penting: kita TIDAK pakai body parser di gateway, agar raw body tetap utuh (aman untuk signature verification).
for (const r of routes) {
  app.use(
    r.prefix,
    createProxyMiddleware({
      target: r.target,
      changeOrigin: true,
      ws: true,
      // Hilangkan prefix saat diteruskan ke service target:
      pathRewrite: { [`^${r.prefix}`]: "" },
      proxyTimeout: 30_000,
      timeout: 30_000,
    })
  );
}

// Healthcheck sederhana
app.get("/health", (req, res) => res.status(200).send("OK"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Proxy gateway listening on http://127.0.0.1:${PORT}`);
  console.log("Routes:");
  for (const r of routes) {
    console.log(`  ${r.prefix}  -->  ${r.target}`);
  }
});