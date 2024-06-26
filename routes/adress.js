var express = require('express');
const fetch = require('node-fetch')
var router = express.Router();
const uid2 = require('uid2');
const Users = require('../models/user')
const Address = require('../models/adresse');
const User = require('../models/user');

router.post('/', async (req, res) => {
    const { street_number, street, zip_code, city, token } = req.body

    const user = await User.findOne({ token: token })

    // Ajouter verif si user existe pas return flse
    if (street_number && street && zip_code && city) {
        const newAdress = new Address({
            idUser: user._id,
            street_number: street_number,
            street: street,
            zip_code: zip_code,
            city: city,
        })
        newAdress.save()
            .then(res.json({
                result: true, address: newAdress
            }))
    } else {
        res.json({ result: false })

    }

}
)

// recuperer lat et la longitude de l'adresse avec son id
router.get('/:idAddress', async (req, res) => {
    try {
        console.log(req.params.idAddress);
        console.log(typeof req.params.idAddress);
        const data = await Address.findOne({ _id: req.params.idAddress });

        if (data) {
            const apiResponse = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${data.street_number}+${data.street.replaceAll(' ', '+')}&postcode=${data.zip_code}`);
            const apiResponseJson = await apiResponse.json();

            console.log('features : ', apiResponseJson.features[0]);

            const longitude = apiResponseJson.features[0].geometry.coordinates[0];
            const latitude = apiResponseJson.features[0].geometry.coordinates[1];
            const street = data.street_number + ' ' + data.street;

            console.log('res: ', { result: true, longitude, latitude, street });
            res.json({ result: true, longitude, latitude, street });
        } else {
            res.json({ result: false, message: "Adresse non trouvée" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});

module.exports = router;
