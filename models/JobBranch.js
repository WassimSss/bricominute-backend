const mongoose = require('mongoose');

const JobBranchSchema = mongoose.Schema({
    name: String,
});
  const JobBranch = mongoose.model('JobBranch', JobBranchSchema);
module.exports = JobBranch;