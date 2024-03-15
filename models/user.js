const mongoose = require('mongoose');
const professionalInfoSchema = mongoose.Schema({
    company_name: String,
    description: String,
    specialities: Array,
    kbis: String,
    insurance_certificate: String,
    rib: String,
    isOnline: Boolean,
    disponibilities: Array,
    position: {
        latitude: Number,
        longitude: Number
    },
    requestIdOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
    rejectedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'orders' }],
    money: Number
});



const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    // idOrder dans le user si il est remplie par l'id d'une order
    // chez un particulier sa veut dire qu'il a fait une demande d'order
    // si c'est chez un pro ça veut dire qu'il a une mission en cours
    idOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
    email: String,
    password: String,
    isPro: Boolean,
    token: String,
    rating: Array,
    isOnService: Boolean,
    professionalInfo: professionalInfoSchema

});

const User = mongoose.model('user', userSchema);

module.exports = User;