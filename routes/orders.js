var express = require('express');
var router = express.Router();
const uid2 = require('uid2');


const Users = require('../models/user')
const orders = require('../models/orders');


router.post('/', async (req, res) => {

    try {
       
    const {idUser, idJob, idJobTask,status, price, IdAddress} = req.body
    let date = req.body.date
    if (!date) {
        date = new Date();
    }
    
    if( idUser && /*idPro && */ idJob && idJobTask && date && status && price && IdAddress) {
        const newOrders = new orders({
            idUser: idUser,
            idJob: idJob,
            // idPro: null,
            idJobTask: idJobTask,
            Date: date,
            status: status,
            price: price, 
            IdAddress: IdAddress
        })

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
            
        
    } else {
        // Si des champs requis manquent, renvoie une réponse avec isOnService à false
        res.json({ result: false, message: 'Champs requis manquants' });
}
    } catch (error) {
        console.error(error);
        res.json({ result: false, message: 'Erreur' });
    }
});
      module.exports = router;
