import { Schema, model } from "mongoose";
import paginate from "mongoose-paginate-v2";

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    index: true, //Conviene ponerlo para buscar por categoría.
  },
  status: {
    type: Boolean,
    default: true, //Por defecto el producto está habilitado al cargarlo.
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true, //Que no se pueda repetir.
  },
  thumbnails: {
    default: [], //Arranca como vector vacío para ir cargando las imágenes.
  },
});

productSchema.plugin(paginate); //Se pone antes de instanciar el modelo.

const productModel = model("products", productSchema);

export default productModel;
