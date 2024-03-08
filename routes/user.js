var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/user');
const Orders = require('../models/orders')
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const geolib = require('geolib');

// const { map } = require('lodash');


router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['firstName', 'lastName', 'email', 'password',])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Vérifiez si l'utilisateur n'est pas déjà enregistré
  User.findOne({ email: req.body.email }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash,
        token: uid2(32),
        isPro: req.body.isPro,
      });

      newUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // L'utilisateur existe déjà dans la base de données
      res.json({ result: false, error: 'User already exists' });
    }
  });
});

router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ email: req.body.email }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});

// Rechercher la position de tout les utilisateurs en ligne
// Renvoyer l'utilisateur le plus proche de la position

router.get('/findUserNearbyAndGiveOrder/:lat/:long/:idOrder', async (req, res) => {
  // const locationOrder = JSON.parse(req.params.locationOrder); // Convertir en objet JSON
  const locationOrder = { latitude: req.params.lat, longitude: req.params.long }
  const idOrder = req.params.idOrder

  try {
    // Récupérer tous les utilisateurs en ligne depuis la base de données
    const usersOnline = await User.find({ "professionalInfo.isOnline": true });
    console.log(usersOnline);
    let closestUser = null;
    let minDistance = Infinity;

    // Boucler sur chaque utilisateur
    usersOnline.forEach(user => {
      console.log(user.professionalInfo.position);
      console.log(locationOrder);
      // Calculer la distance entre l'utilisateur et la position de la commande
      const distance = geolib.getDistance(user.professionalInfo.position, locationOrder);
      const distanceInKilometers = geolib.convertDistance(distance, 'km');

      // Mettre à jour l'utilisateur le plus proche si nécessaire
      console.log('distanceInKilometers : ', distanceInKilometers);
      if (distance < minDistance && distanceInKilometers < 500) { // limite a 10km
        closestUser = user;
        minDistance = distanceInKilometers;
      }
    });

    // Renvoyer l'ID de l'utilisateur le plus proche
    if (closestUser) {

      // Upload l'odrer pour ui attribuer le pro trouvé
      Orders.updateOne({ _id: idOrder }, { idPro: closestUser._id })
        .then(
          User.updateOne({ _id: closestUser._id }, { idOrder: idOrder })
            .then(
              // Passer a l'user l'id de la commande en cours
              User.findOne({ _id: closestUser._id })
                .then(data => {
                  res.json({
                    result: true, test: data, user: {
                      firstName: data.firstName,
                      lastName: data.lastName,
                      company_name: data.company_name,
                    }/*userId: closestUser._id, distance: distanceInKilometers */
                  });
                })
            )
        )


      Orders.updateOne({ _id: idOrder }, { idPro: closestUser._id })
    } else {
      res.json({ message: "Aucun utilisateur trouvé." });
    }
  } catch (error) {
    console.error('Erreur lors de la recherche de l\'utilisateur le plus proche :', error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

router.get('/isOnService/:idUser', (req, res) => {
  const idUser = req.params.idUser

  User.findOne({ _id: idUser })
    .then(data => {
      console.log(data);

      if (data.idOrder) {
        res.json({ result: true })

      } else {
        res.json({ result: false })

      }
    })
})


module.exports = router;
