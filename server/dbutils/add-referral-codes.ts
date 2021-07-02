const mongoose = require('mongoose')
const base64url = require('base64url')
const db = require('../db')
const User = require('../models/User')

db.connect(mongoose, function() {
  User.find()
    .then(users => {
      const userUpdates = users.map(user => {
        user.referralCode = base64url(Buffer.from(user.id, 'hex'))
        return user.save()
      })
      return Promise.all(userUpdates)
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
