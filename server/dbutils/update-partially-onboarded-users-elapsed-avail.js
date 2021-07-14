const mongoose = require('mongoose')
const db = require('../db')
const User = require('../models/User')

db.connect(mongoose, function() {
  User.find({ isVolunteer: true })
    .then(listOfUsers => {
      const pendingUpdatedUsers = listOfUsers.map(user => {
        if (!user.isOnboarded) {
          user.elapsedAvailability = 0
          return user.save().catch(e => console.log(e))
        }
      })
      return Promise.all(pendingUpdatedUsers)
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
