import { Schema, model } from "mongoose";

const ticketSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  purchase_datetime: {
    type: Date,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
  },
  purchaser: {
    //Va a tener el correo del comprador
    type: String,
    required: true,
  },
  products: {
    //Productos que se compraron.
    type: Object,
  },
});

const ticketModel = model("tickets", ticketSchema);

export default ticketModel;
