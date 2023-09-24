const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      // Arrange
      const userPayload = {
        username: 'dicoding',
        password: 'password',
      };
      const requestPayload = {
        content: 'Dokumen Negara',
        commentId: 'comment-123',
        owner: 'user-123',
      };

      const server = await createServer(container);
      // add user & Threads
      const responseUser = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'password',
          fullname: 'Dicoding Indonesia',
        },
      });
      const responseAddUser = JSON.parse(responseUser.payload);
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: responseAddUser.data.addedUser.id });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: responseAddUser.data.addedUser.id });

      // generate user token
      const responseAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });
      const responseJsonAuth = JSON.parse(responseAuth.payload);
      const token = responseJsonAuth.data.accessToken;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const userPayload = {
        username: 'dicoding',
        password: 'password',
      };
      const requestPayload = {
        commentId: 'thread-123',
        owner: 'user-123',
      };

      const server = await createServer(container);
      // add user & thread
      const responseUser = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'password',
          fullname: 'Dicoding Indonesia',
        },
      });
      const responseAddUser = JSON.parse(responseUser.payload);
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: responseAddUser.data.addedUser.id });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: responseAddUser.data.addedUser.id });

      // generate user token
      const responseAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });
      const responseJsonAuth = JSON.parse(responseAuth.payload);
      const token = responseJsonAuth.data.accessToken;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan balasan baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const userPayload = {
        username: 'dicoding',
        password: 'password',
      };
      const requestPayload = {
        content: true,
        commentId: ['thread-123'],
        owner: 'user-123',
      };

      const server = await createServer(container);
      // add user & threads
      const responseUser = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'password',
          fullname: 'Dicoding Indonesia',
        },
      });
      const responseAddUser = JSON.parse(responseUser.payload);
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: responseAddUser.data.addedUser.id });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: responseAddUser.data.addedUser.id });

      // generate user token
      const responseAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });
      const responseJsonAuth = JSON.parse(responseAuth.payload);
      const token = responseJsonAuth.data.accessToken;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan balasan baru karena tipe data tidak sesuai');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and delete reply by id', async () => {
      // Arrange
      const userPayload = {
        username: 'dicoding',
        password: 'password',
      };

      const server = await createServer(container);

      // add user & thread
      const responseUser = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'password',
          fullname: 'Dicoding Indonesia',
        },
      });
      const responseAddUser = JSON.parse(responseUser.payload);
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: responseAddUser.data.addedUser.id });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: responseAddUser.data.addedUser.id, threadId: 'thread-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: responseAddUser.data.addedUser.id, commentId: 'comment-123' });

      // generate user token
      const responseAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });
      const responseJsonAuth = JSON.parse(responseAuth.payload);
      const token = responseJsonAuth.data.accessToken;

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 when reply is not found', async () => {
      // Arrange
      const userPayload = {
        username: 'dicoding',
        password: 'password',
      };

      const server = await createServer(container);

      // add user & thread
      const responseUser = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'password',
          fullname: 'Dicoding Indonesia',
        },
      });
      const responseAddUser = JSON.parse(responseUser.payload);
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: responseAddUser.data.addedUser.id });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: responseAddUser.data.addedUser.id, threadId: 'thread-123' });

      // generate user token
      const responseAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });
      const responseJsonAuth = JSON.parse(responseAuth.payload);
      const token = responseJsonAuth.data.accessToken;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });
});
