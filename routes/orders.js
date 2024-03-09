var express = require('express');
var router = express.Router();
const uid2 = require('uid2');
<<<<<<< HEAD


const Users = require('../models/user')
const orders = require('../models/orders');


router.post('/', async (req, res) => {

    try {
       
    const {idUser, idJob, idJobTask,status, price, IdAddress} = req.body
=======
const User = require('../models/user')
const orders = require('../models/orders');


router.post('/', (req, res) => {
    const { idUser, idJob, idJobTask, /*status, price, idAddress */ } = req.body
>>>>>>> adress-localisation-pro-consumer
    let date = req.body.date
    if (!date) {
        date = new Date();
    }
<<<<<<< HEAD
    
    if( idUser && /*idPro && */ idJob && idJobTask && date && status && price && IdAddress) {
=======


    if (idUser && idJob && idJobTask && date /*&& status && price && IdAddress */) {

>>>>>>> adress-localisation-pro-consumer
        const newOrders = new orders({
            idUser: idUser,
            idJob: idJob,
            // idPro: null,
            idJobTask: idJobTask,
            Date: date,
<<<<<<< HEAD
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
=======
            status: false, // Pour l'instant en dur
            price: 100, // Pour l'instant en dur
            IdAddress: '65e5ec8fa7d7b53b75681b38' // Pour l'instant en dur
        })
        newOrders.save()
            .then(data => {

                User.updateOne({ _id: idUser }, { idOrder: data._id })
                    .then(
                        res.json({ result: true, data: data })
                    )
            })
    } else {
        res.json({ result: false })

    }

}
)

router.get('/getIdAddress/:idOrder', (req, res) => {
    const idOrder = req.params.idOrder
    const test = '65eb3e887942b0cc296213b0'
    console.log(test == idOrder);
    console.log(test, idOrder);
    console.log('params : ', typeof req.params.idOrder);
    orders.findOne({ _id: idOrder })
        .then(data => {
            console.log('idOrder : ', data);
            if (data) {
                res.json({ result: true, IdAddress: data.IdAddress });
            }

            // Utilisez la propriété IdAddress du document retourné

        })
        .catch(error => {
            console.error('Error while fetching IdAddress:', error);
            res.status(500).json({ result: false, error: 'Internal server error' });
        });
});

// isProFinded
router.get('/isProFinded/:idOrder', (req, res) => {
    orders.findOne({ _id: req.params.idOrder })
        .then(data => {

            if (data.idPro) {
                res.json({ result: true })

            } else {
                res.json({ result: false })

            }
            console.log(data);
            // if(data)
        })
})
module.exports = router;
>>>>>>> adress-localisation-pro-consumer
