/* eslint-disable no-underscore-dangle */
class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const {
      title, year, performer, genre, duration = null, albumId = null,
    } = request.payload;

    const songId = await this._service.addSong({
      title, year, performer, genre, duration, albumId,
    });

    const response = h.response({
      status: 'success',
      message: 'Menambahkan lagu',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler(request, h) {
    const { title, performer } = request.query;
    const songs = await this._service.getSongs();

    let filteredSong = songs;

    if (title && performer) {
      filteredSong = songs.filter(
        (song) => (song.title.toLowerCase().includes(title.toLowerCase())
        && song.performer.toLowerCase().includes(performer.toLowerCase())),
      );
    } if (title) {
      filteredSong = songs.filter(
        (song) => song.title.toLowerCase().includes(title.toLowerCase()),
      );
    } if (performer) {
      filteredSong = songs.filter(
        (song) => song.performer.toLowerCase().includes(performer.toLowerCase()),
      );
    }

    const response = h.response({
      status: 'success',
      data: {
        songs: filteredSong.map((song) => ({
          id: song.id,
          title: song.title,
          performer: song.performer,
        })),
      },
    });
    response.code(200);
    return response;
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;

    await this._service.editSongById(id, request.payload);

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteSongById(id);
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
