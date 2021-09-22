const InvariantError = require('../../exceptions/InvariantError');
const { CollaborationPayloadaSchema } = require('./schema');

const CollaborationsValidator = {
    validateCollaborationPayload: (payload) => {
        const validateResult = CollaborationPayloadaSchema.validate(payload);

        if (validateResult.error) {
            throw new InvariantError(validateResult.error.message);
        }
    },
};

module.exports = CollaborationsValidator;
