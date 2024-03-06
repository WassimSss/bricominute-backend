const mongoose = require('mongoose');

const JobTaskSchema = mongoose.Schema({
    IdJob: { type: mongoose.Schema.Types.ObjectId, ref: 'job_branch'},
    name: String,
    price: Number
});
  const JobTask = mongoose.model('JobTask', JobTaskSchema);
module.exports = JobTask;