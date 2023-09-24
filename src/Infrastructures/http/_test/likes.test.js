const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 201 and persisted like', async () => {
      // Arrange
      const userPayload = {
        username: 'dicoding',
        password: 'password',
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
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 when thread or comment is not exist', async () => {
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
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });
});
