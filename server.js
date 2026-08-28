// Entry point for cPanel's "Setup Node.js App" (Phusion Passenger).
// Passenger can't invoke the `next start` CLI directly, so this wraps the
// built app in a plain http server listening on the port Passenger assigns
// via process.env.PORT.
const { createServer } = require("http");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`Novella ready on port ${port}`);
  });
});
