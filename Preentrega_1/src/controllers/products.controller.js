import productModel from "../models/product.js";

export const getProducts = async (req, res) => {
  try {
    const { limit, page, metFilter, filter, ord } = req.query; //Datos que vienen en la query. Vamos a usar paginate.
    //metFilter indica por qué voy a filtrar (status, category, etc), y filter es el filtro (el valor).
    const pag = page !== undefined ? page : 1; //Si page es distinto de undefined, pag vale eso; si no, vale 1.
    const limi = limit !== undefined || limit !== null ? limit : 10;
    //Lo 2de limit !== null es poque si dice &limit= va a tomar limit como 0.
    //{[category]: "lacteos"} o {[status]: "true"}
    const filQuery = metFilter !== undefined ? { [metFilter]: filter } : {}; //{} indica que no filtro.
    const ordQuery = ord !== undefined ? { price: ord } : {}; //Sólo ordenamos por precio.
    //Si en la query estuviese también un metOrder, haríamos lo mismo que con filter:
    //const ordQuery = metOrder !== undefined ? {metOrder: ord} : {};

    //paginate(filtro, opciones)
    const prods = await productModel.paginate(filQuery, {
      limit: limi,
      page: pag,
      ordQuery,
      lean: true,
      //Esto se pone antes de enviar los datos, para que los mismos sean PLANOS y puedan visualizarse bien.
    });

    //Agrega otro atributo. Genera un vector cuya longitud es el número total de páginas.
    prods.pageNumbers = Array.from({ length: prods.totalPages }, (_, i) => ({
      //Después de la coma pone una función.
      number: i + 1, //El número de página en la que estoy (debe empezar en 0).
      isCurrent: i + 1 === prods.page, //Que esté en la página donde yo me estoy ubicando.
      limit: limi,
      //Si no pongo esto, {{prods.limit}} en {{#each prods.pageNumbers}} quedaba vacío, como ?limit=
    }));

    console.log(prods);

    res.status(200).render("templates/home", { prods }); //En /home van a estar la vista de los productos.
  } catch (error) {
    //console.log(error);
    res.status(500).render("templates/error", { error });
  }
};

export const getProduct = async (req, res) => {
  try {
    const idProd = req.params.pid;
    const prod = await productModel.findById(pid);
    if (prod) {
      res.status(200).render("templates/product", { prod });
    } else {
      res
        .status(404)
        .render("templates/error", { error: "Producto no encontrado." });
    }
  } catch (error) {
    res.status(500).render("templates/error", { error });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = req.body;
    const rta = await productModel.create(product);
    res.status(201).send("Producto creado.");
    //No puede redirigir a home porque el cliente no puede crear productos.
  } catch (error) {
    res.status(500).send(error);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const idProd = req.params.pid;
    const updatedProduct = req.body;
    const rta = await productModel.findByIdAndUpdate(idProd, updatedProduct);
    if (rta) {
      res.status(200).render("templates/home", { rta });
    } else {
      res
        .status(404)
        .render("templates/error", { error: "Producto no encontrado." });
    }
  } catch (error) {
    res.status(500).render("templates/error", { error });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const idProd = req.params.pid;
    const rta = await productModel.findByIdAndDelete(idProd);
    if (rta) {
      res.status(200).render("templates/home", { rta });
    } else {
      res
        .status(404)
        .render("templates/error", { error: "Producto no encontrado." });
    }
  } catch (error) {
    res.status(500).render("templates/error", { error });
  }
};
