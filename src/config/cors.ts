import type { CorsOptions } from "cors";

export const corsConfig: CorsOptions = {
  origin: function (origin, callback) {
    const allowedDomains = [process.env.FRONTEND_URL];
    if (!allowedDomains.includes(origin) && process.argv[2] !== "--api") {
      callback(new Error("Error de CORS"));
      return;
    }
    callback(null, true);
  },
};
