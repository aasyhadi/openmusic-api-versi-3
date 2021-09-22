const InvariantError = require('../../exceptions/InvariantError');
const { PlaylistSongPayloadSchema } = require('./schema');

const PlaylistValidator = {
    // Validate playlist song payload
    validatePlaylistSongPayload: (payload) => {
        const validationResult = PlaylistSongPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = PlaylistValidator;
