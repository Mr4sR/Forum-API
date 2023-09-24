const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

const fakeIdGenerator = () => '123';

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike', () => {
    it('should persist add like and return added like correctly', async () => {
      // Arrange
      const useCasePayload = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        owner: 'user-123',
      };

      await UsersTableTestHelper.addUser({ id: useCasePayload.owner });
      await ThreadsTableTestHelper.addThread({ id: useCasePayload.threadId });
      await CommentsTableTestHelper.addComment({ id: useCasePayload.commentId });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addLike(useCasePayload.commentId, useCasePayload.owner);

      // Assert
      const like = await LikesTableTestHelper
        .getLikeByCommentIdAndOwner(useCasePayload.commentId, useCasePayload.owner);
      expect(like).toHaveLength(1);
    });
  });

  describe('deleteLike', () => {
    it('should delete like from comment by commentId and owner correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await LikesTableTestHelper.addLike({ id: 'like-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.deleteLike('comment-123', 'user-123');

      // Assert
      const like = await LikesTableTestHelper.getLikeByCommentIdAndOwner('comment-123', 'user-123');
      expect(like).toHaveLength(0);
    });
  });

  describe('getLikesByCommentId', () => {
    it('should return likes count when is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await LikesTableTestHelper.addLike({ id: 'like-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const likes = await likeRepositoryPostgres.getLikesByCommentId('comment-123');

      // Assert
      expect(likes).toBeDefined();
      expect(likes).toEqual(1);
    });
  });

  describe('verifyLikeExist', () => {
    it('should throw TRUE when user already like the comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await LikesTableTestHelper.addLike({ commentid: 'comment-123', owner: 'user-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const likeExist = await likeRepositoryPostgres.verifyLikeExist('comment-123', 'user-123');

      // Assert
      expect(likeExist).toBeDefined();
      expect(likeExist).toEqual(true);
    });

    it('should throw FALSE when user is not like the comment', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const likeExist = await likeRepositoryPostgres.verifyLikeExist('comment-123', 'user-123');

      // Assert
      expect(likeExist).toBeDefined();
      expect(likeExist).toEqual(false);
    });
  });
});
