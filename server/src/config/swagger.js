
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

Modules include authentication, users, vendors, products, categories,
uploads, carts, wishlists, orders, payments, admin operations, and health checks.
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
      {
        name: "Authentication",
        description: "Registration and authentication",
      },
      { name: "Users", description: "User profiles and addresses" },
      { name: "Vendors", description: "Vendor management" },
      { name: "Products", description: "Product management" },
      { name: "Categories", description: "Product categories" },
      { name: "Uploads", description: "File uploads" },
      { name: "Cart", description: "Shopping cart operations" },
      { name: "Wishlist", description: "User wishlist operations" },
      { name: "Orders", description: "Order management" },
      {
        name: "Payments",
        description: "Razorpay payment processing and verification",
      },
      {
        name: "Admin",
        description: "Administrative dashboard and resource management",
      },
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
          required: ["success", "message"],
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
              oneOf: [
                {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: true,
                  },
                },
                {
                  type: "object",
                  additionalProperties: true,
                },
              ],
            },
          },
        },
      },
    },
  },

  apis: [
    "./src/routes/*.js",
    "./src/app.js", // Change if your app entry point is elsewhere.
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
