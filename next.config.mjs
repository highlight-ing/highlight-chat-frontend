import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // match the suggestions prompt
        source: "/suggestions.hbs",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  webpack: (config, options) => {
    config.resolve.alias.handlebars = path.resolve(
      "node_modules/handlebars/dist/handlebars.js"
    );
    return config;
  },
};

export default nextConfig;
