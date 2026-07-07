import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Mini ERP API",
      version: "1.0.0",
      description:
        "Mini ERP Backend API Documentation. Includes Authentication, Users, Products, Customers, Sales and Dashboard endpoints.",
    },

    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Local Development Server",
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

      schemas: {
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              example: "admin@gmail.com",
            },
            password: {
              type: "string",
              example: "Admin123",
            },
          },
        },

        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "6868f2f5a123456789abcdef",
            },
            name: {
              type: "string",
              example: "Admin User",
            },
            email: {
              type: "string",
              example: "admin@gmail.com",
            },
            role: {
              type: "string",
              example: "Admin",
            },
            isActive: {
              type: "boolean",
              example: true,
            },
            createdAt: {
              type: "string",
              example: "2026-07-07T10:00:00.000Z",
            },
          },
        },

        Product: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            name: {
              type: "string",
              example: "Samsung 4K TV",
            },
            sku: {
              type: "string",
              example: "TV-SAM-55",
            },
            category: {
              type: "string",
              example: "Electronics",
            },
            price: {
              type: "number",
              example: 45000,
            },
            costPrice: {
              type: "number",
              example: 40000,
            },
            stock: {
              type: "number",
              example: 25,
            },
          },
        },

        Customer: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            name: {
              type: "string",
              example: "John Doe",
            },
            email: {
              type: "string",
              example: "john@example.com",
            },
            phone: {
              type: "string",
              example: "+8801712345678",
            },
            address: {
              type: "string",
              example: "Dhaka, Bangladesh",
            },
          },
        },

        Sale: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            customerId: {
              type: "string",
            },
            totalAmount: {
              type: "number",
              example: 5000,
            },
            status: {
              type: "string",
              example: "completed",
            },
            createdAt: {
              type: "string",
              example: "2026-07-07T10:00:00.000Z",
            },
          },
        },

        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            statusCode: {
              type: "number",
              example: 200,
            },
            message: {
              type: "string",
              example: "Request successful",
            },
            data: {
              type: "object",
            },
          },
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./src/modules/**/*.routes.ts", "./dist/modules/**/*.routes.js"],
});
