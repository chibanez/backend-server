var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var hospitalSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es obligatorio'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'usuario', required: [true, 'El usuario es obligatorio'] }
}, { collection: 'hospitales' });

module.exports = mongoose.model('Hospital', hospitalSchema);