/**
 * Base de Datos de Menú - Cafetería María Bonita
 * Datos estructurados y agrupados por subcategorías:
 * Huevos, Hamburguesas, Jugos, Cafés Calientes, Frappés, Crepas, Panadería, Postres y Combos.
 */

const MENU_CATEGORIES = [
  {
    "id": "todos",
    "name": "Todos los Platillos",
    "icon": "✨",
    "description": "Explora nuestra carta completa de cocina tradicional, desayunos de autor, hamburguesas, jugos y café de especialidad."
  },
  {
    "id": "huevos",
    "name": "Huevos al Gusto",
    "icon": "🍳",
    "description": "Preparados al momento con huevos de libre pastoreo, acompañados de frijoles refritos con totopos y tortillas hechas a mano."
  },
  {
    "id": "hamburguesas",
    "name": "Hamburguesas & Sandwiches",
    "icon": "🍔",
    "description": "Carne 100% de res al carbón, bollos brioche horneados al alba en casa y papas gajo crujientes sazonadas."
  },
  {
    "id": "jugos",
    "name": "Jugos & Bebidas Naturales",
    "icon": "🥤",
    "description": "Fruta fresca seleccionada exprimida al momento en extractor frío, sin azúcares añadidos ni conservadores."
  },
  {
    "id": "calientes",
    "name": "Café (Caliente)",
    "icon": "☕",
    "description": "Granos de altura 100% mexicanos de Coatepec y Pluma Hidalgo, recién molidos y calibrados a la perfección."
  },
  {
    "id": "frios",
    "name": "Bebidas Frías & Frappés",
    "icon": "🧊",
    "description": "Frappés cremosos de autor con ingredientes mexicanos, cold brew reposado por 18 horas e infusiones frutales."
  },
  {
    "id": "comidas",
    "name": "Crepas & Antojos Salados",
    "icon": "🥗",
    "description": "Crepas saladas doradas a la mantequilla, chilaquiles mestizos con arrachera, molletes y antojitos tradicionales."
  },
  {
    "id": "panaderia",
    "name": "Panadería Artesanal & Waffles",
    "icon": "🥐",
    "description": "Masa madre horneada diariamente al alba, pan dulce tradicional con nata montada, pan francés brioche y waffles belgas."
  },
  {
    "id": "postres",
    "name": "Postres & Dulce Tradición",
    "icon": "🍰",
    "description": "Recetas artesanales de la casa: pasteles ultra humectados, flan napolitano al caramelo, cheesecakes de frutos silvestres y crepas dulces."
  },
  {
    "id": "combos",
    "name": "Combos & Paquetes",
    "icon": "🎁",
    "description": "Combinaciones completas para desayunar y merendar con café incluido y precio especial."
  }
];

const MENU_ITEMS = [
  {
    "id": "huev-1",
    "category": "huevos",
    "name": "Huevos con Jamón de Pavo",
    "shortDescription": "Dos huevos revueltos con jamón de pavo selecto, frijoles refritos con totopos y tortillas hechas a mano.",
    "description": "Huevos frescos de rancho revueltos suavemente con generosa porción de jamón de pavo dorado en mantequilla. Acompañados de frijoles negros refritos con totopos al comal y salsa ranchera martajada.",
    "price": 85,
    "tags": [
      "Favorito",
      "Desayuno",
      "Huevos"
    ],
    "badge": "Favorito",
    "image": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    "calories": "340 kcal",
    "prepTime": "8 min",
    "customizable": true,
    "options": {
      "preparacion": [
        "Revueltos tiernos",
        "Revueltos bien cocidos",
        "Estrellados con yema tierna",
        "Estrellados volteados"
      ],
      "tortillas": [
        "Tortillas de Maíz al Comal",
        "Tortillas de Harina de Trigo",
        "Pan Tostado con Mantequilla"
      ],
      "frijoles": [
        "Frijoles Negros Refritos con Totopos",
        "Frijoles de la Olla con Epazote"
      ],
      "extras": [
        {
          "name": "Porción de aguacate hass fresco",
          "price": 18
        },
        {
          "name": "Queso fresco de rancho desmoronado",
          "price": 15
        },
        {
          "name": "Huevo extra en tu preparación",
          "price": 14
        }
      ]
    }
  },
  {
    "id": "huev-2",
    "category": "huevos",
    "name": "Huevos a la Mexicana",
    "shortDescription": "Revueltos con jitomate bola, cebolla morada y chile serrano fresco, servidos con frijoles de la olla.",
    "description": "El clásico matutino mexicano por excelencia. Salteado al momento de jitomate guaje maduro, cebolla y chile serrano con huevos de pastoreo. Sabor hogareño inconfundible con frijoles de la olla y tortillas calientes.",
    "price": 82,
    "tags": [
      "Tradicional",
      "Clásico",
      "Huevos"
    ],
    "badge": "Tradicional",
    "image": "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=800&q=80",
    "calories": "310 kcal",
    "prepTime": "8 min",
    "customizable": true,
    "options": {
      "picor": [
        "Picante suave (sin semillas)",
        "Picante regular (auténtico)",
        "Sin picante (solo jitomate y cebolla)",
        "Extra picante con habanero asado"
      ],
      "tortillas": [
        "Tortillas de Maíz al Comal",
        "Tortillas de Harina",
        "Bolillo Calientito"
      ],
      "extras": [
        {
          "name": "Queso panela asado a la plancha",
          "price": 20
        },
        {
          "name": "Crema ácida de rancho",
          "price": 10
        }
      ]
    }
  },
  {
    "id": "huev-3",
    "category": "huevos",
    "name": "Huevos con Chorizo Artesanal",
    "shortDescription": "Huevos revueltos con chorizo de cerdo adobado a la leña, aguacate y queso fresco de Michoacán.",
    "description": "Chorizo artesanal elaborado con especias y chiles secos, doradito al sartén y mezclado con huevos frescos. Servido con rebanadas de aguacate hass, frijoles refritos y queso cotija espolvoreado.",
    "price": 89,
    "tags": [
      "Favorito",
      "Especial",
      "Huevos"
    ],
    "badge": "Favorito",
    "image": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80",
    "calories": "420 kcal",
    "prepTime": "9 min",
    "customizable": true,
    "options": {
      "preparacion": [
        "Revueltos suaves",
        "Bien doraditos"
      ],
      "tortillas": [
        "Tortillas de Maíz Nixtamalizado",
        "Tortillas de Harina Norteñas"
      ],
      "extras": [
        {
          "name": "Chicharrón prensado guisado extra",
          "price": 24
        },
        {
          "name": "Guacamole adicional",
          "price": 22
        }
      ]
    }
  },
  {
    "id": "huev-4",
    "category": "huevos",
    "name": "Huevos Rancheros Tradicionales",
    "shortDescription": "Dos huevos estrellados sobre tortillas al comal, bañados en salsa ranchera tatemada con queso cotija.",
    "description": "Huevos estrellados con yema dorada sobre dos tortillas pasadas ligeramente por aceite vegetal, cubiertos con salsa de jitomate tatemado al comal con cilantro fresco y queso seco artesanal.",
    "price": 88,
    "tags": [
      "Recomendado",
      "Clásico",
      "Huevos"
    ],
    "badge": "Recomendado",
    "image": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
    "calories": "360 kcal",
    "prepTime": "9 min",
    "customizable": true,
    "options": {
      "yema": [
        "Término tierno (líquida para sopear)",
        "Término medio",
        "Bien cocida"
      ],
      "salsa": [
        "Salsa Ranchera Roja Tatemada",
        "Salsa Verde de Tomatillo Asado"
      ],
      "extras": [
        {
          "name": "Arrachera marinada a la plancha (80g)",
          "price": 45
        },
        {
          "name": "Aguacate en abanico",
          "price": 18
        }
      ]
    }
  },
  {
    "id": "huev-5",
    "category": "huevos",
    "name": "Huevos Divorciados Doña María",
    "shortDescription": "Un huevo en salsa verde de tomatillo asado y otro en salsa roja morita, divididos por frijoles refritos.",
    "description": "La armonía de dos salsas insignias. Dos huevos estrellados montados sobre tortillas al comal, separados por un camellón de frijoles refritos con queso fresco y totopos crujientes.",
    "price": 92,
    "tags": [
      "Favorito",
      "Insignia",
      "Huevos"
    ],
    "badge": "Favorito",
    "image": "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=800&q=80",
    "calories": "380 kcal",
    "prepTime": "10 min",
    "customizable": true,
    "options": {
      "yema": [
        "Término tierno",
        "Bien cocidos"
      ],
      "tortillas": [
        "Tortillas de Maíz",
        "Tortillas de Harina"
      ],
      "extras": [
        {
          "name": "Chicharrón de cerdo crujiente",
          "price": 20
        },
        {
          "name": "Crema de rancho",
          "price": 10
        }
      ]
    }
  },
  {
    "id": "huev-6",
    "category": "huevos",
    "name": "Omelette Campestre con Espinacas",
    "shortDescription": "Esponjoso omelette relleno de espinacas baby, champiñones al ajillo y queso Oaxaca derretido.",
    "description": "Tres huevos batidos a punto esponjoso, rellenos de champiñones salteados al ajillo, hojas frescas de espinaca baby y queso Oaxaca en hebra fundido. Acompañado de ensalada mixta y tostadas horneadas.",
    "price": 95,
    "tags": [
      "Saludable",
      "Gourmet",
      "Huevos"
    ],
    "badge": "Saludable",
    "image": "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80",
    "calories": "290 kcal",
    "prepTime": "10 min",
    "customizable": true,
    "options": {
      "preparacion": [
        "Con huevos enteros",
        "Solo claras de huevo (+ $15)"
      ],
      "queso": [
        "Queso Oaxaca Fundido",
        "Queso Panela Light",
        "Queso de Cabra Cremoso (+ $16)"
      ],
      "extras": [
        {
          "name": "Pechuga de pavo picada en cubos",
          "price": 18
        },
        {
          "name": "Aguacate hass fresco",
          "price": 18
        }
      ]
    }
  },
  {
    "id": "hamb-1",
    "category": "hamburguesas",
    "name": "Hamburguesa Hawaiana María Bonita",
    "shortDescription": "180g de carne de res al carbón, piña miel asada con mantequilla, jamón Virginia, queso manchego fundido y salsa BBQ dulce.",
    "description": "Nuestra consentida dulce y salada. Medallón artesanal de 180g de carne de res premium a las brasas, piña miel tatemada con mantequilla clarificada, jamón Virginia dorado, queso manchego gratinado y bollo brioche recién horneado con ajonjolí negro. Acompañada de papas gajo sazonadas.",
    "price": 125,
    "tags": [
      "Favorito",
      "Hamburguesa",
      "Más Pedido"
    ],
    "badge": "Favorito",
    "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    "calories": "680 kcal",
    "prepTime": "14 min",
    "customizable": true,
    "options": {
      "terminoCarne": [
        "Término Medio",
        "Tres Cuartos",
        "Bien Cocida"
      ],
      "papas": [
        "Papas Gajo a las Finas Hierbas",
        "Papas a la Francesa Clásicas",
        "Ensalada Verde de la Casa"
      ],
      "aderezos": [
        "Mayonesa Chipotle de la Casa",
        "Salsa BBQ Ahumada",
        "Aderezo Ranch",
        "Sin Aderezo"
      ],
      "extras": [
        {
          "name": "Tocino ahumado crujiente (2 tiras)",
          "price": 20
        },
        {
          "name": "Carne extra de res (180g)",
          "price": 45
        },
        {
          "name": "Guacamole artesanal",
          "price": 22
        }
      ]
    }
  },
  {
    "id": "hamb-2",
    "category": "hamburguesas",
    "name": "Hamburguesa Mexicana con Guacamole",
    "shortDescription": "180g de arrachera molida, guacamole fresco con pico de gallo, chiles toreados, queso Oaxaca gratinado y aderezo chipotle.",
    "description": "Sabor 100% patrio. Jugosa carne de arrachera molida sazonada con pimienta negra y ajo, costra de queso Oaxaca fundido al carbón, guacamole preparado al momento con cilantro y limón, rodajas de jalapeño toreado y aderezo chipotle en bollo artesanal.",
    "price": 135,
    "tags": [
      "Insignia",
      "Hamburguesa",
      "Gourmet"
    ],
    "badge": "Insignia",
    "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
    "calories": "720 kcal",
    "prepTime": "15 min",
    "customizable": true,
    "options": {
      "picante": [
        "Con chiles toreados suaves",
        "Bien toreados y picosos",
        "Sin chiles toreados"
      ],
      "papas": [
        "Papas Gajo con paprika y sal de mar",
        "Papas a la Francesa"
      ],
      "extras": [
        {
          "name": "Doble porción de queso Oaxaca",
          "price": 18
        },
        {
          "name": "Aros de cebolla crujientes",
          "price": 25
        }
      ]
    }
  },
  {
    "id": "hamb-3",
    "category": "hamburguesas",
    "name": "Hamburguesa Clásica con Tocino & Cheddar",
    "shortDescription": "Jugosa carne de res Angus, tocino ahumado crujiente, queso cheddar madurado, lechuga romana, tomate bola y papas gajo.",
    "description": "La hamburguesa perfecta para los amantes del sabor clásico americano con nuestro toque artesanal. Carne Angus certificada, queso cheddar fundido que escurre por el pan, tocino de manzano crujiente y vegetales frescos del día.",
    "price": 120,
    "tags": [
      "Clásico",
      "Hamburguesa",
      "Favorito"
    ],
    "badge": "Favorito",
    "image": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80",
    "calories": "650 kcal",
    "prepTime": "12 min",
    "customizable": true,
    "options": {
      "terminoCarne": [
        "Término Medio",
        "Tres Cuartos",
        "Bien Cocida"
      ],
      "extras": [
        {
          "name": "Queso cheddar extra fundido",
          "price": 16
        },
        {
          "name": "Huevo estrellado arriba",
          "price": 15
        },
        {
          "name": "Cebolla caramelizada al vino tinto",
          "price": 14
        }
      ]
    }
  },
  {
    "id": "hamb-4",
    "category": "hamburguesas",
    "name": "Club Sandwich Tradicional en Pan Brioche",
    "shortDescription": "Triple piso de pan brioche tostado con pechuga de pavo ahumada, tocino crujiente, queso manchego, huevo cocido y papas.",
    "description": "Un ícono de la cafetería. Tres rebanadas de pan brioche artesanal dorado a la plancha, pechuga de pavo ahumada, tocino doradito, queso manchego derretido, huevo duro, lechuga fresca y tomate, servido con mayonesa de hierbas finas y papas.",
    "price": 115,
    "tags": [
      "Favorito",
      "Sandwich",
      "Clásico"
    ],
    "badge": "Favorito",
    "image": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    "calories": "580 kcal",
    "prepTime": "12 min",
    "customizable": true,
    "options": {
      "pan": [
        "Pan Brioche Artesanal",
        "Pan Integral de Grano Entero"
      ],
      "acompanamiento": [
        "Papas a la Francesa",
        "Papas Gajo",
        "Ensalada Mixta"
      ],
      "extras": [
        {
          "name": "Rebanadas de aguacate fresco",
          "price": 18
        },
        {
          "name": "Doble tocino crujiente",
          "price": 20
        }
      ]
    }
  },
  {
    "id": "hamb-5",
    "category": "hamburguesas",
    "name": "Hamburguesa Portobello al Balsámico",
    "shortDescription": "Hongo portobello asado a las finas hierbas con queso de cabra, cebolla morada caramelizada y reducción balsámica.",
    "description": "Para quienes buscan una experiencia vegetariana gourmet inolvidable. Sombrero de hongo portobello marinado en aceite de oliva y romero, asado a la parrilla, coronado con medallón de queso de cabra tibio, arúgula y cebolla caramelizada.",
    "price": 110,
    "tags": [
      "Vegetariano",
      "Saludable",
      "Gourmet"
    ],
    "badge": "Vegetariano",
    "image": "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80",
    "calories": "420 kcal",
    "prepTime": "12 min",
    "customizable": true,
    "options": {
      "queso": [
        "Queso de Cabra Cremoso",
        "Queso Panela Asado",
        "Sin Queso (100% Vegana)"
      ],
      "extras": [
        {
          "name": "Pimientos morrones asados",
          "price": 15
        },
        {
          "name": "Guacamole fresco",
          "price": 20
        }
      ]
    }
  },
  {
    "id": "jug-1",
    "category": "jugos",
    "name": "Jugo de Naranja 100% Natural",
    "shortDescription": "Exprimido al momento con naranjas dulces seleccionadas de huerto mexicano (500ml).",
    "description": "Pura vitamina C directa del árbol a tu vaso. Exprimido en frío al momento de tu orden con naranjas valencianas jugosas y dulces. Sin diluir, sin conservadores y sin azúcar añadida.",
    "price": 45,
    "tags": [
      "Favorito",
      "Natural",
      "Jugo"
    ],
    "badge": "Favorito",
    "image": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
    "calories": "160 kcal",
    "prepTime": "3 min",
    "customizable": true,
    "options": {
      "temperatura": [
        "Frío natural con hielo",
        "Sin hielo (temperatura ambiente)"
      ],
      "pulpa": [
        "Con pulpa natural",
        "Colado (sin pulpa)"
      ],
      "tamano": [
        {
          "label": "Vaso Regular (500ml)",
          "extraPrice": 0
        },
        {
          "label": "Jarra Personal (750ml)",
          "extraPrice": 20
        }
      ]
    }
  },
  {
    "id": "jug-2",
    "category": "jugos",
    "name": "Jugo de Toronja Fresca Exprimida",
    "shortDescription": "Exprimido al instante, refrescante, astringente y cargado de vitamina C natural (500ml).",
    "description": "Toronjas rojas recién cortadas exprimidas frente a ti. Sabor cítrico vivaz, ligeramente amargo y sumamente refrescante, ideal para despertar el metabolismo por la mañana.",
    "price": 45,
    "tags": [
      "Natural",
      "Saludable",
      "Jugo"
    ],
    "badge": "Natural",
    "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    "calories": "130 kcal",
    "prepTime": "3 min",
    "customizable": true,
    "options": {
      "endulzante": [
        "Sin endulzar (100% natural)",
        "Con toque de miel de abeja (+ $8)",
        "Con azúcar mascabado (+ $5)"
      ],
      "temperatura": [
        "Frío con hielo",
        "Sin hielo"
      ]
    }
  },
  {
    "id": "jug-3",
    "category": "jugos",
    "name": "Jugo Verde Detox (Nopal, Piña & Apio)",
    "shortDescription": "Nopal tierno, piña miel, apio criollo, perejil fresco y jugo de naranja recién exprimido.",
    "description": "La combinación matutina desintoxicante favorita de nuestros comensales. Licuado al momento con fibra viva de nopal tierno, piña miel digestiva, apio y base de jugo de naranja natural.",
    "price": 52,
    "tags": [
      "Saludable",
      "Detox",
      "Jugo"
    ],
    "badge": "Saludable",
    "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    "calories": "145 kcal",
    "prepTime": "4 min",
    "customizable": true,
    "options": {
      "base": [
        "Base de Jugo de Naranja Natural",
        "Base de Agua de Coco (+ $12)",
        "Base de Toronja"
      ],
      "extras": [
        {
          "name": "Shot de jengibre fresco",
          "price": 10
        },
        {
          "name": "Semillas de chía orgánica",
          "price": 8
        },
        {
          "name": "Espirulina en polvo",
          "price": 12
        }
      ]
    }
  },
  {
    "id": "jug-4",
    "category": "jugos",
    "name": "Jugo Zanahoria & Naranja Antioxidante",
    "shortDescription": "Extractor en frío con zanahoria dulce y naranja fresca, potente fuente de betacarotenos.",
    "description": "Extracción en frío de zanahorias tiernas y frescas combinadas con zumo de naranja. Color naranja vibrante, dulzor natural sin azúcar agregada y textura sedosa que nutre tu día.",
    "price": 48,
    "tags": [
      "Natural",
      "Antioxidante",
      "Jugo"
    ],
    "badge": "Natural",
    "image": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80",
    "calories": "155 kcal",
    "prepTime": "4 min",
    "customizable": true,
    "options": {
      "adicional": [
        "Solo Zanahoria y Naranja",
        "Con toque de betabel (+ $6)",
        "Con toque de jengibre (+ $8)"
      ]
    }
  },
  {
    "id": "jug-5",
    "category": "jugos",
    "name": "Licuado de Fresa, Plátano & Avena",
    "shortDescription": "Fresas frescas, plátano maduro, avena tostada y leche entera o deslactosada con toque de miel.",
    "description": "Un licuado cremoso, saciante y nutritivo preparado con fruta fresca, copos de avena integral remojados y leche fresca con un hilo de miel virgen de azahar.",
    "price": 50,
    "tags": [
      "Favorito",
      "Energético",
      "Licuado"
    ],
    "badge": "Favorito",
    "image": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80",
    "calories": "280 kcal",
    "prepTime": "4 min",
    "customizable": true,
    "options": {
      "leche": [
        "Leche Entera",
        "Leche Deslactosada",
        "Leche de Almendra (+ $12)",
        "Leche de Avena (+ $14)"
      ],
      "extras": [
        {
          "name": "Cucharada de crema de cacahuate",
          "price": 12
        },
        {
          "name": "Scoop de proteína de vainilla",
          "price": 25
        },
        {
          "name": "Semillas de chía",
          "price": 8
        }
      ]
    }
  },
  {
    "id": "cal-capuchino",
    "category": "calientes",
    "name": "Capuchino",
    "shortDescription": "Café Capuchino, con leche espumada. (10 oz)",
    "description": "Café Capuchino clásico preparado con espresso doble de altura y cremosa leche texturizada espumada con lluvia de cacao artesanal.",
    "price": 55,
    "tags": [
      "Favorito",
      "Café",
      "Más Pedido"
    ],
    "badge": "Favorito",
    "image": "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80",
    "calories": "150 kcal",
    "prepTime": "4 min",
    "customizable": true,
    "options": {
      "tamano": [
        {
          "label": "Taza Clásica (10 oz)",
          "extraPrice": 0
        },
        {
          "label": "Taza Grande (14 oz)",
          "extraPrice": 15
        }
      ],
      "leche": [
        "Leche Entera",
        "Leche Deslactosada",
        "Leche de Almendras (+ $12)",
        "Leche de Avena (+ $14)"
      ],
      "extras": [
        {
          "name": "Canela y cacao espolvoreado extra",
          "price": 0
        },
        {
          "name": "Shot de espresso adicional",
          "price": 15
        },
        {
          "name": "Espiral de cajeta o caramelo",
          "price": 10
        }
      ]
    }
  },
  {
    "id": "cal-latte",
    "category": "calientes",
    "name": "Latte Caliente",
    "shortDescription": "Café preparado con leche. Pídelo con tu sabor favorito. (10 oz)",
    "description": "Café preparado con leche suave y sedosa. Delicada base de espresso balanceado con microespuma de leche al vapor. Pídelo con tu sabor favorito.",
    "price": 55,
    "tags": [
      "Favorito",
      "Café",
      "Suave"
    ],
    "badge": "Favorito",
    "image": "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80",
    "calories": "170 kcal",
    "prepTime": "4 min",
    "customizable": true,
    "options": {
      "tamano": [
        {
          "label": "Mediano (10 oz)",
          "extraPrice": 0
        },
        {
          "label": "Grande (14 oz)",
          "extraPrice": 15
        }
      ],
      "leche": [
        "Leche Entera",
        "Leche Deslactosada",
        "Leche de Almendras (+ $12)",
        "Leche de Avena (+ $14)"
      ],
      "extras": [
        {
          "name": "Jarabe de Vainilla natural de Papantla",
          "price": 10
        },
        {
          "name": "Jarabe de Caramelo artesanal",
          "price": 10
        },
        {
          "name": "Jarabe de Avellana tostada",
          "price": 10
        }
      ]
    }
  },
  {
    "id": "cal-moka",
    "category": "calientes",
    "name": "Café Moka Caliente",
    "shortDescription": "Café con un toque de chocolate 10 oz",
    "description": "Exquisita combinación de espresso de altura, chocolate artesanal semiamargo y leche vaporizada aterciopelada con arte latte.",
    "price": 60,
    "tags": [
      "Favorito",
      "Chocolate",
      "Dulce"
    ],
    "badge": "Favorito",
    "image": "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=800&q=80",
    "calories": "220 kcal",
    "prepTime": "5 min",
    "customizable": true,
    "options": {
      "tamano": [
        {
          "label": "Taza Regular (10 oz)",
          "extraPrice": 0
        },
        {
          "label": "Taza Grande (14 oz)",
          "extraPrice": 15
        }
      ],
      "leche": [
        "Leche Entera",
        "Leche Deslactosada",
        "Leche de Almendras (+ $12)",
        "Leche de Avena (+ $14)"
      ],
      "extras": [
        {
          "name": "Crema batida artesanal",
          "price": 10
        },
        {
          "name": "Virutas de chocolate amargo",
          "price": 8
        },
        {
          "name": "Shot adicional de espresso",
          "price": 15
        }
      ]
    }
  },
  {
    "id": "cal-1",
    "category": "calientes",
    "name": "Café de Olla Tradicional Doña María",
    "shortDescription": "Infusionado en barro con piloncillo de caña virgen, canela en raja de Ceilán y un sutil toque de clavo y naranja.",
    "description": "Nuestra receta insignia heredada por tres generaciones. Café arábigo de Coatepec, Veracruz, infusionado lentamente en olla de barro curada. El balance perfecto entre el dulzor acaramelado del piloncillo natural y el perfume de la canela de Ceilán tostada al comal.",
    "price": 52,
    "tags": [
      "Estrella de la Casa",
      "Más Pedido",
      "Tradicional"
    ],
    "badge": "Insignia",
    "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    "calories": "110 kcal",
    "prepTime": "4 min",
    "customizable": true,
    "options": {
      "tamano": [
        {
          "label": "Taza Artesanal (350ml)",
          "extraPrice": 0
        },
        {
          "label": "Jarra Grande (500ml)",
          "extraPrice": 18
        }
      ],
      "leche": [
        "Negro Tradicional",
        "Un toque de leche entera",
        "Leche deslactosada"
      ],
      "extras": [
        {
          "name": "Shot de espresso extra",
          "price": 18
        },
        {
          "name": "Piquete de licor de café de la casa",
          "price": 32
        }
      ]
    }
  },
  {
    "id": "cal-4",
    "category": "calientes",
    "name": "Espresso Doble Pluma Hidalgo",
    "shortDescription": "Extracción calibrada a 9 bares de granos de Oaxaca; notas a chocolate amargo, avellana y acidez brillante.",
    "description": "Para los auténticos devotos del café puro. Origen: Pluma Hidalgo, Oaxaca (1,450 msnm). Varietal Typica y Bourbon lavado recién molido.",
    "price": 46,
    "tags": [
      "Especialidad",
      "Intenso",
      "Puro"
    ],
    "badge": "100% Arábiga",
    "image": "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80",
    "calories": "5 kcal",
    "prepTime": "3 min",
    "customizable": true,
    "options": {
      "tamano": [
        {
          "label": "Espresso Doble (60ml)",
          "extraPrice": 0
        },
        {
          "label": "Americano Doble (300ml)",
          "extraPrice": 6
        }
      ]
    }
  },
  {
    "id": "cal-5",
    "category": "calientes",
    "name": "Chocolate de Metate Tradicional Oaxaqueño",
    "shortDescription": "Elaborado con cacao criollo molido a mano en metate, canela y almendra tostada batido con molinillo de madera.",
    "description": "Espesa y reconfortante bebida prehispánica. Mezcla de cacao puro criollo tostado en comal y molido con canela y almendras, batido con molinillo de madera hasta obtener una corona de espuma densa.",
    "price": 68,
    "tags": [
      "Tradicional",
      "Sin Cafeína",
      "Favorito"
    ],
    "badge": "Oaxaqueño",
    "image": "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=800&q=80",
    "calories": "280 kcal",
    "prepTime": "5 min",
    "customizable": true,
    "options": {
      "base": [
        "En Leche Entera Espumosa",
        "En Agua (Receta Tradicional Ligera)",
        "En Leche Deslactosada"
      ],
      "extras": [
        {
          "name": "Bombones miniatura flameados",
          "price": 12
        },
        {
          "name": "Espolvoreado de chile ancho dulce",
          "price": 8
        }
      ]
    }
  },
  {
    "id": "frio-1",
    "category": "frios",
    "name": "Frappé de Mazapán María Bonita",
    "shortDescription": "Base cremosa de leche, espresso suave, mazapán de cacahuate original de la rosa y lluvia de cacahuate garapiñado.",
    "description": "Nuestra bebida helada más aclamada. Licuamos mazapán artesanal con leche fría, base frappé aterciopelada y un shot de espresso para balancear el dulzor con el tostado del grano.",
    "price": 84,
    "tags": [
      "Estrella de la Casa",
      "Más Pedido",
      "Frappé"
    ],
    "badge": "Favorito",
    "destacadoHero": true,
    "image": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
    "calories": "380 kcal",
    "prepTime": "5 min",
    "customizable": true,
    "options": {
      "tamano": [
        {
          "label": "Grande (480ml)",
          "extraPrice": 0
        },
        {
          "label": "Jumbo (650ml)",
          "extraPrice": 20
        }
      ],
      "leche": [
        "Leche Entera",
        "Leche Deslactosada",
        "Leche de Avena (+ $16)",
        "Leche de Coco (+ $14)"
      ],
      "extras": [
        {
          "name": "Corona de crema batida con trozos de mazapán",
          "price": 15
        },
        {
          "name": "Doble shot de espresso para mayor intensidad",
          "price": 18
        }
      ]
    }
  },
  {
    "id": "frio-moka",
    "category": "frios",
    "name": "Frappé Moka con Crema Batida & Chocolate",
    "shortDescription": "Espresso doble, chocolate amargo fundido, leche bien fría y copete de crema batida con jarabe de chocolate.",
    "description": "Para los devotos del chocolate helado. Mezcla balanceada de café espresso y salsa de chocolate oscuro licuado con hielo frappé hasta textura de nieve fina.",
    "price": 78,
    "tags": [
      "Chocolate",
      "Frappé",
      "Dulce"
    ],
    "badge": "Favorito",
    "image": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80",
    "calories": "360 kcal",
    "prepTime": "5 min",
    "customizable": true,
    "options": {
      "leche": [
        "Leche Entera",
        "Leche Deslactosada",
        "Leche de Avena (+ $16)"
      ],
      "extras": [
        {
          "name": "Chispas de chocolate belga",
          "price": 12
        },
        {
          "name": "Shot extra de espresso",
          "price": 15
        }
      ]
    }
  },
  {
    "id": "frio-3",
    "category": "frios",
    "name": "Iced Horchata con Espresso",
    "shortDescription": "Horchata artesanal de arroz, canela y vainilla servida con hielo y un float de espresso doble de Chiapas.",
    "description": "Una fusión celestial. Nuestra horchata casera de arroz con leche y canela en raja servida sobre hielo frappé, coronada con un shot doble de espresso que desciende lentamente en capas visuales hermosas.",
    "price": 68,
    "tags": [
      "Refrescante",
      "Tradicional",
      "Café"
    ],
    "badge": "Recomendado",
    "image": "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80",
    "calories": "220 kcal",
    "prepTime": "4 min",
    "customizable": true,
    "options": {
      "dulzor": [
        "Dulzor normal de la casa",
        "Menos dulce",
        "Con leche de coco (+ $14)"
      ],
      "extras": [
        {
          "name": "Perlas de tapioca negra cocidas en piloncillo",
          "price": 16
        }
      ]
    }
  },
  {
    "id": "frio-4",
    "category": "frios",
    "name": "Cold Brew Cítrico Infusionado 18 Horas",
    "shortDescription": "Café de especialidad extraído en frío durante 18 horas, servido con rodaja de naranja deshidratada y agua tónica.",
    "description": "Extracción por goteo lento en frío que resalta notas naturalmente dulces, achocolatadas y con cero amargor. Servido con rodaja de naranja valenciana y agua tónica premium.",
    "price": 65,
    "tags": [
      "De Especialidad",
      "Sin Azúcar",
      "Vegano"
    ],
    "badge": "Exclusivo",
    "image": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80",
    "calories": "15 kcal",
    "prepTime": "3 min",
    "customizable": true,
    "options": {
      "estilo": [
        "Con Tónica & Naranja",
        "Solo con Hielo y Cítricos",
        "Estilo Latte Frío con leche de avena (+ $16)"
      ]
    }
  },
  {
    "id": "com-crepa-salada",
    "category": "comidas",
    "name": "Crepa Salada",
    "shortDescription": "Crepa con receta original de la casa, con relleno de queso y jamón, queso gratinado y chipotle encima, acompañada de ensalada fresca.",
    "description": "Crepa con receta original de la casa dorada a la mantequilla, rellena de jamón de pavo selecto y queso manchego fundido, gratinada al horno con salsa cremosa de chipotle y acompañada de ensalada fresca de la huerta.",
    "price": 75,
    "tags": [
      "Favorito",
      "Salado",
      "Especial"
    ],
    "badge": "Favorito",
    "image": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
    "calories": "380 kcal",
    "prepTime": "12 min",
    "customizable": true,
    "options": {
      "bases": [
        "Crepa Tradicional de Mantequilla",
        "Crepa Integral de Avena"
      ],
      "extras": [
        {
          "name": "Extra aderezo chipotle de la casa",
          "price": 10
        },
        {
          "name": "Champiñones salteados al ajillo",
          "price": 16
        },
        {
          "name": "Porción extra de queso gratinado",
          "price": 15
        }
      ]
    }
  },
  {
    "id": "des-1",
    "category": "comidas",
    "name": "Chilaquiles Mestizos con Arrachera Marinada",
    "shortDescription": "Totopos nixtamalizados al comal, salsa morita tatemada, crema de rancho, queso Cotija y 120g de arrachera al carbón.",
    "description": "Totopos crujientes de maíz azul y amarillo cortados a mano, bañados al momento en nuestra salsa morita tatemada. Acompañados de 120 gramos de jugosa arrachera marinada al carbón, crema espesa de rancho, queso Cotija añejo, cebolla morada curtida con orégano y frijoles refritos con manteca.",
    "price": 165,
    "tags": [
      "Estrella de la Casa",
      "Más Pedido",
      "Desayuno Fuerte"
    ],
    "badge": "Especial del Chef",
    "image": "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=800&q=80",
    "calories": "680 kcal",
    "prepTime": "12-15 min",
    "customizable": true,
    "options": {
      "salsa": [
        "Salsa Morita Tatemada (Picor Medio)",
        "Salsa Verde de Tomatillo Asado con Serrano",
        "Salsa de Frijol con Epazote (No Pica)",
        "Salsa Pasilla con Piloncillo"
      ],
      "proteina": [
        {
          "label": "Arrachera Marinada al Carbón (120g)",
          "extraPrice": 0
        },
        {
          "label": "Pechuga de Pollo Deshebrada de Libre Pastoreo",
          "extraPrice": -25
        },
        {
          "label": "Dos Huevos Estrellados de Rancho",
          "extraPrice": -35
        },
        {
          "label": "Tasajo Oaxaqueño Asado",
          "extraPrice": 15
        },
        {
          "label": "Solo Queso y Crema (Vegetariano)",
          "extraPrice": -45
        }
      ],
      "extras": [
        {
          "name": "Aguacate Hass en rebanadas",
          "price": 20
        },
        {
          "name": "Huevo estrellado adicional montado",
          "price": 18
        },
        {
          "name": "Porción extra de queso Cotija",
          "price": 14
        }
      ]
    }
  },
  {
    "id": "com-molletes",
    "category": "comidas",
    "name": "Molletes de la Abuela con Chorizo & Pico de Gallo",
    "shortDescription": "Bolillo crujiente recién horneado con mantequilla, frijoles refritos con manteca, queso manchego gratinado y chorizo.",
    "description": "Dos piezas de bolillo de panadería artesanal untadas con frijoles refritos negros, cubiertas de queso manchego derretido y chorizo dorado a la plancha, servidos con pico de gallo fresco.",
    "price": 85,
    "tags": [
      "Clásico",
      "Favorito",
      "Antojo"
    ],
    "badge": "Favorito",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    "calories": "490 kcal",
    "prepTime": "10 min",
    "customizable": true,
    "options": {
      "proteina": [
        "Con Chorizo Artesanal",
        "Con Jamón de Pavo",
        "Con Chicharrón Prensado (+ $15)",
        "Sencillos solo con Queso"
      ],
      "extras": [
        {
          "name": "Guacamole fresco encima",
          "price": 20
        },
        {
          "name": "Huevo estrellado montado en cada mitad",
          "price": 22
        }
      ]
    }
  },
  {
    "id": "com-enchiladas",
    "category": "comidas",
    "name": "Enchiladas Suizas Gratinadas con Crema de Rancho",
    "shortDescription": "Tres enchiladas rellenas de pechuga deshebrada, salsa verde cremosa al tomatillo y gratín de queso manchego.",
    "description": "Tortillas de maíz nixtamalizadas rellenas de abundante pollo de libre pastoreo, bañadas en salsa verde cremosa con crema de rancho y queso manchego fundido al horno.",
    "price": 130,
    "tags": [
      "Tradicional",
      "Fuerte",
      "Gourmet"
    ],
    "badge": "Recomendado",
    "image": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
    "calories": "610 kcal",
    "prepTime": "14 min",
    "customizable": true,
    "options": {
      "relleno": [
        "Pechuga de Pollo Deshebrada",
        "Queso Panela Fresco",
        "Arrachera picada (+ $25)"
      ],
      "extras": [
        {
          "name": "Rebanadas de aguacate fresco",
          "price": 18
        },
        {
          "name": "Frijoles refritos de guarnición extra",
          "price": 15
        }
      ]
    }
  },
  {
    "id": "pan-frances",
    "category": "panaderia",
    "name": "Pan Francés en Brioche con Frutos Rojos",
    "shortDescription": "Masa brioche dorada a la mantequilla clarificada con miel de maple virgen, fresas, moras y azúcar glass.",
    "description": "Dos rebanadas gruesas de pan brioche horneado en casa, remojadas en infusión de leche, vainilla de Papantla y canela. Doradas a la plancha con mantequilla y servidas con frutos rojos frescos y mantequilla batida.",
    "price": 110,
    "tags": [
      "Favorito",
      "Dulce",
      "Brunch"
    ],
    "badge": "Favorito",
    "image": "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=800&q=80",
    "calories": "490 kcal",
    "prepTime": "10 min",
    "customizable": true,
    "options": {
      "miel": [
        "Miel de Maple Canadiense Virgen",
        "Miel de Abeja de Azahar",
        "Miel de Agave Orgánica"
      ],
      "extras": [
        {
          "name": "Porción extra de frutos rojos (fresa, frambuesa, zarzamora)",
          "price": 24
        },
        {
          "name": "Bola de helado de vainilla artesanal",
          "price": 25
        },
        {
          "name": "Tocino crujiente (2 tiras) para contraste agridulce",
          "price": 20
        }
      ]
    }
  },
  {
    "id": "pan-waffles",
    "category": "panaderia",
    "name": "Waffles Belgas con Fresa & Nutella",
    "shortDescription": "Dos waffles crujientes por fuera y suaves por dentro, con crema batida, fresas frescas y generosa Nutella.",
    "description": "Masa de waffle belga con perlas de azúcar que caramelizan en la plancha. Servidos calientes con fresas frescas rebanadas, generoso baño de Nutella y copo de crema chantilly.",
    "price": 115,
    "tags": [
      "Favorito",
      "Dulce",
      "Waffles"
    ],
    "badge": "Favorito",
    "image": "https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=800&q=80",
    "calories": "520 kcal",
    "prepTime": "10 min",
    "customizable": true,
    "options": {
      "cobertura": [
        "Nutella con Fresas",
        "Cajeta de Celaya con Plátano y Nuez",
        "Mantequilla y Miel de Maple"
      ],
      "extras": [
        {
          "name": "Nuez pecana tostada",
          "price": 15
        },
        {
          "name": "Bola de helado de vainilla",
          "price": 25
        }
      ]
    }
  },
  {
    "id": "pan-1",
    "category": "panaderia",
    "name": "Concha de Vainilla con Nata Fresca de Rancho",
    "shortDescription": "Masa brioche con costra crujiente de azúcar, partida a la mitad y rellena de abundante nata fresca de rancho.",
    "description": "El emblema de la panadería dulce mexicana. Elaborada con mantequilla pura al 82% de grasa, fermentada por 24 horas para lograr un migajón esponjoso y perfumado. Rellena al momento con nata montada fresca.",
    "price": 48,
    "tags": [
      "Panadería",
      "Tradicional",
      "Más Pedido"
    ],
    "badge": "Recién Horneado",
    "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    "calories": "340 kcal",
    "prepTime": "2 min",
    "customizable": true,
    "options": {
      "sabor": [
        "Costra de Vainilla Tradicional",
        "Costra de Chocolate Oscuro"
      ],
      "relleno": [
        "Con Nata Fresca de Rancho",
        "Sin Relleno (Sencilla)",
        "Con Nutella (+ $15)",
        "Con Cajeta de Celaya (+ $14)"
      ]
    }
  },
  {
    "id": "com-desayuno-completo",
    "category": "combos",
    "name": "Combo Desayuno María Bonita",
    "shortDescription": "Chilaquiles Mestizos con huevo o pollo + Jugo de Naranja natural (350ml) + Café de Olla tradicional.",
    "description": "El desayuno completo por excelencia. Incluye una orden generosa de chilaquiles con proteína a elegir, un jugo de naranja recién exprimido y un café de olla en taza de barro curada.",
    "price": 185,
    "savings": "Ahorras $42",
    "tags": [
      "Combo",
      "Completo",
      "Más Pedido"
    ],
    "badge": "Mejor Valor",
    "image": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
    "calories": "750 kcal",
    "prepTime": "12 min",
    "customizable": true,
    "options": {
      "chilaquilesProteina": [
        "Con Pollo Deshebrado",
        "Con Dos Huevos Estrellados",
        "Con Arrachera Marinada (+ $25)"
      ],
      "bebidaCaliente": [
        "Café de Olla Tradicional",
        "Café Americano",
        "Capuchino (+ $15)"
      ],
      "jugo": [
        "Jugo de Naranja 100% Natural",
        "Jugo Verde Detox (+ $10)",
        "Jugo de Toronja"
      ]
    }
  },
  {
    "id": "com-merienda",
    "category": "combos",
    "name": "Combo Merienda para Dos",
    "shortDescription": "Dos bebidas calientes a elegir + Pan Francés con frutos rojos para compartir + 2 piezas de pan dulce.",
    "description": "La opción predilecta para compartir una tarde inolvidable en la terraza. Elige tus dos bebidas calientes favoritas, un pan francés con frutos rojos y dos conchas con nata recién horneadas.",
    "price": 195,
    "savings": "Ahorras $55",
    "tags": [
      "Combo",
      "Parejas",
      "Para Compartir"
    ],
    "badge": "Para Compartir",
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    "calories": "820 kcal",
    "prepTime": "12 min",
    "customizable": true,
    "options": {
      "bebida1": [
        "Capuchino Clásico",
        "Latte Caliente",
        "Café de Olla Tradicional",
        "Chocolate Oaxaqueño"
      ],
      "bebida2": [
        "Capuchino Clásico",
        "Latte Caliente",
        "Café de Olla Tradicional",
        "Chocolate Oaxaqueño"
      ]
    }
  },
  {
    "id": "pan-chocolatin",
    "category": "panaderia",
    "name": "Chocolatín Francés de Hojaldre",
    "shortDescription": "Masa hojaldrada crujiente con mantequilla pura al 82%, rellena de dos barras de chocolate semiamargo belga.",
    "description": "Hojaldre laminado artesanalmente en nuestro obrador con 27 capas crujientes y mantequilla de calidad europea. Relleno de chocolate oscuro semiamargo horneado a la perfección.",
    "price": 45,
    "tags": [
      "Recién Horneado",
      "Hojaldre",
      "Chocolate"
    ],
    "badge": "Artesanal",
    "image": "https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?auto=format&fit=crop&w=800&q=80",
    "calories": "310 kcal",
    "prepTime": "2 min",
    "customizable": true,
    "options": {
      "temperatura": [
        "Calientito recién salido del horno",
        "Temperatura ambiente"
      ]
    }
  },
  {
    "id": "post-tres-leches",
    "category": "postres",
    "name": "Pastel de Tres Leches con Cajeta de Celaya",
    "shortDescription": "Bizcocho ultra humectado en tres leches con espiral generosa de cajeta de cabra quemada de Celaya.",
    "description": "Nuestra receta familiar secreta. Bizcocho esponjoso empapado en mezcla de tres leches infusionadas con canela, cubierto con merengue suave y decorado con cajeta de Celaya quemada en olla de cobre.",
    "price": 65,
    "tags": [
      "Favorito",
      "Postre",
      "Tradicional"
    ],
    "badge": "Favorito",
    "image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
    "calories": "390 kcal",
    "prepTime": "2 min",
    "customizable": true,
    "options": {
      "extras": [
        {
          "name": "Nuez pecana tostada picada",
          "price": 12
        },
        {
          "name": "Fresa fresca rebanada",
          "price": 10
        }
      ]
    }
  },
  {
    "id": "post-flan",
    "category": "postres",
    "name": "Flan Napolitano Tradicional de la Abuela",
    "shortDescription": "Receta secreta horneada a baño maría con queso crema, vainilla de Papantla y espejo de caramelo dorado.",
    "description": "Cremoso, denso y sedoso al paladar. Elaborado con leche condensada, queso crema, huevos de granja y auténtica vaina de vainilla de Papantla, bañado en caramelo dorado con notas tostadas.",
    "price": 58,
    "tags": [
      "Tradicional",
      "Insignia",
      "Postre"
    ],
    "badge": "Insignia",
    "image": "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&w=800&q=80",
    "calories": "320 kcal",
    "prepTime": "2 min",
    "customizable": true,
    "options": {
      "extras": [
        {
          "name": "Corona de crema batida artesanal",
          "price": 10
        },
        {
          "name": "Toque de rompope tradicional",
          "price": 15
        }
      ]
    }
  },
  {
    "id": "post-cheesecake",
    "category": "postres",
    "name": "Cheesecake Artesanal de Frutos Rojos",
    "shortDescription": "Cremoso pay de queso estilo New York sobre costra crujiente de galleta con compota tibia de frutos del bosque.",
    "description": "Base de galleta de mantequilla con canela, relleno espeso de queso crema Philadelphia con ralladura de limón amarillo y cubierta generosa de compota de frambuesas, zarzamoras y fresas.",
    "price": 72,
    "tags": [
      "Favorito",
      "Gourmet",
      "Postre"
    ],
    "badge": "Favorito",
    "image": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80",
    "calories": "440 kcal",
    "prepTime": "2 min",
    "customizable": true,
    "options": {
      "cobertura": [
        "Compota de Frutos Rojos Natural",
        "Cajeta Quemada con Nuez",
        "Chocolate Amargo Caliente"
      ]
    }
  },
  {
    "id": "post-crepa-dulce",
    "category": "postres",
    "name": "Crepa Dulce con Nutella, Fresa & Plátano",
    "shortDescription": "Crepa francesa dorada a la mantequilla con abundante Nutella, fresas frescas, plátano y nieve de azúcar glass.",
    "description": "Delgada y tierna crepa preparada al momento en crepera de hierro con mantequilla clarificada, rellena de abundante crema de avellana con cacao, fresa natural y plátano tabasco.",
    "price": 68,
    "tags": [
      "Favorito",
      "Dulce",
      "Crepa"
    ],
    "badge": "Favorito",
    "image": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
    "calories": "410 kcal",
    "prepTime": "8 min",
    "customizable": true,
    "options": {
      "fruta": [
        "Fresa y Plátano",
        "Solo Fresa Fresca",
        "Solo Plátano",
        "Con Frutos Rojos (+ $14)"
      ],
      "base": [
        "Nutella Tradicional",
        "Cajeta de Celaya",
        "Lechera con Canela"
      ],
      "extras": [
        {
          "name": "Bola de helado de vainilla artesanal",
          "price": 25
        },
        {
          "name": "Nuez picada tostada",
          "price": 12
        }
      ]
    }
  },
  {
    "id": "post-pastel-chocolate",
    "category": "postres",
    "name": "Pastel de Chocolate Rústico Fudge",
    "shortDescription": "Bizcocho húmedo de cacao oscuro al 70%, relleno y bañado con ganache espeso de chocolate semiamargo tibio.",
    "description": "Una perdición para los amantes del chocolate. Tres capas de bizcocho esponjoso con cacao puro de Tabasco, embebido en café expresso ligero y cubierto de ganache aterciopelado.",
    "price": 70,
    "tags": [
      "Chocolate",
      "Intenso",
      "Postre"
    ],
    "badge": "Delicia",
    "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
    "calories": "480 kcal",
    "prepTime": "3 min",
    "customizable": true,
    "options": {
      "temperatura": [
        "Tibio con chocolate fundido",
        "Frío de vitrina"
      ],
      "extras": [
        {
          "name": "Bola de helado de vainilla",
          "price": 25
        },
        {
          "name": "Coulis de frutos rojos ácido",
          "price": 12
        }
      ]
    }
  },
  {
    "id": "post-carlota",
    "category": "postres",
    "name": "Carlota de Limón Estilo Casero",
    "shortDescription": "Capas de galleta María empapadas en crema suave de limón colimense y leche condensada con ralladura cítrica.",
    "description": "El postre casero mexicano más nostálgico y fresco. Alternamos capas de galletas María tradicionales con crema batida de limón agrio y tres leches, refrigerada a punto nieve con ralladura de cáscara verde.",
    "price": 55,
    "tags": [
      "Cítrico",
      "Fresco",
      "Postre"
    ],
    "badge": "Tradicional",
    "image": "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80",
    "calories": "290 kcal",
    "prepTime": "2 min",
    "customizable": true,
    "options": {
      "extras": [
        {
          "name": "Toque de canela en polvo espolvoreada",
          "price": 0
        },
        {
          "name": "Crema chantilly encima",
          "price": 10
        }
      ]
    }
  }
];

// =============================================================================
// INFORMACIÓN Y CONFIGURACIÓN GENERAL DEL NEGOCIO / CAFETERÍA
// =============================================================================
const BUSINESS_DATA = {
  // ===========================================================================
  // 1. IDENTIDAD DE MARCA Y CABECERA
  // (Actualiza el nombre, título y subtítulo en Header, Drawer móvil y Footer)
  // ===========================================================================
  brand: {
    name: 'Cafetería María Bonita',
    title: 'María Bonita',
    subtitle: 'Cafetería & Panadería',
    footerSubtitle: 'Sabor de hogar'
  },

  // ===========================================================================
  // 2. HERO PRINCIPAL (PORTADA SUPERIOR)
  // (Edita aquí el badge, titular y subtítulo apetitoso de la portada)
  // ===========================================================================
  hero: {
    // Insignia / Pill superior
    badgeIcon: '✨',
    badgeText: 'Alta Cocina Matutina • Desayunos de Autor',

    // Titular principal con formato HTML (puedes cambiar el texto y la palabra resaltada en dorado)
    titleHtml: 'Sabor de hogar, <br>aroma a <span class="highlight">recién molido</span>.',
    // Si prefieres cambiarlo como texto plano sin HTML:
    title: 'Sabor de hogar, aroma a recién molido.',

    // Párrafo descriptivo del Hero
    subtitle: 'Chilaquiles mestizos con arrachera al carbón, panadería artesanal de masa madre horneada al alba y café de altura 100% mexicano para comenzar tu mañana de manera inolvidable.',

    // Botones de acción principales
    btnPrimaryText: 'Explorar Menú Completo',
    btnSecondaryText: 'Especialidades del Día',

    // Barra de Prestigio (4 distintivos clave bajo los botones)
    luxuryPills: [
      { icon: '☕', title: 'Café de Finca', subtitle: 'Chiapas & Oaxaca' },
      { icon: '🥐', title: 'Masa Madre', subtitle: 'Fermentada 24 horas' },
      { icon: '🥚', title: 'Libre Pastoreo', subtitle: '100% Orgánico' },
      { icon: '⭐', title: '4.9★ Calificación', subtitle: '+3,800 comensales' }
    ]
  },

  // Accesos directos para compatibilidad
  name: 'Cafetería María Bonita',
  tradeName: 'María Bonita Cafetería & Panadería',
  slogan: 'Sabor de hogar, aroma a recién molido',
  subheadline: 'Chilaquiles mestizos con arrachera al carbón, panadería artesanal de masa madre horneada al alba y café de altura 100% mexicano para comenzar tu mañana de manera inolvidable.',

  // ===========================================================================
  // 3. SECCIÓN DE UBICACIÓN Y CONTACTO ("NUESTRA UBICACIÓN")
  // ===========================================================================
  location: {
    sectionPretitle: '— NUESTRA UBICACIÓN',
    headingLine1: 'Ven a disfrutar',
    headingLine2: 'un momento bonito.',
    leadText: 'María Bonita te espera en el Centro de Chetumal, Quintana Roo.',
    descText: 'Visítanos, conoce nuestro espacio, descubre nuestros rincones y disfruta una taza de café en un ambiente cálido y lleno de encanto.',
    addressTitle: 'Dirección',
    addressLine1: 'Av. Álvaro Obregón #168, Col. Centro',
    addressLine2: '77000 Chetumal, Quintana Roo',
    address: 'Av. Álvaro Obregón #168, Col. Centro, Chetumal, Quintana Roo.',
    reference: 'A dos cuadras del Boulevard Bahía y Explanada de la Bandera',
    cityZone: 'Chetumal, Q. Roo',
    fullPostalAddress: 'Av. Álvaro Obregón #168, Col. Centro, C.P. 77000, Chetumal, Quintana Roo, México',
    hoursTitle: 'Horario',
    contactTitle: 'Pedidos y contacto',
    contactPrompt: 'Escríbenos por WhatsApp para realizar tu pedido.',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Av.+Alvaro+Obregon+168,+Centro,+Chetumal,+Quintana+Roo',
    mapEmbedQuery: 'Av. Álvaro Obregón 168, Centro, Chetumal, Quintana Roo',
    mapStoreBadge: {
      kicker: 'TE ESPERAMOS EN',
      name: 'María Bonita',
      desc: 'Café · Historia · Experiencia'
    }
  },

  // Horarios de Servicio Detallados
  // (El sistema calcula y actualiza automáticamente si está ABIERTO o CERRADO en tiempo real según la hora y día actual)
  hours: [
    {
      days: 'Lunes a Jueves',
      time: '06:00 am - 10:00 pm',
      open: '06:00', // Formato 24h para cálculo exacto (6:00 am)
      close: '22:00', // (10:00 pm)
      dayIndices: [1, 2, 3, 4] // 1: Lun, 2: Mar, 3: Mié, 4: Jue
    },
    {
      days: 'Viernes',
      time: '07:00 am - 11:00 pm',
      open: '07:00',
      close: '23:00',
      dayIndices: [5] // 5: Vie
    },
    {
      days: 'Sábados',
      time: '08:00 am - 11:00 pm',
      open: '08:00',
      close: '23:00',
      dayIndices: [6] // 6: Sáb
    },
    {
      days: 'Domingos',
      time: '08:00 am - 09:30 pm',
      open: '08:00',
      close: '21:30',
      dayIndices: [0] // 0: Dom
    }
  ],

  // Control del Estado Abierto / Cerrado
  scheduleStatus: {
    mode: 'auto', // 'auto' = cálculo dinámico automático en tiempo real; 'open' = forzar abierto; 'closed' = forzar cerrado
    openBadgePrefix: 'Abierto Hoy:',
    closedBadgePrefix: 'Cerrado Ahora'
  },

  // Estado Rápido para Cabecera (Opcional como respaldo)
  topNotice: {
    badgeText: 'Abierto Hoy: 6:00 am - 10:00 pm'
  },

  // Atención Directa, Teléfono y WhatsApp (LADA Chetumal 983)
  contact: {
    title: 'Atención Directa & Pedidos',
    phoneDisplay: '+52 983 122 6847',
    phoneCall: '+529831226847',
    whatsappNumber: '529831226847', // Número con LADA Chetumal 983
    whatsappMessageNotice: 'Escríbenos a WhatsApp para apartar tu mesa o recoger tu comanda sin filas:',
    whatsappButtonText: 'Escribir por WhatsApp',
    whatsappDefaultMessage: 'Hola Cafetería María Bonita en Chetumal, quisiera consultar sobre disponibilidad y pedidos...',
    email: 'hola@cafeteriamariabonita.com'
  },

  // Rótulos del Pin en el Mapa Visual
  mapPin: {
    title: 'María Bonita Cafetería',
    subtitle: 'Álvaro Obregón #168 • Centro, Chetumal'
  },

  // Métricas y Estadísticas (Sección Historia)
  stats: [
    { number: '+12', label: 'Años de Tradición', desc: 'Conservando las recetas de la abuela' },
    { number: '100%', label: 'Grano Mexicano', desc: 'Chiapas, Veracruz y Oaxaca' },
    { number: '+45', label: 'Recetas Propias', desc: 'Bebidas y panadería de autor' },
    { number: '4.9★', label: 'Calificación Google', desc: 'Más de 3,800 reseñas felices' }
  ],

  // Redes Sociales
  socials: {
    instagram: 'https://instagram.com/cafeteriamariabonita',
    facebook: 'https://facebook.com/cafeteriamariabonita',
    tiktok: 'https://tiktok.com/@cafeteriamariabonita'
  },

  // Configuración de Facturación y Comisión de la Plataforma (Exclusivo para el Dueño del Restaurante)
  platformBilling: {
    commissionPerOrder: 3, // $3.00 MXN cobrados por cada comanda generada desde la plataforma
    monthlyFee: 249, // Cuota fija mensual de mantenimiento ($249.00 MXN)
    currency: 'MXN',
    cycleDays: 30, // Periodo estándar de facturación (mensual)
    graceDays: 5, // Días de gracia tras vencimiento antes de pasar a modo solo lectura
    reminderDaysBefore: 3, // Días previos a fecha de corte para enviar recordatorio automático
    nextBillingDate: '2026-11-28', // Fecha ISO YYYY-MM-DD en zona horaria America/Cancun
    billingPhone: '529831226847', // WhatsApp del dueño para recordatorios
    whatsappRecipient: '529831226847', // Alias de receptor
    ownerPin: '2026', // PIN de seguridad para acceder al panel privado de facturación
    stripePublishableKey: 'pk_test_TYooMQauvdEDq54NiTphI7jx', // Llave pública de Stripe configurable
    companyName: 'RedaySoft Software & Menús Digitales',
    supportEmail: 'facturacion@redaysoft.com',
    paymentInfo: {
      bank: 'BBVA México',
      clabe: '012180001234567890',
      beneficiary: 'RedaySoft Soluciones Digitales S.A.S.',
      reference: 'MARIA-BONITA-01',
      paymentLink: 'https://buy.stripe.com/test_maria_bonita_mensualidad'
    }
  }
};

// Objeto para compatibilidad total con código existente
const CAFE_INFO = {
  ...BUSINESS_DATA,
  phone: BUSINESS_DATA.contact.phoneDisplay,
  whatsapp: BUSINESS_DATA.contact.whatsappNumber,
  whatsappDisplay: BUSINESS_DATA.contact.phoneDisplay,
  email: BUSINESS_DATA.contact.email,
  address: BUSINESS_DATA.location.address,
  reference: BUSINESS_DATA.location.reference,
  hours: BUSINESS_DATA.hours,
  stats: BUSINESS_DATA.stats,
  socials: BUSINESS_DATA.socials
};

// Exposición global para depuración o consumo dinámico
if (typeof window !== 'undefined') {
  window.BUSINESS_DATA = BUSINESS_DATA;
  window.CAFE_INFO = CAFE_INFO;
}

export function formatMoney(amount) {
  if (typeof amount !== 'number') return '$0.00';
  return '$' + amount.toFixed(2);
}

export function isScheduleForDay(hourItem, dayOfWeek) {
  if (!hourItem || !hourItem.days) return false;
  const daysStr = hourItem.days.toLowerCase();
  if (daysStr.includes('lunes a domingo') || daysStr.includes('todos los días')) return true;
  if (dayOfWeek === 1 && daysStr.includes('lunes')) return true;
  if (dayOfWeek === 2 && daysStr.includes('martes')) return true;
  if (dayOfWeek === 3 && (daysStr.includes('miércoles') || daysStr.includes('miercoles'))) return true;
  if (dayOfWeek === 4 && daysStr.includes('jueves')) return true;
  if (dayOfWeek === 5 && daysStr.includes('viernes')) return true;
  if (dayOfWeek === 6 && (daysStr.includes('sábado') || daysStr.includes('sabado'))) return true;
  if (dayOfWeek === 0 && daysStr.includes('domingo')) return true;
  if (daysStr.includes('lunes a viernes') && dayOfWeek >= 1 && dayOfWeek <= 5) return true;
  if (daysStr.includes('viernes a domingo') && (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0)) return true;
  if (daysStr.includes('sábado y domingo') && (dayOfWeek === 6 || dayOfWeek === 0)) return true;
  return false;
}

export function computeLiveBusinessStatus(hoursList) {
  if (!hoursList || !Array.isArray(hoursList) || hoursList.length === 0) {
    return {
      isOpen: true,
      badgeText: 'Abierto Hoy: 7:00 am - 10:00 pm',
      cssClass: 'is-open',
      closingText: 'Servicio activo',
    };
  }
  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todaySchedule = hoursList.find((h) => isScheduleForDay(h, currentDay));

  if (!todaySchedule || todaySchedule.time.toLowerCase().includes('cerrado')) {
    return {
      isOpen: false,
      badgeText: 'Cerrado Hoy',
      cssClass: 'is-closed',
      closingText: 'Hoy nos encontramos descansando',
    };
  }

  const match = todaySchedule.time.match(/(\d{1,2}):(\d{2})\s*(am|pm)?\s*[-a]\s*(\d{1,2}):(\d{2})\s*(am|pm)?/i);

  if (match) {
    let openH = parseInt(match[1], 10);
    const openM = parseInt(match[2], 10);
    const openAmpm = match[3] ? match[3].toLowerCase() : null;

    let closeH = parseInt(match[4], 10);
    const closeM = parseInt(match[5], 10);
    const closeAmpm = match[6] ? match[6].toLowerCase() : null;

    if (openAmpm === 'pm' && openH < 12) openH += 12;
    if (openAmpm === 'am' && openH === 12) openH = 0;
    if (closeAmpm === 'pm' && closeH < 12) closeH += 12;
    if (closeAmpm === 'am' && closeH === 12) closeH = 0;

    const openTotal = openH * 60 + openM;
    const closeTotal = closeH * 60 + closeM;

    const isOpen = currentMinutes >= openTotal && currentMinutes < closeTotal;

    return {
      isOpen,
      badgeText: isOpen ? `Abierto Hoy: ${todaySchedule.time}` : `Cerrado ahora • Abre hoy a las ${match[1]}:${match[2]} ${openAmpm || ''}`,
      cssClass: isOpen ? 'is-open' : 'is-closed',
      closingText: isOpen ? `Abierto hasta las ${match[4]}:${match[5]} ${closeAmpm || ''}` : 'Cerrado en este momento',
    };
  }

  return {
    isOpen: true,
    badgeText: `Abierto Hoy: ${todaySchedule.time}`,
    cssClass: 'is-open',
    closingText: 'Servicio activo',
  };
}

export {
  BUSINESS_DATA,
  CAFE_INFO,
  MENU_CATEGORIES,
  MENU_ITEMS,
};



