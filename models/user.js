const mongoose = require('mongoose');
const professionalInfoSchema = mongoose.Schema({
    company_name: String,
    description: String,
    specialities: Array,
    kbis: String,
    insurance_certificate: String,
    isOnline: Boolean,
    isOnService: Boolean,
    disponibilities: Array
});



const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    isPro: Boolean,
    token: String,
    rating: Array,
    professionalInfo: professionalInfoSchema
  
});

const User = mongoose.model('user', userSchema);

module.exports = User;