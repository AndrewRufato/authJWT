const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Criando o modelo corretamente antes de exportá-lo
const User = mongoose.model('User', UserSchema);

module.exports = User;

