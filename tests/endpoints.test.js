import { describe, expect, test, vi } from "vitest";
import request from "supertest";
import app from "../index.js";

// Mock nodemailer to avoid actual email sending during tests
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: "mock-id" })
    }))
  }
}));

// Mock Cloudinary
vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload_stream: vi.fn((options, callback) => {
        return {
          end: vi.fn(() => {
            // Simulate Cloudinary success callback
            callback(null, { secure_url: "https://mock-res.cloudinary.com/test.jpg", public_id: "test_id" });
          })
        };
      }),
      destroy: vi.fn().mockResolvedValue({ result: "ok" })
    }
  }
}));

describe("Backend API Endpoints", () => {
  
  // ── Health Check ──
  test("GET /health returns 200 and online status", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("online");
  });

  // ── Email Validation ──
  test("POST /check-email returns 200 for valid email", async () => {
    const res = await request(app)
      .post("/check-email")
      .send({ email: "valid@example.com" });
    expect(res.statusCode).toBe(200);
    expect(res.body.valid).toBe(true);
  });

  // ── Cloudinary Uploads ──
  test("POST /uploadFile returns 201 on successful file upload", async () => {
    const res = await request(app)
      .post("/uploadFile")
      .attach("file", Buffer.from("dummy-image-content"), "test.jpg");
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("url");
    expect(res.body.public_id).toBe("test_id");
  });

  test("POST /uploadFile returns 400 if file is missing", async () => {
    const res = await request(app).post("/uploadFile").send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe("Error missing file");
  });

  test("POST /uploadPfp returns 201 on successful pfp upload", async () => {
    const res = await request(app)
      .post("/uploadPfp")
      .attach("file", Buffer.from("dummy-pfp-content"), "profile.png");
    
    expect(res.statusCode).toBe(201);
    expect(res.body.url).toContain("cloudinary.com");
  });

  // ── Cloudinary Deletion ──
  test("DELETE /deleteImage returns 200 on success", async () => {
    const res = await request(app)
      .delete("/deleteImage")
      .send({ public_id: "test_id" });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe("Succesful Deletion!");
  });

  // ── Welcome Email ──
  test("POST /welcome-email returns 200 on success", async () => {
    const res = await request(app)
      .post("/welcome-email")
      .send({ email: "test@test.com", username: "Tester" });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe("Welcome email sent successfully");
  });
});
