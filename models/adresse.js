const mongoose = require('mongoose');

const AddressSchema = mongoose.Schema({
    Idusers: { type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    street_number: String,
    street: String,
    zip_code: Number,
    city: String,
});
const Address = mongoose.model('Address', AddressSchema);
module.exports = Address;