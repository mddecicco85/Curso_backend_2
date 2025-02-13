import { Schema, model } from "mongoose";

const cartSchema = new Schema({
  products: {
    type: [
      //Array de objetos.
      {
        //El objeto tiene 2 propiedades (id y cantidad)
        id_prod: {
          type: Schema.Types.ObjectId, //Sería mongoose.Schema.Types.ObjectId
          //Tiene que ser sí o sí del tipo ObjectId (y no String) porque voy a hacer referencia al ID de un producto.
          required: true,
          ref: "products",
          //Referencia a la colección "products". VAMOS A HACER POPULATE (ver clase 16 Backend I)
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    default: [], //Se crea vacío al crear un usuario.
  },
});

cartSchema.pre("findOne", function () {
  //Al hacer el método findOne, voy a ejecutar esa función.
  this.populate(products.id_prod); //vector.propiedad_de_los_objetos
}); //Que traiga toda la información del carrito cuando lo consulto.

//En el otro proyecto hacíamos cartsModel.findOne({ _id: cid }).populate("products.product")
//pero no en el modelo, lo hacíamos desde el manager.

const cartModel = model("carts", cartSchema); //La colección se va a llamar "carts".

export default cartModel;
