const mongoose = require('mongoose');
const professionalInfoSchema = mongoose.Schema({
    company_name: String,
    description: String,
    specialities: Array,
    kbis: String,
    insurance_certificate: String,
<<<<<<< HEAD
    rib: String,
    isOnline: Boolean,
    disponibilities: Array,
    position: Object
=======
    isOnline: Boolean,
    disponibilities: Array,
    position: Object,
    requestIdOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
    rejectedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'orders' }]
>>>>>>> notif-order
});



const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    idOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
    email: String,
    password: String,
    isPro: Boolean,
    token: String,
<<<<<<< HEAD
    rating: Array,    
=======
    rating: Array,
>>>>>>> notif-order
    isOnService: Boolean,
    professionalInfo: professionalInfoSchema

});

const User = mongoose.model('user', userSchema);

module.exports = User;