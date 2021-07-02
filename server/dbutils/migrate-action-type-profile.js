const mongoose = require('mongoose')
const db = require('../db')
const UserAction = require('../models/UserAction')

db.connect(mongoose, function() {
  console.log('Migrating db...')
  UserAction.deleteMany({
    actionType: 'PROFILE',
    user: { $exists: false }
  })
    .then(() => {
      return UserAction.updateMany(
        { actionType: 'PROFILE' },
        { actionType: 'ACCOUNT' }
      )
    })
    .catch(err => {
      if (err) {
        console.log(err)
      }
    })
    .finally(() => {
      console.log('disconnecting')
      mongoose.disconnect()
    })
})
