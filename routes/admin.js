var express = require('express');
var router = express.Router();


var express = require('express');
var router = express.Router();

const uid2 = require('uid2');
const jobTask = require('../models/JobTask');
const JobBranch = require('../models/JobBranch');

router.post('/JobBranch', (req, res) => {
    const { name } = req.body
    if (name) {
        const newJobBranch = new JobBranch({
            name: name,
        })
        newJobBranch.save()
            .then(res.json({ result: true }))
    }
    else {
        res.json({ result: false })
    }
}
)



router.post('/JobTasks', (req, res) => {
    const { IdJob, name, price } = req.body
    console.log(req.body);
    if(name !== undefined && IdJob !== undefined  && price !== undefined ){
        const newJobTasks = new jobTask({
            name: name,
            IdJob: IdJob,
            price: price
        })
            newJobTasks.save()
            .then(res.json({ result: true }))
    
    }
    else{
            res.json({result: false})
    }
}  
)
module.exports = router;

