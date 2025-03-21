// This file is used in the Docker container
import "dotenv/config";

import express from "express";
import "express-async-errors";

import cors from "cors";
import prismaAutoCrud from "./index";
import prismaClient from "./prismaClient";
import authMiddleware from "@moreillon/express-oidc";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json";
import { Response } from "express";
import { version, author } from "./package.json";

console.log(`Auto CRUD v${version}`);

const { PORT = 80, READ_ONLY, OIDC_JWKS_URI } = process.env;

const options = {
  readonly: !!READ_ONLY,
};

export const app = express();
app.use(cors());
app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/", (_, res: Response) => {
  res.send({
    application: "Auto CRUD",
    version,
    author,
    options,
    oidc_jwks_uri: OIDC_JWKS_URI,
  });
});

if (OIDC_JWKS_URI) {
  console.log(`Authentication enabled. JWKS URI: ${OIDC_JWKS_URI}`);
  app.use(
    authMiddleware({
      jwksUri: OIDC_JWKS_URI,
    })
  );
}

app.use(prismaAutoCrud(prismaClient, options));
app.listen(PORT, () => {
  console.log(`Express Listening on port ${PORT}`);
});
