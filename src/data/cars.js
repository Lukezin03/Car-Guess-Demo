// src/data/cars.js
// Coordinator: junta automaticamente todos os carros em src/data/brands/**

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
    "dianteira": "fwd",
    "traseira": "rwd",
    "integral": "awd",
    "4x4": "awd"
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
  
  return {
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
  };
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

function collectCarsFromModule(module, filePath = "") {
  // JSON pode vir com ou sem .default
  const data = module.default || module;
  
  // Se é array (formato antigo)
  if (Array.isArray(data)) {
    return data;
  }
  
  // Se é objeto único com campos em português (formato BMW)
  if (isPlainObject(data) && data["Marca"]) {
    const transformed = transformSimplifiedFormat(data, filePath);
    return transformed ? [transformed] : [];
  }
  
  // Se é objeto com arrays exportados (fallback)
  const carsArrays = Object.values(data).filter(Array.isArray);
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

// IMPORTA TUDO que estiver em ./brands/**.json (Vite)
// eager: já carrega no build/dev sem precisar async/await
const modules = import.meta.glob("./brands/**/*.json", { eager: true });

const collected = Object.entries(modules).flatMap(([filePath, mod]) => {
  return collectCarsFromModule(mod, filePath);
});

// Opcional: congela para evitar mutação acidental
export const cars = Object.freeze(collected);

validateCars(collected);
