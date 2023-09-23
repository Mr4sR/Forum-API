const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const userPayload = {
        username: 'dicoding',
        password: 'password',
      };
      const requestPayload = {
        content: 'Dokumen Negara',
        threadId: 'thread-123',
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
        url: `/threads/${requestPayload.threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const userPayload = {
        username: 'dicoding',
        password: 'password',
      };
      const requestPayload = {
        threadId: 'thread-123',
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
        url: `/threads/${requestPayload.threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const userPayload = {
        username: 'dicoding',
        password: 'password',
      };
      const requestPayload = {
        content: true,
        threadId: ['thread-123'],
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
        url: `/threads/${requestPayload.threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan comment baru karena tipe data tidak sesuai');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and delete comment by id', async () => {
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

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 when comment is not found', async () => {
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
        url: '/threads/thread-123/comments/comment-123',
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });
});
