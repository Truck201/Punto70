const express = require("express");
const app = express();
require("dotenv").config();
const articulos = require("./assets/data/articulos.js");
const {
  validarArticulo,
  validarParcialArticulo,
} = require("./src/validateArticulos.js");
const fs = require("node:fs");
const cors = require("cors");

app.use(
  cors({
    origin: (origin, callback) => {
      // Configurar CORS para aceptar tus dominios permitidos
      const ACCEPTED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:8080",
        "https://punto70.vercel.app/",
        "https://punto70.vercel.app",
        "https://punto70-truck201s-projects.vercel.app/",
        "https://punto70-truck201s-projects.vercel.app",
        "http://punto70.com",
        "http://punto70.com/articulos",
        "http://punto70/articulos.com",
      ];

      if (!origin || ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      console.error(`Bloqueado por CORS: origen ${origin}`);
      return callback(new Error("No permitido por CORS"));
    },
  })
);

app.disable("x-powered-by");

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("<h1>Bienvenidos a mi página de inicio</h1>");
});

app.get("/favicon.ico", (req, res) => {
  fs.readFile("./assets/favicon.png", (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.end("<h1>500 Internal Server Error</h1>");
    } else {
      res.setHeader("Content-Type", "image/png");
      res.end(data);
    }
  });
});

app.get("/articulos", (req, res) => {
  res.json(articulos);
});

const getNextId = (array) => {
  return array.length ? array[array.length - 1].id + 1 : 1;
};

app.post("/articulos/:category", (req, res) => {
  const category = req.params.category;
  const validacion = validarArticulo(req.body);

  if (!validacion.success) {
    return res.status(400).json({ error: validacion.error.message });
  }

  if (!articulos[category]) {
    return res.status(404).send(`Category ${category} does not exist`);
  }

  // Verificar si ya existe el articulo en la base
  const existe = articulos[category].some(
    (articulo) =>
      articulo.nombre.toLowerCase() === validacion.data.nombre.toLowerCase()
  );

  if (existe) {
    return res
      .status(409)
      .send(
        `El articulo con nombre ${validacion.data.nombre} ya existe en la categoria ${category}`
      );
  }

  // Generar el nuevo artículo con el próximo ID
  const nextId = getNextId(articulos[category]);
  const newArticle = { id: nextId, ...validacion.data };
  articulos[category].push(newArticle);

  res.status(201).json(newArticle);
});

app.delete("/articulos/:category/:id", (req, res) => {
  const { category, id } = req.params;
  const parsedId = parseInt(id, 10);

  if (!articulos[category]) {
    return res.status(404).send(`La categoría ${category} no existe.`);
  }

  const categoriaArticulos = articulos[category];
  const indice = categoriaArticulos.findIndex(
    (articulo) => articulo.id === parsedId
  );

  if (indice === -1) {
    return res.status(404).json({
      message: `El artículo con ID '${id}' no se encontró en la categoría '${category}'.`,
    });
  }

  categoriaArticulos.splice(indice, 1);
  res
    .status(200)
    .json({ message: `Articulocon ID ${id} eliminado correctamente` });
});

app.patch("/articulos/:category/:id", (req, res) => {
  const { category, id } = req.params;
  const validacion = validarParcialArticulo(req.body);

  if (!validacion.success) {
    return res.status(400).json({ error: validacion.error.message });
  }

  if (!articulos[category]) {
    return res.status(404).send(`Category ${category} does not exist`);
  }

  const articulo = articulos[category].find((art) => art.id === parseInt(id));

  if (!articulo) {
    return res.status(404).json({ message: "Artículo no encontrado." });
  }

  Object.assign(articulo, validacion.data);
  res.status(200).json(articulo);
});

// ultimo que se ejecuta
app.use((req, res) => {
  res.status(404).send("<h1>404</h1>");
});

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`server listening in http://localhost:${PORT}`);
});
