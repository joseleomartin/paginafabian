import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { splitAccent } from "../src/lib/hero-title.ts";

describe("splitAccent", () => {
  it("resalta una palabra en el medio del título", () => {
    assert.deepEqual(splitAccent("Claridad para dueños que deciden hoy", "deciden"), [
      { text: "Claridad para dueños que ", accent: false },
      { text: "deciden", accent: true },
      { text: " hoy", accent: false },
    ]);
  });

  it("no genera tramos vacíos cuando el acento está al final o al inicio", () => {
    assert.deepEqual(splitAccent("Hola, soy Fabián", "Fabián"), [
      { text: "Hola, soy ", accent: false },
      { text: "Fabián", accent: true },
    ]);
    assert.deepEqual(splitAccent("Fabián hola", "Fabián"), [
      { text: "Fabián", accent: true },
      { text: " hola", accent: false },
    ]);
  });

  it("devuelve el título completo si no hay acento o no se encuentra", () => {
    const whole = [{ text: "Off the Record", accent: false }];
    assert.deepEqual(splitAccent("Off the Record"), whole);
    assert.deepEqual(splitAccent("Off the Record", ""), whole);
    assert.deepEqual(splitAccent("Off the Record", "Newsletter"), whole);
  });

  it("resalta toda una frase y solo la primera aparición", () => {
    assert.deepEqual(splitAccent("Lo último, de primera mano", "primera mano"), [
      { text: "Lo último, de ", accent: false },
      { text: "primera mano", accent: true },
    ]);
    const twice = splitAccent("más y más", "más");
    assert.equal(twice.filter((segment) => segment.accent).length, 1);
  });
});
