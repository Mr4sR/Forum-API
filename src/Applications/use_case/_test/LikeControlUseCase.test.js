const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const LikeControlUseCase = require('../LikeControlUseCase');

describe('LikeControlUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add like action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadid: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExistById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExistById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLikeExist = jest.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const likeControlUseCase = new LikeControlUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await likeControlUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExistById)
      .toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExistById)
      .toBeCalledWith(useCasePayload.commentId);
    expect(mockLikeRepository.verifyLikeExist)
      .toBeCalledWith(useCasePayload.commentId, useCasePayload.owner);
    expect(mockLikeRepository.addLike)
      .toBeCalledWith(useCasePayload.commentId, useCasePayload.owner);
  });

  it('should orchestrating the delete like action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadid: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExistById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExistById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLikeExist = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.deleteLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const likeControlUseCase = new LikeControlUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await likeControlUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExistById)
      .toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExistById)
      .toBeCalledWith(useCasePayload.commentId);
    expect(mockLikeRepository.verifyLikeExist)
      .toBeCalledWith(useCasePayload.commentId, useCasePayload.owner);
    expect(mockLikeRepository.deleteLike)
      .toBeCalledWith(useCasePayload.commentId, useCasePayload.owner);
  });
});
