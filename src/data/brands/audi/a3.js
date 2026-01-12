export const audiA3 = [
  {
    id: "audi-a3-2010",
    // Identificador ÚNICO do carro no jogo.
    // Nunca muda. Usado para:
    // - comparação de vitória
    // - keys de React
    // - evitar duplicações no banco
    // Formato recomendado: marca-modelo-versao-ano

    brand: "Audi",
    // Marca do carro (fabricante).
    // Ex: Audi, Volkswagen, BMW, Fiat

    model: "A3",
    // Linha ou nome principal do carro.
    // Ex: A3, Civic, Corolla, Gol
    // NÃO inclui versão nem motor.

    trim: "Base",
    // Versão / acabamento do modelo.
    // Usado para diferenciar variações do MESMO carro.
    // Exemplos:
    // - Civic: "LX", "EX", "Si", "Touring"
    // - Golf: "GTI", "TSI", "R-Line"
    // - Jetta: "Comfortline", "Highline", "GLI"
    // Se não houver versão relevante, pode ficar vazio.

    generationOrChassis: "8P",
    // Código de geração, chassi ou série do modelo.
    // Serve para diferenciar carros com o mesmo nome ao longo do tempo.
    // Exemplos:
    // - Audi A3: "8L", "8P", "8V"
    // - BMW Série 3: "E46", "E90", "F30"
    // - Gol: "G4", "G5", "G6"
    // Opcional, mas MUITO recomendado quando existir.

    bodyStyle: "hatch",
    // Tipo de carroceria.
    // Enum fixo no projeto:
    // "hatch", "sedan", "suv", "wagon", "coupe", "pickup", "van"
    // Importante para comparação no jogo.

    year: 2010,
    // Ano real do modelo (ano/modelo simplificado).
    // Usado para:
    // - comparação numérica (↑ ↓)
    // - busca
    // - diferenciação de gerações

    engine: {
      displacement: 1.8,
      // Cilindrada do motor em litros.
      // Ex: 1.0, 1.6, 2.0, 3.0

      cylinders: 4,
      // Número de cilindros do motor.
      // Ex: 3, 4, 6, 8

      valves: 16,
      // Total de válvulas do motor.
      // Ex: 8, 12, 16, 24
      // (sim, existem motores "no meio" tipo 12v)

      aspiration: "turbo",
      // Tipo de aspiração do motor.
      // Enum do projeto:
      // "aspirado", "turbo", "supercharged", "electric"
    },

    fuel: "gasolina",
    // Tipo de combustível.
    // Enum:
    // "flex", "gasolina", "diesel", "hybrid", "electric"

    traction: "fwd",
    // Tipo de tração.
    // Enum:
    // "fwd" (dianteira)
    // "rwd" (traseira)
    // "awd" (integral)

    transmission: "auto",
    // Tipo de câmbio.
    // Enum:
    // "manual", "auto", "cvt", "dct"
    // (DCT é importante pra carros esportivos)

    category: "luxo",
    // Classificação geral do carro dentro do jogo.
    // Enum do projeto:
    // "popular", "medio", "premium", "luxo", "esportivo"
    // Usado tanto pra gameplay quanto pra filtros futuros.

    brandOriginCountry: "Germany",
    // País de origem da MARCA (não do carro).
    // Ex:
    // Audi → Germany
    // Fiat → Italy
    // Toyota → Japan

    doors: 4,
    // Número de portas do veículo.
    // Importante para diferenciação (ex: hatch 2p vs 4p).
  },
];
