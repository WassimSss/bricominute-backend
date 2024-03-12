const mongoose = require('mongoose');
const professionalInfoSchema = mongoose.Schema({
    company_name: String,
    description: String,
    specialities: Array,
    kbis: String,
    insurance_certificate: String,
    isOnline: Boolean,
    disponibilities: Array,
    position: Object,
    requestIdOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
    rejectedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'orders' }]
});



const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
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