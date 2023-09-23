/* eslint-disable max-len */

const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

const fakeIdGenerator = () => '123';

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply and return added reply correctly', async () => {
      // Arrange
      const addReplyPayload = new AddReply({
        content: 'Dicoding Indonesia',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(addReplyPayload);

      // Assert
      const reply = await RepliesTableTestHelper.getReplyById(addedReply.id);
      expect(reply).toHaveLength(1);
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'Dicoding Indonesia',
        owner: 'user-123',
      }));
    });
  });

  describe('deleteReplyById', () => {
    it('should throw NotFoundError when reply not found', () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(replyRepositoryPostgres.deleteReplyById('reply-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should delete reply when is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.deleteReplyById('reply-123');

      // Assert
      const reply = await replyRepositoryPostgres.getReplyById('reply-123');
      expect(reply).toBeDefined();
      expect(reply.isdelete).toEqual(true);
    });
  });

  describe('getRepliesByThreadId', () => {
    it('should return replies when is found', async () => {
      // Arrange
      const addUserPayload1 = {
        id: 'user-123',
        username: 'dicoding',
      };
      const addUserPayload2 = {
        id: 'user-127',
        username: 'indonesia',
      };
      const addReplyPayload1 = {
        id: 'reply-124',
        owner: 'user-123',
        content: 'Bukan kak',
        commentid: 'comment-123',
        date: '2021-08-08T06:59:18.982Z',
      };
      const addReplyPayload2 = {
        id: 'reply-123',
        owner: 'user-127',
        content: 'Iya kah',
        threadid: 'comment-123',
        date: '2021-08-08T09:59:18.982Z',
      };
      await UsersTableTestHelper.addUser(addUserPayload1);
      await UsersTableTestHelper.addUser(addUserPayload2);
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addReply(addReplyPayload1);
      await RepliesTableTestHelper.addReply(addReplyPayload2);
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId('thread-123');

      // Assert
      expect(replies).toBeDefined();
      expect(replies).toHaveLength(2);

      // Assert Comment 0
      expect(replies[0].id).toEqual('reply-124');
      expect(replies[0].content).toEqual('Bukan kak');
      expect(replies[0].date).toEqual('2021-08-08T06:59:18.982Z');
      expect(replies[0].isdelete).toEqual(false);
      expect(replies[0].username).toEqual('dicoding');

      // Assert Comment 1
      expect(replies[1].id).toEqual('reply-123');
      expect(replies[1].content).toEqual('Iya kah');
      expect(replies[1].date).toEqual('2021-08-08T09:59:18.982Z');
      expect(replies[1].isdelete).toEqual(false);
      expect(replies[1].username).toEqual('indonesia');
    });
  });

  describe('getReplyById', () => {
    it('should throw NotFoundError when reply not found', () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(replyRepositoryPostgres.getReplyById('reply-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return reply when is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      // Action
      const reply = await replyRepositoryPostgres.getReplyById('reply-123');

      // Assert
      const replyTest = await RepliesTableTestHelper.getReplyById('reply-123');
      expect(reply).toBeDefined();
      expect(replyTest).toHaveLength(1);
    });
  });

  describe('verifyReplyExistById', () => {
    it('should throw NotFoundError when reply not found', () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(replyRepositoryPostgres.verifyReplyExistById('reply-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply is found', async () => {
      // Arrange
      const replyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addReply({ id: replyId });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      return expect(replyRepositoryPostgres.verifyReplyExistById(replyId))
        .resolves
        .not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner', () => {
    beforeEach(async () => {
      // Arrange User
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-127',
        username: 'indonesia',
      });

      // Arrange Thread, Comment & Reply
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-127',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: 'user-123',
      });
    });

    it('should throw AuthorizationError when user is not the reply owner', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-127'))
        .rejects
        .toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when user is the reply owner', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      return expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'))
        .resolves
        .not.toThrowError(NotFoundError);
    });
  });
});
