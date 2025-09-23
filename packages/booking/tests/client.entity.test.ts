import { describe, it, expect } from "bun:test";
import { randomUUID } from "crypto";
import { Client } from "../src/domain";

describe("Client Entity", () => {
  const now = new Date();
  
  it("should create a valid client", () => {
    const client = Client.create({
      id: randomUUID(),
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      company: "Acme Inc",
      createdAt: now,
      updatedAt: now,
    });
    
    expect(client.state.id).toBeDefined();
    expect(client.state.name).toBe("John Doe");
    expect(client.state.email).toBe("john.doe@example.com");
    expect(client.state.phone).toBe("+1234567890");
    expect(client.state.company).toBe("Acme Inc");
  });
  
  it("should update client contact info", () => {
    const client = Client.create({
      id: randomUUID(),
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      createdAt: now,
      updatedAt: now,
    });
    
    client.actions.updateContactInfo({
      name: "Jane Doe",
      email: "jane.doe@example.com",
      phone: "+0987654321",
      company: "Globex Corp",
    });
    
    expect(client.state.name).toBe("Jane Doe");
    expect(client.state.email).toBe("jane.doe@example.com");
    expect(client.state.phone).toBe("+0987654321");
    expect(client.state.company).toBe("Globex Corp");
    expect(client.state.updatedAt).toBeInstanceOf(Date);
  });
  
  it("should validate email format when updating", () => {
    const client = Client.create({
      id: randomUUID(),
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      createdAt: now,
      updatedAt: now,
    });
    
    expect(() => {
      client.actions.updateContactInfo({
        email: "invalid-email",
      });
    }).toThrow("Invalid email format");
  });
});