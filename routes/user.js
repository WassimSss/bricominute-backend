var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/user');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const uniqid = require('uniqid');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');


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
  if (!checkBody(req.body, ['firstName', 'lastName', 'email', 'password', ])) {
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


  //route qui permet la connection d'un particulier
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



module.exports = router;
