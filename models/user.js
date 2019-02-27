const mongoose = require('mongoose');
//const AutoIncrement = require('mongoose-sequence')(mongoose);
//  pages schema
const UsersSchema = new mongoose.Schema({
  username:{
    type: String,
    required: true
  },
  exercise: { 
          description: String,
          duration: String,
          date: String, },
  log: [],
  count: Number,
});
//UserSchema.plugin(AutoIncrement, {inc_field: 'index'});
mongoose.plugin(UsersSchema => { UsersSchema.options.usePushEach = true });
const User = mongoose.model('User', UsersSchema);

module.exports = User;