/* eslint-disable max-len */

const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

const fakeIdGenerator = () => '123';

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      const addUserPayload = {
        id: 'user-123',
        username: 'dicoding',
      };
      const addThreadPayload = {
        title: 'Dokumen Negara',
        content: 'Dicoding Indonesia',
        owner: 'user-123',
      };
      const addCommentPayload = new AddComment({
        content: 'Dicoding Indonesia',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      await UsersTableTestHelper.addUser(addUserPayload);
      await ThreadsTableTestHelper.addThread(addThreadPayload);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(addCommentPayload);

      // Assert
      const comments = await CommentsTableTestHelper.getCommentById(addedComment.id);
      expect(comments).toHaveLength(1);
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: addedComment.content,
        owner: addUserPayload.id,
      }));
    });
  });

  describe('deleteCommentById', () => {
    it('should throw NotFoundError when comment not found', () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(commentRepositoryPostgres.deleteCommentById('comment-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should delete comment when is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.deleteCommentById('comment-123');

      // Assert
      const comment = await commentRepositoryPostgres.getCommentById('comment-123');
      expect(comment).toBeDefined();
      expect(comment.isdelete).toEqual(true);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should throw NotFoundError when thread not found', () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(commentRepositoryPostgres.getCommentsByThreadId('thread-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return comments when is found', async () => {
      // Arrange
      const addUserPayload1 = {
        id: 'user-123',
        username: 'dicoding',
      };
      const addUserPayload2 = {
        id: 'user-127',
        username: 'indonesia',
      };
      const addThreadPayload = {
        id: 'thread-123',
        owner: 'user-123',
        title: 'Dokumen Negara',
        body: 'Dicoding Indonesia',
      };
      const addCommentPayload1 = {
        id: 'comment-123',
        owner: 'user-127',
        content: 'Nasi Uduk?',
        threadId: 'thread-123',
        date: '2021-08-08T07:59:18.982Z',
      };
      const addCommentPayload2 = {
        id: 'comment-124',
        owner: 'user-123',
        content: 'Bukan kak',
        threadId: 'thread-123',
        date: '2021-08-08T09:59:18.982Z',
      };
      await UsersTableTestHelper.addUser(addUserPayload1);
      await UsersTableTestHelper.addUser(addUserPayload2);
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment(addCommentPayload1);
      await CommentsTableTestHelper.addComment(addCommentPayload2);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toBeDefined();
      expect(comments).toHaveLength(2);

      // Assert Comment 1
      expect(comments[0].id).toEqual('comment-123');
      expect(comments[0].content).toEqual('Nasi Uduk?');
      expect(comments[0].date).toEqual('2021-08-08T07:59:18.982Z');
      expect(comments[0].isdelete).toEqual(false);
      expect(comments[0].username).toEqual('indonesia');

      // Assert Comment 2
      expect(comments[1].id).toEqual('comment-124');
      expect(comments[1].content).toEqual('Bukan kak');
      expect(comments[1].date).toEqual('2021-08-08T09:59:18.982Z');
      expect(comments[1].isdelete).toEqual(false);
      expect(comments[1].username).toEqual('dicoding');
    });
  });

  describe('getCommentById', () => {
    it('should throw NotFoundError when thread not found', () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(commentRepositoryPostgres.getCommentById('thread-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return comments when is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      // Action
      const comment = await commentRepositoryPostgres.getCommentById('comment-123');

      // Assert
      const commentTest = await CommentsTableTestHelper.getCommentById('comment-123');
      expect(comment).toBeDefined();
      expect(commentTest).toHaveLength(1);
    });
  });

  describe('verifyCommentExistById', () => {
    it('should throw NotFoundError when comment not found', () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(commentRepositoryPostgres.verifyCommentExistById('comment-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when is found', async () => {
      // Arrange
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({
        id: 'user-123',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        owner: 'user-123',
        content: 'Dicoding Indonesia',
        date: '2021-08-08T07:59:18.982Z',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      return expect(commentRepositoryPostgres.verifyCommentExistById(commentId))
        .resolves
        .not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner', () => {
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

      // Arrange Thread & Comment
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-127',
      });
    });
    it('should throw AuthorizationError when user is not the comment owner', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'))
        .rejects
        .toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when user is the comment owner', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      return expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-127'))
        .resolves
        .not.toThrowError(NotFoundError);
    });
  });
});
