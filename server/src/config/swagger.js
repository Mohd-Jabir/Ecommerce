
import swaggerJSDoc from "swagger-jsdoc";

const PORT = process.env.PORT || 3000;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Multi-Vendor E-Commerce API",
      version: "1.0.0",
      description: `
API documentation for the MERN multi-vendor e-commerce application.

Modules include authentication, users, vendors, products,
categories, uploads, carts, and orders.
      `.trim(),
    },

    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Local development server",
      },
    ],

    tags: [
      { name: "Health", description: "API health checks" },
      { name: "Authentication", description: "Registration and authentication" },
      { name: "Users", description: "User profiles and addresses" },
      { name: "Vendors", description: "Vendor management" },
      { name: "Products", description: "Product management" },
      { name: "Categories", description: "Product categories" },
      { name: "Uploads", description: "File uploads" },
      { name: "Cart", description: "Shopping cart operations" },
      { name: "Orders", description: "Order management" },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your access JWT token.",
        },
      },

      schemas: {
        ApiError: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Invalid request",
            },
            errors: {
              description: "Optional validation error details",
              nullable: true,
            },
          },
        },
      },
    },
  },

  // Swagger reads the OpenAPI comments from these route files.
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
