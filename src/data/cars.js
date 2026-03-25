// src/data/cars.js
// Coordinator: junta automaticamente todos os carros em src/data/brands/**

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeOptionalString(value) {
  if (typeof value !== "string") return value ?? null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function normalizeNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null;

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function translateTraction(traction) {
  const normalized = normalizeOptionalString(traction)?.toLowerCase();

  const tractionMap = {
    fwd: "dianteira",
    rwd: "traseira",
    awd: "integral",
    "4wd": "4x4",
    "4x4": "4x4",
  };

  return normalized ? tractionMap[normalized] || normalized : null;
}

// Mapeia o formato simplificado (BMW) para o formato esperado pelo App
function transformSimplifiedFormat(data, filePath) {
  // Extrai informações do caminho: brands/bmw/320i/2026/gp-2.0.json
  const pathParts = filePath.split("/");
  const brandIndex = pathParts.findIndex((p) => p === "brands") + 1;
  
  if (brandIndex === 0) return null;
  
  const brand = pathParts[brandIndex];
  const model = pathParts[brandIndex + 1];
  const year = pathParts[brandIndex + 2];
  const fileName = pathParts[pathParts.length - 1].replace(/\.json$/, "");
  
  // Gera ID único
  const id = `${brand.toLowerCase()}-${model.toLowerCase()}-${fileName}-${year}`.replace(/\s+/g, "-");
  
  // Mapeia campos
  const transmission = data["Câmbio"]?.toLowerCase().includes("auto") ? "auto" : "manual";
  const aspiration = data["Aspiração"]?.toLowerCase().includes("turbo") ? "turbo" : "aspirado";
  
  const tractionMap = {
    dianteira: "fwd",
    traseira: "rwd",
    integral: "awd",
    "4x4": "4wd",
  };

  const traction = tractionMap[data["Tração"]?.toLowerCase()] || data["Tração"]?.toLowerCase() || "fwd";
  
  const fuelMap = {
    "flex": "flex",
    "gasolina": "gasolina",
    "diesel": "diesel",
    "eletrico": "elétrico",
    "hibrido": "híbrido"
  };
  
  const fuel = fuelMap[data["Combustível"]?.toLowerCase()] || "flex";
  
  return normalizeLegacyCar({
    id,
    brand: data["Marca"] || brand,
    model: model,
    trim: fileName.replace(/-/g, " ").toUpperCase(),
    generationOrChassis: "",
    bodyStyle: data["Tipo"] || "sedan",
    year: parseInt(data["Ano"]) || parseInt(year),
    engine: {
    displacement: data["Motor"] ?? "0.0",
      cylinders: 4, // padrão
      valves: parseInt(data["Válvulas"]) || 16,
      aspiration: aspiration,
    },
    fuel: fuel,
    traction: traction,
    transmission: transmission,
    category: data["Categoria"] || "médio",
    brandOriginCountry: getBrandCountry(data["Marca"] || brand),
    doors: parseInt(data["Portas"]) || 4,
  });
}

function getBrandCountry(brand) {
  const countryMap = {
    "BMW": "Germany",
    "Mercedes": "Germany",
    "Audi": "Germany",
    "Volkswagen": "Germany",
    "Honda": "Japan",
    "Toyota": "Japan",
    "Nissan": "Japan",
    "Chevrolet": "USA",
    "Ford": "USA",
    "Jeep": "USA",
    "Fiat": "Italy",
    "Renault": "France",
    "Hyundai": "South Korea",
  };
  return countryMap[brand] || "Unknown";
}

function normalizeLegacyCar(car) {
  const engine = isPlainObject(car.engine) ? car.engine : {};
  const tractionCode = normalizeOptionalString(car.traction);

  return {
    id: normalizeOptionalString(car.id),
    brand: normalizeOptionalString(car.brand),
    model: normalizeOptionalString(car.model),
    trim: normalizeOptionalString(car.trim),
    generationOrChassis: normalizeOptionalString(car.generationOrChassis),
    bodyStyle: normalizeOptionalString(car.bodyStyle),
    year: normalizeNumber(car.year),
    engine: {
      code: normalizeOptionalString(engine.code ?? engine.engineCode),
      displacement: normalizeNumber(engine.displacement),
      cylinders: normalizeNumber(engine.cylinders),
      valves: normalizeNumber(engine.valves),
      aspiration: normalizeOptionalString(engine.aspiration),
    },
    fuel: normalizeOptionalString(car.fuel),
    tractionCode,
    traction: translateTraction(tractionCode),
    transmission: normalizeOptionalString(car.transmission),
    category: normalizeOptionalString(car.category),
    brandOriginCountry: normalizeOptionalString(car.brandOriginCountry),
    doors: normalizeNumber(car.doors),
    isLegend: car.isLegend === true,
    isClassic: car.isClassic === true,
  };
}

function transformNewSchemaCar(car) {
  const structure = isPlainObject(car.structure) ? car.structure : {};
  const body = isPlainObject(car.body) ? car.body : {};
  const engine = isPlainObject(car.engine) ? car.engine : {};
  const transmission = isPlainObject(car.transmission) ? car.transmission : {};
  const drivetrain = isPlainObject(car.drivetrain) ? car.drivetrain : {};
  const origin = isPlainObject(car.origin) ? car.origin : {};
  const classification = isPlainObject(car.classification)
    ? car.classification
    : {};

  return normalizeLegacyCar({
    id: car.id,
    brand: car.brand,
    model: car.model,
    trim: car.trim,
    generationOrChassis:
      normalizeOptionalString(structure.generation) ??
      normalizeOptionalString(structure.chassisCode),
    bodyStyle: body.style,
    year: car.year,
    engine: {
      code: engine.code,
      displacement: engine.displacement,
      cylinders: engine.cylinders,
      valves: engine.valves,
      aspiration: engine.aspiration,
    },
    fuel: car.fuel,
    traction: drivetrain.traction,
    transmission: transmission.type,
    category: classification.category,
    brandOriginCountry: origin.brand_country,
    doors: body.doors,
    isLegend: classification.isLegend === true,
    isClassic: classification.isClassic === true,
  });
}

function normalizeCarRecord(car) {
  if (!isPlainObject(car)) return car;

  return "structure" in car ||
    "body" in car ||
    "drivetrain" in car ||
    "classification" in car
    ? transformNewSchemaCar(car)
    : normalizeLegacyCar(car);
}

function collectCarsFromModule(module, filePath = "") {
  // JSON pode vir com ou sem .default
  const data = module.default || module;

  // Se é array (formato antigo)
  if (Array.isArray(data)) {
    return data.map(normalizeCarRecord);
  }

  // Se é objeto único com campos em português (formato BMW)
  if (isPlainObject(data) && data["Marca"]) {
    const transformed = transformSimplifiedFormat(data, filePath);
    return transformed ? [transformed] : [];
  }

  if (isPlainObject(data) && data.id) {
    return [normalizeCarRecord(data)];
  }

  // Se é objeto com arrays exportados (fallback)
  const carsArrays = Object.values(data).filter(Array.isArray);
  return carsArrays.flat().map(normalizeCarRecord);
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

// IMPORTA TUDO que estiver em ./brands/**.json (Vite)
// eager: já carrega no build/dev sem precisar async/await
const modules = import.meta.glob("./brands/**/*.json", { eager: true });

const collected = Object.entries(modules).flatMap(([filePath, mod]) => {
  return collectCarsFromModule(mod, filePath);
});

// Opcional: congela para evitar mutação acidental
export const cars = Object.freeze(collected);

validateCars(collected);
