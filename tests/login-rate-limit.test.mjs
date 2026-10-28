import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRateLimiter } from "../src/lib/login-rate-limit.ts";

describe("createRateLimiter", () => {
  it("no bloquea antes de alcanzar el máximo", () => {
    const limiter = createRateLimiter(3, 1000);
    limiter.registerFailure("ip", 0);
    limiter.registerFailure("ip", 10);
    assert.equal(limiter.isBlocked("ip", 20), false);
  });

  it("bloquea al alcanzar el máximo de fallos", () => {
    const limiter = createRateLimiter(3, 1000);
    for (let i = 0; i < 3; i += 1) limiter.registerFailure("ip", i);
    assert.equal(limiter.isBlocked("ip", 10), true);
    assert.ok(limiter.retryAfterSeconds("ip", 10) > 0);
  });

  it("aísla las claves entre sí", () => {
    const limiter = createRateLimiter(1, 1000);
    limiter.registerFailure("a", 0);
    assert.equal(limiter.isBlocked("a", 1), true);
    assert.equal(limiter.isBlocked("b", 1), false);
  });

  it("se libera al vencer la ventana", () => {
    const limiter = createRateLimiter(1, 1000);
    limiter.registerFailure("ip", 0);
    assert.equal(limiter.isBlocked("ip", 999), true);
    assert.equal(limiter.isBlocked("ip", 1000), false);
    assert.equal(limiter.retryAfterSeconds("ip", 1000), 0);
  });

  it("reset limpia los fallos tras un login correcto", () => {
    const limiter = createRateLimiter(1, 1000);
    limiter.registerFailure("ip", 0);
    limiter.reset("ip");
    assert.equal(limiter.isBlocked("ip", 1), false);
  });
});
