import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  countByVisibility,
  filterAdminItems,
  hostLabel,
  normalizeSearch,
  takePage,
} from "../src/lib/admin-list.ts";

const accessors = {
  searchText: (item) => `${item.title} ${item.summary}`,
  isPublished: (item) => item.published,
};

const items = [
  { title: "#30. Stock es tiempo", summary: "Servicios y capital", published: true },
  { title: "#29. Capital de trabajo", summary: "Pagar deudas", published: true },
  { title: "Edición especial", summary: "Venta de empresa", published: false },
];

describe("normalizeSearch", () => {
  it("ignora mayúsculas y acentos", () => {
    assert.equal(normalizeSearch("Edición ÁÉÍ"), "edicion aei");
  });
});

describe("filterAdminItems", () => {
  const filter = (criteria) => filterAdminItems(items, criteria, accessors);

  it("sin criterios devuelve todo", () => {
    assert.equal(filter({ query: "", visibility: "all" }).length, 3);
    assert.equal(filter({ query: "   ", visibility: "all" }).length, 3);
  });

  it("busca sin distinguir acentos ni mayúsculas", () => {
    const result = filter({ query: "EDICION", visibility: "all" });
    assert.deepEqual(result.map((item) => item.title), ["Edición especial"]);
  });

  it("exige que estén todos los términos, en cualquier orden", () => {
    assert.equal(filter({ query: "capital trabajo", visibility: "all" }).length, 1);
    assert.equal(filter({ query: "capital venta", visibility: "all" }).length, 0);
  });

  it("filtra por visibilidad", () => {
    assert.equal(filter({ query: "", visibility: "visible" }).length, 2);
    const hidden = filter({ query: "", visibility: "hidden" });
    assert.deepEqual(hidden.map((item) => item.title), ["Edición especial"]);
  });

  it("combina búsqueda y visibilidad", () => {
    assert.equal(filter({ query: "capital", visibility: "hidden" }).length, 0);
    assert.equal(filter({ query: "capital", visibility: "visible" }).length, 2);
  });

  it("no modifica la lista original", () => {
    filter({ query: "capital", visibility: "visible" });
    assert.equal(items.length, 3);
  });
});

describe("countByVisibility", () => {
  it("cuenta visibles y ocultos", () => {
    assert.deepEqual(countByVisibility(items, accessors.isPublished), {
      all: 3,
      visible: 2,
      hidden: 1,
    });
  });

  it("maneja la lista vacía", () => {
    assert.deepEqual(countByVisibility([], accessors.isPublished), {
      all: 0,
      visible: 0,
      hidden: 0,
    });
  });
});

describe("takePage", () => {
  const numbers = [1, 2, 3, 4, 5];

  it("devuelve el tramo pedido y cuántos faltan", () => {
    assert.deepEqual(takePage(numbers, 2), { shown: [1, 2], remaining: 3 });
  });

  it("no pasa del total", () => {
    assert.deepEqual(takePage(numbers, 50), { shown: numbers, remaining: 0 });
  });

  it("tolera límites inválidos", () => {
    assert.deepEqual(takePage(numbers, -3), { shown: [], remaining: 5 });
    assert.deepEqual(takePage(numbers, 2.9), { shown: [1, 2], remaining: 3 });
  });
});

describe("hostLabel", () => {
  it("devuelve el dominio sin www", () => {
    assert.equal(hostLabel("https://www.linkedin.com/pulse/30-x"), "linkedin.com");
    assert.equal(hostLabel("https://youtu.be/abc"), "youtu.be");
  });

  it("devuelve el texto original si no es una URL", () => {
    assert.equal(hostLabel("no es url"), "no es url");
  });
});
