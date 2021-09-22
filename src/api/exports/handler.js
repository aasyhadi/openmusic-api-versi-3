class ExportsHandler {
    constructor(producerService, playlistsService, validator) {
        this._producerService = producerService;
        this._playlistsService = playlistsService;
        this._validator = validator;

        this.postExportPlaylistsHandler = this.postExportPlaylistsHandler.bind(this);
    }

    async postExportPlaylistsHandler(request, h) {
        this._validator.validateExportPlaylistsPayload(request.payload);
        const { playlistId } = request.params;
        const { id: userId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

        const message = {
            userId,
            playlistId,
            targetEmail: request.payload.targetEmail,
        };

        await this._producerService.sendMessage(process.env.PLAYLIST_CHANNEL_NAME,
            JSON.stringify(message));

        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda dalam antrean',
        });
        response.code(201);
        return response;
    }
}

module.exports = ExportsHandler;
