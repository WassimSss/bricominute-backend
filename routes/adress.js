var express = require('express');
var router = express.Router();
const uid2 = require('uid2');
const Users = require('../models/user')
const Address = require('../models/adresse')

router.post('/', (req, res) => {
    const {idUser, street_number, street, zip_code, city} = req.body

    if(idUser && street_number && street  && zip_code  && city) {
        const newAdress = new Address({
            idUser: idUser,
            street_number:street_number,
             street: street,
              zip_code: zip_code,
              city: city, 
        })
        newAdress.save()
        .then(res.json({ result: true}))
    } else {
        res.json({ result: false})

    }
    
}
      )
   
      module.exports = router;
