var express = require('express');
var router = express.Router();
const uid2 = require('uid2');
const Users = require('../models/user')
const orders = require('../models/orders');


router.post('/', (req, res) => {
    const {idUser, idJob, idJobTask,status, price, IdAddress} = req.body
    let date = req.body.date
    if (!date) {
        date = new Date();
    }
    
    if( idUser && idJob && idJobTask && date && status  && price && IdAddress) {
        const newOrders = new orders({
            idUser: idUser,
            idJob: idJob,
            idJobTask: idJobTask,
            Date: date,
            status: status,
            price: price, 
            IdAddress: IdAddress

        })
        newOrders.save()
        .then(data =>{res.json({ result: true, data : data})})
    } else {
        res.json({ result: false})

    }
    
}
      )
   
      module.exports = router;
