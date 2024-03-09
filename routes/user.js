var express = require('express');
var router = express.Router();

const User = require('../models/user');
const Orders = require('../models/orders')
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const uniqid = require('uniqid');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const geolib = require('geolib');

// const { map } = require('lodash');



router.post('/upload', async (req, res) => {
  const pdfPaths = [];

  try {
    // Itérer sur tous les fichiers dans la requête
    for (let i = 1; i <= 3; i++) {
      const pdfPath = `./tmp/${uniqid()}.pdf`;
      const resultMove = await req.files[`selectionPDF${i}`].mv(pdfPath);

      if (!resultMove) {
        pdfPaths.push(pdfPath);
      } else {
        // Si le déplacement du fichier échoue, annulez l'opération
        throw new Error(resultMove);
      }
    }

    // Uploader tous les fichiers sur Cloudinary
    const uploadPromises = pdfPaths.map(async (path) => {
      const resultCloudinary = await cloudinary.uploader.upload(path);
      return resultCloudinary.secure_url;
    });

    // Attendre que toutes les opérations d'upload soient terminées
    const uploadedUrls = await Promise.all(uploadPromises);

    // Supprimer les fichiers locaux après l'upload
    pdfPaths.forEach((path) => fs.unlinkSync(path));

    res.json({ result: true, urls: uploadedUrls });
  } catch (error) {
    // Gérer les erreurs
    res.json({ result: false, error: error.message });
  }
});



// route qui permet l'inscription d'un particulier
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


router.put('/changeIsOnline/:idUser', async (req, res) => {
  // console.log('coucou');
  // // Récupère l'ID du professionnel à partir des paramètres de l'URL
  // const professionalId = req.params.idUser;


  // // Recherche et met à jour le professionnel par son ID
  // User.findOne({_id: professionalId})
  // .then(data => {
  //   if(data){
  //     console.log(data.isOnline, !data.isOnline);
  //     User.updateOne({email: data.email}, {isOnline: !data.isOnline})
  //     .then(data => {
    
  //       res.json({result: true, user: data})
  //     })
  //   } else {
  //     res.json({result: false, error: 'Utilisateur non trouvé'})
  //   }
    

  // })

  try {
    const professionalId = req.params.idUser;
    const user = await User.findOne({ _id: professionalId });

    if (!user) {
      return res.json({ result: false, error: 'Utilisateur non trouvé' });
    }

    // Inverse la valeur de isOnline
    user.isOnline = !user.isOnline;
    await user.save();

    res.json({ result: true, user });
  } catch (error) {
    console.error('Erreur lors de la mise à jour :', error);
    res.status(500).json({ result: false, error: 'Erreur serveur' });
  }
});


// recuperer la propriete isOnline du pro grace a son id
router.get('/isOnline/:idUser', async (req, res) => {
  // Chercher le user
  const professionalId = req.params.idUser;

  try {
    const user = await User.findOne({_id:professionalId })

    if(!user){
      return res.json({ result: false, error: 'Utilisateur non trouvé' });
    }

    console.log(user);
    res.json({result: true, isOnline: user.isOnline})
  } catch (error) {
    console.error('Erreur lors de la mise à jour :', error);
    res.status(500).json({ result: false, error: 'Erreur serveur' });
  }
  // Renvoyer la reponse isOnline
})



// Recuperer le isOnService du user grace a un id

router.get('/getIsOnService/:idUser', async (req, res) => {
  try {
    const user = await User.findOne({_id : req.params.idUser})
    
    if(!user){
      return res.json({result : false, error: 'User non trouvé'})
    }
    
    res.json({result: true, isOnService: user.isOnService})

  } catch (error) {
    
  }

})
module.exports = router;


