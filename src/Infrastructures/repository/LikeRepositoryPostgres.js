const LikeRepository = require('../../Domains/likes/LikeRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(commentId, owner) {
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3) RETURNING id',
      values: [id, commentId, owner],
    };

    await this._pool.query(query);
  }

  async deleteLike(commentId, owner) {
    const query = {
      text: 'DELETE FROM likes WHERE commentid = $1 AND owner = $2',
      values: [commentId, owner],
    };

    await this._pool.query(query);
  }

  async getLikesByCommentId(commentId) {
    const query = {
      text: 'SELECT COUNT(*) FROM likes WHERE commentid = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return Number(result.rows[0].count);
  }

  async verifyLikeExist(commentId, owner) {
    const query = {
      text: 'SELECT * FROM likes WHERE commentid = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) return false;
    return true;
  }
}

module.exports = LikeRepositoryPostgres;
