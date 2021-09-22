const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { mapDBToPlaylist } = require('../../utils');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
    constructor(collaborationService, cacheService) {
        this._pool = new Pool();
        this._collaborationService = collaborationService;
        this._cacheService = cacheService;
    }

    async addPlaylist({ name, owner }) {
        const id = `playlist-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, name, owner],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('Playlist gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    async getPlaylists(owner) {
        const query = {
            text: `SELECT playlists.id, playlists.name, users.username FROM playlists
            LEFT JOIN users ON users.id = playlists.owner
            LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
            WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
            values: [owner],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }

    async getPlaylistById(id) {
        const query = {
            text: `SELECT playlists.*, users.username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1`,
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }
        return result.rows.map(mapDBToPlaylist)[0];
    }

    async editPlaylistById(id, { name }) {
        const query = {
            text: 'UPDATE playlists SET name = $1, WHERE id = $2 RETURNING id',
            values: [name, id],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError('Gagal memperbarui playlist.Id tidak ditemukan');
        }
    }

    async deletePlaylistById(id) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError(
                'Playlist gagal dihapus. Id tidak ditemukan',
            );
        }
    }

    async verifyPlaylistOwner(id, owner) {
        const query = {
            text: 'SELECT owner FROM playlists WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }
        const playlist = result.rows[0];
        if (playlist.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

    async verifyPlaylistAccess(id, userId) {
        try {
            await this.verifyPlaylistOwner(id, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            try {
                await this._collaborationService.verifyCollaborator(
                    id,
                    userId,
                );
            } catch {
                throw error;
            }
        }
    }

    // Playlist

    async addPlaylistSong(playlistId, songId) {
        const id = `playlistsong-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId],
        };

        await this._cacheService.delete(`songs:${playlistId}`);
        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('Lagu gagal ditambahkan ke playlist');
        }
    }

    async getPlaylistSongs(playlistId) {
        try {
            // mendapatkan catatan dari cache
            const result = await this._cacheService.get(`songs:${playlistId}`);
            return JSON.parse(result);
        } catch (error) {
            const query = {
                text: `SELECT songs.id, songs.title, songs.performer FROM songs
                LEFT JOIN playlistsongs ON songs.id = playlistsongs.song_id
                WHERE playlistsongs.playlist_id = $1`,
                values: [playlistId],
            };
            const result = await this._pool.query(query);

            // Set Cache
            await this._cacheService.set(
                `songs:${playlistId}`,
                JSON.stringify(result.rows),
            );

            return result.rows;
        }
    }

    async deletePlaylistSongById(playlistId, songId) {
        const query = {
            text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new InvariantError('Lagu gagal dihapus dari playlist.Id lagu tidak ditemukan');
        }
        await this._cacheService.delete(`songs:${playlistId}`);
    }
}

module.exports = PlaylistsService;
