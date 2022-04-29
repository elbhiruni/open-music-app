class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postLikeAlbumHandler = this.postLikeAlbumHandler.bind(this);
    this.getLikesAlbumHandler = this.getLikesAlbumHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year, cover = null } = request.payload;

    const albumId = await this._service.addAlbum({ name, year, cover });

    const response = h.response({
      status: 'success',
      message: 'Menambahkan album',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const songs = await this._service.getSongsByAlbumId(id);
    return {
      status: 'success',
      data: {
        album: {
          ...album,
          songs,
        },
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postLikeAlbumHandler(request, h) {
    const { albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.verifyAlbum(albumId);
    const likes = await this._service.getLikes(userId, albumId);

    if (likes > 0) {
      await this._service.deleteLikeToAlbum(userId, albumId);
      const response = h.response({
        status: 'success',
        message: 'Batal menyukai album',
      });
      response.code(201);
      return response;
    }

    await this._service.addLikeToAlbum(userId, albumId);
    const response = h.response({
      status: 'success',
      message: 'Menyukai album',
    });
    response.code(201);
    return response;
  }

  async getLikesAlbumHandler(request, h) {
    const { albumId } = request.params;
    const { likes, cache } = await this._service.getAlbumLikes(albumId);
    const result = Number(likes);
    const response = h.response({
      status: 'success',
      data: {
        likes: result,
      },
    });
    if (cache) {
      response.header('X-Data-Source', 'cache');
    }
    response.code(200);
    return response;
  }
}

module.exports = AlbumsHandler;
