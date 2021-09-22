const routes = (handler) => [
    {
        method: 'POST',
        path: '/playlists',
        handler: handler.postToPlaylistHandler,
        options: {
            auth: 'songsapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists',
        handler: handler.getFromPlaylistsHandler,
        options: {
            auth: 'songsapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists/{id}',
        handler: handler.getFromPlaylistByIdHandler,
        options: {
            auth: 'songsapp_jwt',
        },
    },
    {
        method: 'PUT',
        path: '/playlists/{id}',
        handler: handler.putToPlaylistByIdHandler,
        options: {
            auth: 'songsapp_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/playlists/{id}',
        handler: handler.deleteFromPlaylistByIdHandler,
        options: {
            auth: 'songsapp_jwt',
        },
    },

    // Playlist Song
    {
        method: 'POST',
        path: '/playlists/{playlistId}/songs',
        handler: handler.postToPlaylistSongHandler,
        options: {
            auth: 'songsapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists/{playlistId}/songs',
        handler: handler.getFromPlaylistSongsHandler,
        options: {
            auth: 'songsapp_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/playlists/{playlistId}/songs',
        handler: handler.deleteFromPlaylistSongByIdHandler,
        options: {
            auth: 'songsapp_jwt',
        },
    },
];

module.exports = routes;
