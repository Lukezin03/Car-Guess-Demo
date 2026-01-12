// src/data/cars.js
// Coordinator: junta automaticamente todos os carros em src/data/brands/**

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectCarsFromModule(module) {
  // Aceita qualquer export que seja array: export const bmwX1 = [ ... ]
  const carsArrays = Object.values(module).filter(Array.isArray);
  return carsArrays.flat();
}

function validateCars(allCars) {
  const ids = new Set();
  const duplicates = new Set();

  for (const car of allCars) {
    if (!isPlainObject(car)) {
      console.warn("[cars] Item inválido (não é objeto):", car);
      continue;
    }

    if (!car.id) {
      console.warn("[cars] Carro sem id:", car);
      continue;
    }

    if (ids.has(car.id)) duplicates.add(car.id);
    ids.add(car.id);

    // validações mínimas (pra não quebrar teu App.jsx)
    const required = [
      "brand",
      "model",
      "bodyStyle",
      "year",
      "doors",
      "category",
    ];
    for (const key of required) {
      if (car[key] === undefined || car[key] === null || car[key] === "") {
        console.warn(
          `[cars] Carro ${car.id} com campo obrigatório faltando: ${key}`
        );
      }
    }

    if (!car.engine || !isPlainObject(car.engine)) {
      console.warn(`[cars] Carro ${car.id} sem engine (objeto)`);
    }
  }

  if (duplicates.size > 0) {
    console.warn("[cars] IDs duplicados encontrados:", Array.from(duplicates));
  }
}

// IMPORTA TUDO que estiver em ./brands/**.js (Vite)
// eager: já carrega no build/dev sem precisar async/await
const modules = import.meta.glob("./brands/**/*.js", { eager: true });

const collected = Object.values(modules).flatMap((mod) =>
  collectCarsFromModule(mod)
);

// Opcional: congela para evitar mutação acidental
export const cars = Object.freeze(collected);

validateCars(collected);
