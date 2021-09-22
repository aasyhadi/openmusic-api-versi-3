const Joi = require('joi');

const PlaylistSongPayloadSchema = Joi.object({
    name: Joi.string().required(),
});

module.exports = { PlaylistSongPayloadSchema };
