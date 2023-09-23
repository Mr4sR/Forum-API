/* eslint-disable max-len */

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

const fakeIdGenerator = () => '123';

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
      });
      const addThreadPayload = new AddThread({
        title: 'Dokumen Negara',
        body: 'Dicoding Indonesia',
        owner: 'user-123',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThreadPayload);

      // Assert
      const threads = await ThreadsTableTestHelper.getThreadById(addedThread.id);
      expect(threads).toHaveLength(1);
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: addedThread.title,
        owner: addedThread.owner,
      }));
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const addUserPayload = {
        id: 'user-123',
        username: 'dicoding',
      };
      const addThreadPayload = {
        owner: 'user-123',
        title: 'Dokumen Negara',
        body: 'Dicoding Indonesia',
      };
      await UsersTableTestHelper.addUser(addUserPayload);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThreadPayload);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        owner: addUserPayload.id,
        title: addThreadPayload.title,
        body: addThreadPayload.body,
      }));
    });
  });

  describe('getThreadById', () => {
    it('should throw NotFoundError when thread not found', () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(threadRepositoryPostgres.getThreadById('thread-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return thread when is found', async () => {
      // Arrange
      const addUserPayload = {
        id: 'user-123',
        username: 'dicoding',
      };
      const addThreadPayload = {
        id: 'thread-123',
        owner: 'user-123',
        title: 'Dokumen Negara',
        body: 'Dicoding Indonesia',
      };
      await UsersTableTestHelper.addUser(addUserPayload);
      await ThreadsTableTestHelper.addThread(addThreadPayload);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const thread = await threadRepositoryPostgres.getThreadById(addThreadPayload.id);

      // Assert
      expect(thread).toBeDefined();
      expect(thread.id).toEqual(addThreadPayload.id);
      expect(thread.title).toEqual(addThreadPayload.title);
      expect(thread.body).toEqual(addThreadPayload.body);
      expect(thread.username).toEqual(addUserPayload.username);
    });
  });

  describe('verifyThreadExistById', () => {
    it('should throw NotFoundError when thread not found', () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(threadRepositoryPostgres.verifyThreadExistById('thread-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when is found', async () => {
      // Arrange
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
      });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: 'user-123',
        title: 'Dokumen Negara',
        body: 'Dicoding Indonesia',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      return expect(threadRepositoryPostgres.verifyThreadExistById(threadId))
        .resolves
        .not.toThrowError(NotFoundError);
    });
  });
});
