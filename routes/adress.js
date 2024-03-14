var express = require('express');
const fetch = require('node-fetch')
var router = express.Router();
const uid2 = require('uid2');
const Users = require('../models/user')
const Address = require('../models/adresse')

router.post('/', (req, res) => {
    const { idUser, street_number, street, zip_code, city } = req.body

    if (idUser && street_number && street && zip_code && city) {
        const newAdress = new Address({
            idUser: idUser,
            street_number: street_number,
            street: street,
            zip_code: zip_code,
            city: city,
        })
        newAdress.save()
            .then(res.json({ result: true }))
    } else {
        res.json({ result: false })

    }

}
)

// recuperer lat et la longitude de l'adresse avec son id
router.get('/:idAddress', (req, res) => {

    Address.findOne({ _id: req.params.idAddress })
        .then(async data => {
            if (data) {

                const apiResponse = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${data.street_number}+${data.street.replaceAll(' ', '+')}&postcode=${data.zip_code}`)
                const apiResponseJson = await apiResponse.json()
                // await db.collection('collection').insertOne(apiResponseJson)
                const longitude = apiResponseJson.features[0].geometry.coordinates[0]
                const latitude = apiResponseJson.features[0].geometry.coordinates[1]
                const street = data.street_number + ' ' + data.street
                res.json({ result: true, longitude, latitude, street });
            } else {
                res.json({ result: false, message: "Adresse non trouvée" });
            }
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ error: "Erreur interne du serveur" });
        });
});

module.exports = router;
