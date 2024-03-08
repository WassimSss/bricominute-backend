var express = require('express');
var router = express.Router();
const uid2 = require('uid2');


const Users = require('../models/user')
const orders = require('../models/orders');



//router.get('/isOnService', (req, res) => {
  //  Place.find({nickname : req.params.nickname}).then(data => {res.json({result : true , places: data})})
  //})   

  router.post('/', async (req, res) => {
    const {idUser, idJob, idJobTask, status, price, IdAddress} = req.body;
    let date = req.body.date;

    // Vérifie si la date existe, sinon utilise la date actuelle
    if (!date) {
        date = new Date();
    }
    
    console.log(idUser , idJob , idJobTask , date , status !== undefined , price !== undefined  , IdAddress);
    if (idUser && idJob && idJobTask && date && status !== undefined && price !== undefined  && IdAddress) {
        try {
            // Recherche l'utilisateur par son ID


            // Crée une nouvelle commande
            const newOrders = new orders({
                idUser: idUser,
                idJob: idJob,
                idJobTask: idJobTask,
                Date: date,
                status: status,
                price: price, 
                IdAddress: IdAddress
            });

            // Enregistre la nouvelle commande
            const data = await newOrders.save();

            const user = await Users.findById(idUser);

            // Si l'utilisateur est trouvé, met à jour isOnService à true, sinon à false
            if (user) {
                Users.updateOne({_id: idUser}, {isOnService: true}).then(
                    data => {
                        console.log('data : ', data);
                    }
                )
                // console.log(user);
                // await user.save();
            } else {
                // Si l'utilisateur n'est pas trouvé, renvoie une réponse avec isOnService à false
                res.json({ result: false, message: 'Utilisateur non trouvé' });
                return;
            }

            // Renvoie une réponse avec isOnService à true
            res.json({ result: true, data: data });
        } catch (error) {
            console.error(error);
            res.json({ result: false, message: 'Erreur' });
        }
    } else {
        // Si des champs requis manquent, renvoie une réponse avec isOnService à false
        res.json({ result: false, message: 'Champs requis manquants' });
}
});
      module.exports = router;
