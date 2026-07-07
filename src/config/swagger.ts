import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mini ERP API",
      version: "1.0.0",
      description: "Mini ERP Backend API Documentation",
    },

    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Local Server",
      },
      {
        url: "https://mini-erp-backend-cqxj.onrender.com/api/v1",
        description: "Production Server",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./src/modules/**/*.routes.ts"],
});
