export const cars = [
  {
    id: "bmw-320i",
    brand: "BMW",
    model: "320i",

    type: "sedan", // sedan | hatch | suv | coupe | wagon
    doors: 4, // número
    engine: 2.0, // litros
    decade: 2010, // 2010 = 2010s
    valves: 16,
    aspiration: "turbo", // aspirated | turbo | supercharged | electric
    fuel: "flex", // gas | flex | diesel | hybrid | electric
    traction: "rwd", // fwd | rwd | awd
    transmission: "auto", // manual | auto | cvt
    priceRange: "200k+", // <50k | 50k-100k | 100k-200k | 200k+
  },
  {
    brand: "Honda",
    model: "Civic Si",
    type: "sedan",
    doors: 4,
    engine: 2.0,
    decade: 2010,
    valves: 16,
    aspiration: "aspirado",
    fuel: "gasolina",
    traction: "fwd",
    transmission: "manual",
    priceRange: "100k-150k",
  },
  {
    brand: "Volkswagen",
    model: "Golf GTI",
    type: "hatch",
    doors: 4,
    engine: 2.0,
    decade: 2010,
    valves: 16,
    aspiration: "turbo",
    fuel: "gasolina",
    traction: "fwd",
    transmission: "auto",
    priceRange: "150k-200k",
  },
];
