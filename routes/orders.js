var express = require('express');
var router = express.Router();
const uid2 = require('uid2');
const User = require('../models/user')
const orders = require('../models/orders');


router.post('/', (req, res) => {
    const { idUser, idJob, idJobTask, /*status, price, idAddress */ } = req.body
    let date = req.body.date
    if (!date) {
        date = new Date();
    }


    if (idUser && idJob && idJobTask && date /*&& status && price && IdAddress */) {

        const newOrders = new orders({
            idUser: idUser,
            idJob: idJob,
            idJobTask: idJobTask,
            Date: date,
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
