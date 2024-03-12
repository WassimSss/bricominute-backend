var express = require('express');
const { model } = require('mongoose');
const User = require('../models/user');
var router = express.Router();



router.post('/', (req, res) => {
  const { token, idPro, rating } = req.body
  User.findOne({ token: token }) 
    .then(data => {
      User.updateOne({_id: idPro}, {$push : {rating: {idUser : data._id, rate: Number(rating)}}})
      .then(
        User.findOne({_id: idPro})
        .then(
          res.json({result: true, user: data})
        )
      )
    })
})


router.get('/:token', (req, res) => {
  const token = req.params.token;

  User.findOne({token: token})
  .then(data => {
    const allRating = data.rating.map(rate => {
      console.log('test :', rate)
      return rate.rate
    })
    let average = 0;

    for (let i = 0; i < allRating.length; i++) {
      average += allRating[i]      
    }

    average = average / allRating.length

    res.json({result: true, average: average })

  })
  // User.aggregate([
  //   { $match: { _id: idPro } }, // Filtrer l'utilisateur par son ID
  //   { $unwind: '$rating' }, // Décomposer le tableau des ratings en documents distincts
  //   {
  //     $group: {
  //       _id: '$_id',
  //       averageRating: { $avg: '$rating.rate' } // Calculer la moyenne des ratings
  //     }
  //   }
  // ])
  // .then(result => {
  //   console.log(result);
  //   if (result.length > 0) {
  //     res.json({ averageRating: result[0].averageRating });
  //   } else {
  //     res.json({ averageRating: 0 }); // Si aucun rating trouvé, retourner 0
  //   }
  // })
  // .catch(err => {
  //   console.error(err);
  //   res.status(500).json({ error: 'Erreur lors du calcul de la moyenne des ratings' });
  // });
});

module.exports = router;