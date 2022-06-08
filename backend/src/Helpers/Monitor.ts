// @ts-nocheck

import url from "url";
import http from "http";
import express from "express";
import promBundle from "express-prom-bundle";
import listEndpoints from "express-list-endpoints";
import promClient from "prom-client";
import UrlPattern from "url-pattern";

const setupMetricService = option => {
  // Setup server on a second port to display metrics
  const metricApp = express();
  const metricServer = http.createServer(metricApp);

  metricApp.get("/metrics", async (req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(promClient.register.metrics());
  });

  const host = option.host || "0.0.0.0";
  const port = option.port || 9991;

  metricServer.listen(port, host, () => {
    console.log(`Metrics server listening on ${host}:${port}`);
  });
};

const captureAllRoutes = (option, app) => {
  let allRoutes = listEndpoints(app);
  allRoutes = allRoutes.filter(
    route => route.path !== "/*" && route.path !== "*"
  );

  allRoutes.forEach(route => {
    if (route.path.endsWith("/")) {
      // Remove trailing slash
      route.path = route.path.replace(/\/$/, "");
    }

    console.log(`Route found: ${route.path}`);
    route.pattern = route.path;

    // NOTE: urlPatternMaker has to create an UrlPattern compatible object.
    if (option.urlPatternMaker) {
      route.path = option.urlPatternMaker(route.path);
    } else {
      route.path = new UrlPattern(route.path, {
        segmentNameCharset: "a-zA-Z0-9_-"
      });
    }
  });

  return allRoutes;
};

const makeApiMiddleware = (option = {}) => {
  const allRoutes = [];

  const normalizePath = (req, opts) => {
    if (option.normalizePath !== undefined && !option.normalizePath) {
      return req.url;
    }

    let pattern = null;
    let path = url.parse(req.originalUrl || req.url).pathname;
    if (path.endsWith("/")) {
      // Remove trailing slash
      path = path.replace(/\/$/, "");
    }

    allRoutes.some(route => {
      if (route.methods.indexOf(req.method) === -1) {
        return false;
      }

      if (route.path.match(path)) {
        pattern = route.pattern;
        return true;
      }

      return false;
    });

    if (option.discardUnmatched && pattern === null) {
      return false;
    }

    return pattern || path;
  };

  const metricsMiddleware = promBundle({
    includeMethod: true,
    includePath: true,
    autoregister: false,
    buckets: [0.03, 0.3, 1, 1.5, 3, 5, 10],
    normalizePath
  });

  if (option.createServer === undefined || option.createServer) {
    setupMetricService(option);
  }

  return (req, res, next) => {
    if (allRoutes.length === 0) {
      captureAllRoutes(option, req.app).forEach(route => {
        allRoutes.push(route);
      });
    }
    metricsMiddleware(req, res, next);
  };
};

export default makeApiMiddleware;

