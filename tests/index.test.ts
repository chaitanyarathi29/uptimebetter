/// <reference types="bun" />
import { beforeAll,describe, it, expect } from "bun:test";
import axios from "axios";

const API_URL = "http://localhost:3000/api/v1";

describe("Auth Endpoints", () => {
  describe("POST /signup", () => {
    it("should successfully create a new user and return token", async () => {
      const response = await axios.post(`${API_URL}/signup`, {
        username: `user_${Date.now()}`,
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.data.userId).toBeDefined();
      expect(response.data.token).toBeDefined();
      expect(typeof response.data.userId).toBe("string");
      expect(typeof response.data.token).toBe("string");
    });

    it("should return 400 for missing username", async () => {
      try {
        await axios.post(`${API_URL}/signup`, {
          password: "password123",
        });
        expect.unreachable();
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe("validation failed");
      }
    });

    it("should return 400 for missing password", async () => {
      try {
        await axios.post(`${API_URL}/signup`, {
          username: "testuser",
        });
        expect.unreachable();
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe("validation failed");
      }
    });

    it("should return 400 for empty body", async () => {
      try {
        await axios.post(`${API_URL}/signup`, {});
        expect.unreachable();
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe("validation failed");
      }
    });

    it("should return 409 for duplicate username", async () => {
      const username = `duplicate_${Date.now()}`;

      // Create first user
      await axios.post(`${API_URL}/signup`, {
        username,
        password: "password123",
      });

      // Try to create duplicate
      try {
        await axios.post(`${API_URL}/signup`, {
          username,
          password: "different_password",
        });
        expect.unreachable();
      } catch (error: any) {
        expect(error.response.status).toBe(409);
        expect(error.response.data.message).toBe("Username already exists");
      }
    });
  });

  describe("POST /signin", () => {
    let testUsername: string;
    let testPassword: string;
    let authToken: string;
    let userId: string;

    beforeAll(async () => {
      // Create a test user before running signin tests
      testUsername = `signin_test_${Date.now()}`;
      testPassword = "testpass123";

      const signupResponse = await axios.post(`${API_URL}/signup`, {
        username: testUsername,
        password: testPassword,
      });

      userId = signupResponse.data.userId;
      authToken = signupResponse.data.token;
    });

    it("should successfully signin with correct credentials", async () => {
      const response = await axios.post(`${API_URL}/signin`, {
        username: testUsername,
        password: testPassword,
      });

      expect(response.status).toBe(200);
      expect(response.data.userId).toBe(userId);
      expect(response.data.token).toBeDefined();
      expect(typeof response.data.token).toBe("string");
    });

    it("should return 400 for missing username", async () => {
      try {
        await axios.post(`${API_URL}/signin`, {
          password: "password123",
        });
        expect.unreachable();
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe("validation failed");
      }
    });

    it("should return 400 for missing password", async () => {
      try {
        await axios.post(`${API_URL}/signin`, {
          username: "testuser",
        });
        expect.unreachable();
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe("validation failed");
      }
    });

    it("should return 401 for non-existent user", async () => {
      try {
        await axios.post(`${API_URL}/signin`, {
          username: "nonexistent_user_12345",
          password: "password123",
        });
        expect.unreachable();
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.message).toBe("Invalid credentials");
      }
    });

    it("should return 401 for wrong password", async () => {
      try {
        await axios.post(`${API_URL}/signin`, {
          username: testUsername,
          password: "wrongpassword",
        });
        expect.unreachable();
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.message).toBe("Invalid credentials");
      }
    });

    it("should return 401 for empty password", async () => {
      try {
        await axios.post(`${API_URL}/signin`, {
          username: testUsername,
          password: "",
        });
        expect.unreachable();
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.message).toBe("Invalid credentials");
      }
    });
  });
});

describe("Website Endpoints", () => {
  let authToken: string;
  let userId: string;

  describe("POST /website", () => {
    // Create a user and get auth token before website tests
    beforeAll(async () => {
      const username = `website_test_user_${Date.now()}`;
      const password = "testpass123";

      const signupResponse = await axios.post(`${API_URL}/signup`, {
        username,
        password,
      });

      userId = signupResponse.data.userId;
      authToken = signupResponse.data.token;
    });

    it("should return 403 when no auth token is provided", async () => {
      try {
        await axios.post(`${API_URL}/website`, {
          url: `https://example${Date.now()}.com`,
        });
        expect.unreachable();
      } catch (error: any) {
        expect(error.response.status).toBe(403);
        expect(error.response.data.message).toBe("No token provided");
      }
    });

    it("should return 400 when invalid auth token is provided", async () => {
      try {
        await axios.post(
          `${API_URL}/website`,
          {
            url: `https://example${Date.now()}.com`,
          },
          {
            headers: {
              Authorization: "Bearer invalid_token",
            },
          }
        );
        expect.unreachable();
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe("Unauthorized");
      }
    });

    it("should return 400 for invalid URL", async () => {
      try {
        await axios.post(
          `${API_URL}/website`,
          {
            url: "not a valid url",
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        expect.unreachable();
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe("validation failed");
      }
    });

    it("should return 400 for missing URL", async () => {
      try {
        await axios.post(`${API_URL}/website`, {}, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        expect.unreachable();
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe("validation failed");
      }
    });

    it("should successfully create a new website when authenticated", async () => {
      const response = await axios.post(
        `${API_URL}/website`,
        {
          url: `https://example${Date.now()}.com`,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.id).toBeDefined();
      expect(typeof response.data.id).toBe("string");
    });

    it("should successfully create multiple websites for the same user", async () => {
      const response1 = await axios.post(
        `${API_URL}/website`,
        {
          url: `https://test1-${Date.now()}.com`,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const response2 = await axios.post(
        `${API_URL}/website`,
        {
          url: `https://test2-${Date.now()}.com`,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect(response1.data.id).toBeDefined();
      expect(response2.data.id).toBeDefined();
      expect(response1.data.id).not.toBe(response2.data.id);
    });
  });

  describe("GET /status/:websiteId", () => {
    let user1Token: string;
    let user1Id: string;
    let user1WebsiteId: string;

    let user2Token: string;
    let user2Id: string;
    let user2WebsiteId: string;

    beforeAll(async () => {
      // Create User 1
      const user1Username = `user1_${Date.now()}`;
      const user1Response = await axios.post(`${API_URL}/signup`, {
        username: user1Username,
        password: "password123",
      });
      user1Id = user1Response.data.userId;
      user1Token = user1Response.data.token;

      // Create User 1's website
      const user1WebsiteResponse = await axios.post(
        `${API_URL}/website`,
        {
          url: `https://user1-website-${Date.now()}.com`,
        },
        {
          headers: {
            Authorization: `Bearer ${user1Token}`,
          },
        }
      );
      user1WebsiteId = user1WebsiteResponse.data.id;

      // Create User 2
      const user2Username = `user2_${Date.now()}`;
      const user2Response = await axios.post(`${API_URL}/signup`, {
        username: user2Username,
        password: "password456",
      });
      user2Id = user2Response.data.userId;
      user2Token = user2Response.data.token;

      // Create User 2's website
      const user2WebsiteResponse = await axios.post(
        `${API_URL}/website`,
        {
          url: `https://user2-website-${Date.now()}.com`,
        },
        {
          headers: {
            Authorization: `Bearer ${user2Token}`,
          },
        }
      );
      user2WebsiteId = user2WebsiteResponse.data.id;
    });

    it("should return 403 when no auth token is provided", async () => {
      try {
        await axios.get(`${API_URL}/status/${user1WebsiteId}`);
        expect.unreachable();
      } catch (error: any) {
        expect(error.response.status).toBe(403);
        expect(error.response.data.message).toBe("No token provided");
      }
    });

    it("should return 400 when invalid auth token is provided", async () => {
      try {
        await axios.get(`${API_URL}/status/${user1WebsiteId}`, {
          headers: {
            Authorization: "Bearer invalid_token",
          },
        });
        expect.unreachable();
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe("Unauthorized");
      }
    });

    it("should successfully fetch user's own website", async () => {
      const response = await axios.get(`${API_URL}/status/${user1WebsiteId}`, {
        headers: {
          Authorization: `Bearer ${user1Token}`,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(user1WebsiteId);
      expect(response.data.url).toContain("user1-website");
      expect(response.data.timeAdded).toBeDefined();
    });

    it("user1 should NOT be able to access user2's website", async () => {
      try {
        await axios.get(`${API_URL}/status/${user2WebsiteId}`, {
          headers: {
            Authorization: `Bearer ${user1Token}`,
          },
        });
        expect.unreachable();
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.message).toBe("Website not found");
      }
    });

    it("user2 should NOT be able to access user1's website", async () => {
      try {
        await axios.get(`${API_URL}/status/${user1WebsiteId}`, {
          headers: {
            Authorization: `Bearer ${user2Token}`,
          },
        });
        expect.unreachable();
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.message).toBe("Website not found");
      }
    });

    it("should return 404 for non-existent website ID", async () => {
      try {
        await axios.get(`${API_URL}/status/non-existent-id-12345`, {
          headers: {
            Authorization: `Bearer ${user1Token}`,
          },
        });
        expect.unreachable();
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.message).toBe("Website not found");
      }
    });

    it("user2 should successfully fetch their own website", async () => {
      const response = await axios.get(`${API_URL}/status/${user2WebsiteId}`, {
        headers: {
          Authorization: `Bearer ${user2Token}`,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(user2WebsiteId);
      expect(response.data.url).toContain("user2-website");
      expect(response.data.timeAdded).toBeDefined();
    });
  });
});
