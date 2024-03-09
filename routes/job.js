var express = require('express');
var router = express.Router();
const JobTask = require('../models/JobTask')
const JobBranch = require('../models/JobBranch')

/* GET home page. */
router.get('/', function (req, res) {

    JobBranch.find().then(
        data => {
            res.json({ result: true, data: data })
        }
    )
});

router.get('/getJobTasks/:idJob', function (req, res) {

    JobTask.find({ idJob: req.params.idJob }).then(
        data => {
            res.json({ result: true, data: data })
        }
    )
});

module.exports = router;
