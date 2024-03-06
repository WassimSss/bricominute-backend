const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    idJob: Array,
    idJobTask: Array,
    Date: Date,
    status: Boolean,
    price: Number,
    IdAdress: { type: mongoose.Schema.Types.ObjectId, ref: 'address'},
});


  const Order = mongoose.model('orders', orderSchema);

module.exports = Order;