// Catálogo de ejercicios de Pau (mismo contenido que pau.ts).
// Plan actual: 4 entrenos numerados; cada ejercicio indica su clave de registro (`key`).
// Plan anterior (legacy): claves ex-{dia}-{indice}; se mantiene para el historial.
export const PAU_DAYS: any[] = [
 {
  "k": "E1",
  "name": "Entreno 1",
  "title": "Torso · espalda",
  "ex": [
   {
    "key": "ex-M-0",
    "name": "Jalón al pecho en polea",
    "tag": "Foco espalda"
   },
   {
    "key": "ex-E1-1",
    "name": "Remo en máquina con apoyo de pecho",
    "tag": "Foco espalda"
   },
   {
    "key": "ex-M-2",
    "name": "Remo sentado en polea",
    "tag": "Foco espalda"
   },
   {
    "key": "ex-M-3",
    "name": "Face pull en polea",
    "tag": ""
   },
   {
    "key": "ex-L-1",
    "name": "Press inclinado con mancuernas",
    "tag": ""
   },
   {
    "key": "ex-L-4",
    "name": "Elevaciones laterales con mancuernas",
    "tag": ""
   },
   {
    "key": "ex-E1-6",
    "name": "Dead bug",
    "tag": "Core"
   },
   {
    "key": "ex-E1-cardio",
    "name": "Final: cardio suave o HIIT",
    "tag": "Cardio"
   }
  ]
 },
 {
  "k": "E2",
  "name": "Entreno 2",
  "title": "Pierna · cuádriceps",
  "ex": [
   {
    "key": "ex-X-0",
    "name": "Sentadilla con barra",
    "tag": "Foco cuádriceps"
   },
   {
    "key": "ex-X-2",
    "name": "Prensa de piernas",
    "tag": "Foco cuádriceps"
   },
   {
    "key": "ex-E2-2",
    "name": "Sentadilla búlgara con mancuernas",
    "tag": "Foco cuádriceps"
   },
   {
    "key": "ex-X-4",
    "name": "Extensión de cuádriceps",
    "tag": ""
   },
   {
    "key": "ex-X-3",
    "name": "Curl femoral en máquina",
    "tag": ""
   },
   {
    "key": "ex-X-5",
    "name": "Elevación de gemelos de pie",
    "tag": ""
   },
   {
    "key": "ex-L-6",
    "name": "Plancha abdominal",
    "tag": "Core"
   },
   {
    "key": "ex-E2-cardio",
    "name": "Final: cardio suave o HIIT",
    "tag": "Cardio"
   }
  ]
 },
 {
  "k": "E3",
  "name": "Entreno 3",
  "title": "Torso · espalda",
  "ex": [
   {
    "key": "ex-J-0",
    "name": "Dominadas (o asistidas)",
    "tag": "Foco espalda"
   },
   {
    "key": "ex-J-2",
    "name": "Remo con mancuerna a una mano",
    "tag": "Foco espalda"
   },
   {
    "key": "ex-E3-2",
    "name": "Pullover en polea alta",
    "tag": "Foco espalda"
   },
   {
    "key": "ex-J-4",
    "name": "Pájaros (hombro posterior)",
    "tag": ""
   },
   {
    "key": "ex-L-2",
    "name": "Press militar con mancuernas (sentado)",
    "tag": ""
   },
   {
    "key": "ex-M-4",
    "name": "Curl de bíceps con barra",
    "tag": ""
   },
   {
    "key": "ex-E3-6",
    "name": "Press Pallof en polea",
    "tag": "Core"
   },
   {
    "key": "ex-E3-cardio",
    "name": "Final: cardio suave o HIIT",
    "tag": "Cardio"
   }
  ]
 },
 {
  "k": "E4",
  "name": "Entreno 4",
  "title": "Pierna · glúteo y femoral",
  "ex": [
   {
    "key": "ex-V-2",
    "name": "Hip thrust con barra",
    "tag": "Foco glúteo"
   },
   {
    "key": "ex-X-1",
    "name": "Peso muerto rumano",
    "tag": "Foco femoral"
   },
   {
    "key": "ex-X-3",
    "name": "Curl femoral en máquina",
    "tag": "Foco femoral"
   },
   {
    "key": "ex-E4-3",
    "name": "Abducción de cadera (máquina o polea)",
    "tag": ""
   },
   {
    "key": "ex-E4-4",
    "name": "Puente de glúteo a una pierna",
    "tag": "Activación"
   },
   {
    "key": "ex-E4-5",
    "name": "Plancha lateral",
    "tag": "Core"
   },
   {
    "key": "ex-E4-cardio",
    "name": "Final: cardio suave o HIIT",
    "tag": "Cardio"
   }
  ]
 },
 {
  "k": "L",
  "name": "Lunes",
  "title": "Empuje",
  "ex": [
   {
    "name": "Press de banca con barra",
    "tag": "",
    "sets": "4",
    "reps": "6–10"
   },
   {
    "name": "Press inclinado con mancuernas",
    "tag": "",
    "sets": "3",
    "reps": "8–12"
   },
   {
    "name": "Press militar con mancuernas (sentado)",
    "tag": "",
    "sets": "3",
    "reps": "8–12"
   },
   {
    "name": "Aperturas en polea (cruce de poleas)",
    "tag": "",
    "sets": "3",
    "reps": "12–15"
   },
   {
    "name": "Elevaciones laterales con mancuernas",
    "tag": "",
    "sets": "3",
    "reps": "12–15"
   },
   {
    "name": "Extensión de tríceps en polea con cuerda",
    "tag": "",
    "sets": "3",
    "reps": "10–15"
   },
   {
    "name": "Plancha abdominal",
    "tag": "Core",
    "sets": "3",
    "reps": "30–45 s"
   }
  ],
  "legacy": true
 },
 {
  "k": "M",
  "name": "Martes",
  "title": "Tirón",
  "ex": [
   {
    "name": "Jalón al pecho en polea",
    "tag": "",
    "sets": "4",
    "reps": "8–12"
   },
   {
    "name": "Remo con barra",
    "tag": "",
    "sets": "3",
    "reps": "6–10"
   },
   {
    "name": "Remo sentado en polea",
    "tag": "",
    "sets": "3",
    "reps": "10–12"
   },
   {
    "name": "Face pull en polea",
    "tag": "",
    "sets": "3",
    "reps": "12–15"
   },
   {
    "name": "Curl de bíceps con barra",
    "tag": "",
    "sets": "3",
    "reps": "8–12"
   },
   {
    "name": "Curl martillo con mancuernas",
    "tag": "",
    "sets": "3",
    "reps": "10–12"
   },
   {
    "name": "Cinta inclinada caminando",
    "tag": "Cardio",
    "sets": "1",
    "reps": "10 min"
   }
  ],
  "legacy": true
 },
 {
  "k": "X",
  "name": "Miércoles",
  "title": "Pierna",
  "ex": [
   {
    "name": "Sentadilla con barra",
    "tag": "",
    "sets": "4",
    "reps": "6–10"
   },
   {
    "name": "Peso muerto rumano",
    "tag": "",
    "sets": "3",
    "reps": "8–10"
   },
   {
    "name": "Prensa de piernas",
    "tag": "",
    "sets": "3",
    "reps": "10–12"
   },
   {
    "name": "Curl femoral en máquina",
    "tag": "",
    "sets": "3",
    "reps": "10–15"
   },
   {
    "name": "Extensión de cuádriceps",
    "tag": "",
    "sets": "2",
    "reps": "12–15"
   },
   {
    "name": "Elevación de gemelos de pie",
    "tag": "",
    "sets": "3",
    "reps": "12–15"
   },
   {
    "name": "Elevación de piernas colgado",
    "tag": "Core",
    "sets": "3",
    "reps": "10–15"
   }
  ],
  "legacy": true
 },
 {
  "k": "J",
  "name": "Jueves",
  "title": "Torso",
  "ex": [
   {
    "name": "Dominadas (o asistidas)",
    "tag": "",
    "sets": "4",
    "reps": "6–10"
   },
   {
    "name": "Press plano con mancuernas",
    "tag": "",
    "sets": "3",
    "reps": "8–12"
   },
   {
    "name": "Remo con mancuerna a una mano",
    "tag": "",
    "sets": "3",
    "reps": "8–12 por brazo"
   },
   {
    "name": "Fondos en paralelas",
    "tag": "",
    "sets": "3",
    "reps": "8–12"
   },
   {
    "name": "Pájaros (hombro posterior)",
    "tag": "",
    "sets": "3",
    "reps": "12–15"
   },
   {
    "name": "Bici: intervalos",
    "tag": "Cardio",
    "sets": "1",
    "reps": "12 min"
   }
  ],
  "legacy": true
 },
 {
  "k": "V",
  "name": "Viernes",
  "title": "Hombros, brazos y pierna",
  "ex": [
   {
    "name": "Press militar con barra de pie",
    "tag": "",
    "sets": "4",
    "reps": "6–10"
   },
   {
    "name": "Zancadas con mancuernas",
    "tag": "",
    "sets": "3",
    "reps": "10 por pierna"
   },
   {
    "name": "Hip thrust con barra",
    "tag": "",
    "sets": "3",
    "reps": "8–12"
   },
   {
    "name": "Elevación lateral en polea",
    "tag": "",
    "sets": "3",
    "reps": "12–15 por brazo"
   },
   {
    "name": "Curl inclinado con mancuernas",
    "tag": "Superserie 5a",
    "sets": "3",
    "reps": "10–12"
   },
   {
    "name": "Press francés con barra Z",
    "tag": "Superserie 5b",
    "sets": "3",
    "reps": "10–12"
   },
   {
    "name": "Crunch en polea de rodillas",
    "tag": "Core",
    "sets": "3",
    "reps": "12–15"
   },
   {
    "name": "Elíptica (opcional)",
    "tag": "Extra +15–20 min",
    "sets": "1",
    "reps": "15–20 min"
   }
  ],
  "legacy": true
 }
];
