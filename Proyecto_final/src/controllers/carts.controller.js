import cartModel from "../models/cart.js";
import productModel from "./../models/product.js";
import ticketModel from "../models/ticket.js";
import userModel from "../models/users.js";

export const getCart = async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await cartModel.findOne({ _id: cartId }); //Con findById tampoco anda
    console.log(cart);
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
    let { quantity } = req.body;
    if (!quantity) {
      quantity = 1;
    }
    const cart = await cartModel.findOne({ _id: cartId });
    //Uso findOne por como definí el middleware de pre("findOne") (ver modelo cart)
    if (cart) {
      const indice = cart.products.findIndex(
        (prod) => prod.id_prod._id.toString() === productId
      ); //Para ver si el producto ya está en el carrito.
      if (indice !== -1) {
        //Si el índice existe.
        cart.products[indice].quantity = quantity; //Sobreescribo la cantidad, no la sumo.
      } else {
        cart.products.push({ id_prod: productId, quantity: quantity });
      }
      //const rta = await cartModel.findByIdAndUpdate(cartId, cart); //Este find omite los middlewares.
      await cart.save();
      //Hay que hacer un populate manual porque está seteado para las consultas solamente.
      //Si no lo hago así, el producto recién agregado no queda poblado.
      const populatedCart = await cartModel
        .findOne({ _id: cartId })
        .populate("products.id_prod");
      return res.status(200).send(populatedCart);
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
        (prod) => prod.id_prod._id.toString() === productId
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
        //Uso toString() porque si no, vale ObjetId ('.....')
        (prod) => prod.id_prod._id.toString() === productId
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

//Para finalizar la compra
export const checkout = async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await cartModel.findOne({ _id: cartId });
    const prodsSinStock = []; //Voy a guardar los que no tengan stock.

    if (cart) {
      //forEach no espera a que termine, y prodsSinStock queda vacío.
      //Hay que usar for of, que sirve para manejar el asincronismo.
      for (const producto of cart.products) {
        let pId = producto.id_prod._id; //Obtengo el id de cada product
        let prod = await productModel.findOne({ _id: pId }); //Lo busco en la DB
        //console.log(prod._id);
        if (producto.quantity > prod.stock) {
          //Si la cantidad supera el stock
          prodsSinStock.push(prod._id); //Agrego ese producto al vector sin stock.
        }
        //console.log(prodsSinStock);
      }

      if (prodsSinStock.length === 0) {
        //Si no hay productos sin stock, hacer la compra.
        //Generar ticket
        const newTicket = await ticketModel.create({
          code: crypto.randomUUID(), //Genera código aleatorio
          purchaser: req.user.email, //req.user existe porque tengo una sesión activa.
          amount: 0,
          products: cart.products, //Lo que está en el carrito (puedo comprar todos)
          //En realidad convendría mostrar sólo algunos de los campos, como nombre, código y cantidad.
        });

        //Calculo el total de la compra
        newTicket.amount = newTicket.products.reduce((acc, producto) => {
          acc += producto.id_prod.price * producto.quantity;
          return acc;
        }, 0);
        await ticketModel.findByIdAndUpdate(newTicket._id, newTicket);

        //Descuento las cantidades de los stocks en la DB
        cart.products.forEach(async (product) => {
          let prod = await productModel.findById(product.id_prod._id);
          const stock = prod.stock;
          prod.stock = stock - product.quantity;
          await prod.save();
        });

        //Vacío el carrito
        await cartModel.findByIdAndUpdate(cartId, {
          products: [],
        });

        //Devuelvo ticket
        res.status(200).send(newTicket);
      } else {
        //Si está agotado, lo saco del array del carrito.
        prodsSinStock.forEach((pId) => {
          let indice = cart.products.findIndex(
            (prod) => prod.id_prod._id === pId
          );
          cart.products.slice(indice, 1);
          //Otra forma: filtro y me quedo con los que su id no está entre los agotados.
          //cart.products = cart.products.filter((product) => product.id_prod._id !== pId);
        });
        //await cart.save();
        await cartModel.findByIdAndUpdate(cartId, {
          products: cart.products,
        });
        res.status(400).send({
          status: "Los siguientes productos no tienen stock suficiente:",
          result: prodsSinStock,
        });
      }
    } else {
      res.status(404).send("El carrito no existe.");
    }
  } catch (error) {
    res.status(500).render("templates/error", { error });
  }
};
