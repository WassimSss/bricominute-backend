var express = require('express');
var router = express.Router();

const User = require('../models/user');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

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


