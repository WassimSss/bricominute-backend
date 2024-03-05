const mongoose = require('mongoose');
const professionalInfoSchema = mongoose.Schema({
    company_name: String,
    description: String,
    specialities: Array,
    kbis: String,
    insurance_certificate: String,
    isOnline: Boolean,
    disponibilities: Array
});

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  isPro: Boolean,
  rating: Array,
  professionalInfo: professionalInfoSchema
});

const User = mongoose.model('users', userSchema);

module.exports = User;