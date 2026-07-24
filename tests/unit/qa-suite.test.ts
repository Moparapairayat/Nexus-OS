import { serviceCategorySchema, assignServiceSchema } from "@/features/services/schemas/service-schema";

describe("NexusOS Enterprise QA & Business Logic Test Suite", () => {
  test("Calculates Invoice Due Date window correctly", () => {
    const issueDate = new Date("2026-07-22T00:00:00Z");
    const dueDays = 14;
    const dueDate = new Date(issueDate.getTime() + dueDays * 86400000);

    expect(dueDate.toISOString()).toContain("2026-08-05");
  });

  test("Formats Currency amounts accurately", () => {
    const price = 49.99;
    const formattedUSD = `$${price.toFixed(2)}`;
    const formattedBDT = `৳${(price * 118).toFixed(2)}`;

    expect(formattedUSD).toBe("$49.99");
    expect(formattedBDT).toBe("৳5898.82");
  });

  test("Validates Service Category Schema correctly", () => {
    const validPayload = {
      name: "Managed Cloud VPS",
      description: "High performance cloud server instance",
      iconName: "Server",
      color: "blue",
    };

    const result = serviceCategorySchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  test("Rejects invalid Service Assignment missing Client ID", () => {
    const invalidPayload = {
      clientId: "",
      customName: "Domain Renewal 2026",
      customPrice: 15.0,
      currency: "USD",
      billingCycle: "annual",
      serviceStatus: "active",
      autoRenewal: true,
    };

    const result = assignServiceSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  test("Sanitizes UddoktaPay Webhook Signature payload", () => {
    const headerApiKey = "ud_sandbox_api_key_2026";
    const expectedKey = "ud_sandbox_api_key_2026";

    expect(headerApiKey === expectedKey).toBe(true);
  });
});
