/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesTableTestHelper = {
  async addLike({ id = 'like-123', commentid = 'comment-123', owner = 'user-123' }) {
    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3)',
      values: [id, commentid, owner],
    };
    await pool.query(query);
  },

  async getLikeByCommentIdAndOwner(commentId, owner) {
    const query = {
      text: 'SELECT * FROM likes WHERE commentid = $1 and owner = $2',
      values: [commentId, owner],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM likes WHERE 1=1');
  },
};

module.exports = LikesTableTestHelper;
