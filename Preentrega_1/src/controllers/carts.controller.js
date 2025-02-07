import cartModel from "../models/cart.js";

export const getCart = async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await cartModel.findOne({ _id: cartId });
    if (cart) {
      res.status(200).send(cart);
    } else {
      //Es casi imposible que no lo encuentres, porque todos tienen uno, y deleteCart lo vacía, no lo elimina.
      res.status(404).send("Carrito no encontrado.");
    }
  } catch (error) {
    res.status(500).render("templates/error", { error });
  }
};

export const createCart = async (req, res) => {
  try {
    const rta = await cartModel.create({ products: [] }); //No sé si hace falta. Se crea vacío por defecto.
    res.status(201).send(rta);
  } catch (error) {
    res.status(500).render("templates/error", { error });
  }
};

export const insertProductCart = async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const { quantity } = req.body;
    const cart = await cartModel.findOne({ _id: cartId });
    if (cart) {
      const indice = cart.products.findIndex(
        (prod) => prod.id_prod === productId
      ); //Para ver si el producto ya está en el carrito.
      if (indice !== -1) {
        //Si el índice existe.
        cart.products[indice].quantity = quantity; //Sobreescribo la cantidad, no la sumo.
      } else {
        cart.products.push({ id_prod: productId, quantity: quantity });
      }
      const rta = await cartModel.findByIdAndUpdate(cartId, cart);
      return res.status(200).send(rta);
    } else {
      res.status(404).send("Carrito no encontrado.");
    }
  } catch (error) {
    res.status(500).render("templates/error", { error });
  }
};

export const updateProductCart = async (req, res) => {
  try {
    const cartId = req.params.cid;
    const { newProducts } = req.body;
    const cart = await cartModel.findOne({ _id: cartId });
    cart.products = newProducts;
    cart.save();
    res.status(400).send(cart);
  } catch (error) {
    res.status(500).render("templates/error", { error });
  }
};

export const updateQuantityProductCart = async (req, res) => {
  //Casi igual a insertProductCart
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const { quantity } = req.body;
    const cart = await cartModel.findOne({ _id: cartId });
    if (cart) {
      const indice = cart.products.findIndex(
        (prod) => prod.id_prod === productId
      ); //Para ver si el producto ya está en el carrito.
      if (indice !== -1) {
        //Si el índice existe.
        cart.products[indice].quantity = quantity; //Sobreescribo la cantidad, no la sumo.
        //No se recomienda sumar porque se podría superar el stock disponible.
        cart.save(); //Guardo los cambios en el carrito.
        res.status(200).send(cart);
      } else {
        //Si el producto no está, no lo agrego como en la otra función.
        res.status(404).send("Producto no encontrado.");
      }
    } else {
      res.status(404).send("Carrito no encontrado.");
    }
  } catch (error) {
    res.status(500).render("templates/error", { error });
  }
};

export const deleteProductCart = async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const cart = await cartModel.findOne({ _id: cartId });
    if (cart) {
      const indice = cart.products.findIndex(
        (prod) => prod.id_prod === productId
      ); //Para ver si el producto ya está en el carrito.
      if (indice !== -1) {
        //Si el índice existe.
        cart.products.splice(indice, 1); //Recorto 1 elemento empezando desde ese índice.
        cart.save();
        res.status(200).send(cart);
      } else {
        res.status(404).send("Producto no encontrado en el carrito.");
      }
    } else {
      res.status(404).send("Carrito no encontrado.");
    }
  } catch (error) {
    res.status(500).render("templates/error", { error });
  }
};

//Vaciar carrito. NO se puede eliminar porque está atado a un usuario.
//Para hacerlo, tendría que eliminar al usuario y se borrarían ambos.
export const deleteCart = async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await cartModel.findOne({ _id: cartId });
    if (cart) {
      cart.products = [];
      cart.save(); //Actualiza el carrito en la base de datos.
      res.status(200).send(cart);
    } else {
      res.status(404).send("El carrito no existe.");
    }
  } catch (error) {
    res.status(500).render("templates/error", { error });
  }
};
