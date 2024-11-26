const z = require("zod");

const articuloPlantilla = z.object({
  nombre: z.string({
    invalid_type_error: "El nombre tiene que ser una cadena de caracteres",
    required_error: "El nombre es requerido",
  }),
  precio: z
    .number({
      invalid_type_error: "El precio tiene que ser un numero",
    })
    .int({
      invalid_type_error: "El precio tiene que ser un numero entero",
    })
    .positive(),
  url: z.string().url({
    message: "Imagen tiene que ser valida URL",
  }),
});

function validarArticulo(input) {
  return articuloPlantilla.safeParse(input);
}

function validarParcialArticulo(input) {
  return articuloPlantilla.partial().safeParse(input);
}

module.exports = {
  validarArticulo,
  validarParcialArticulo,
};
