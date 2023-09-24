const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const expectedThread = {
      id: 'thread-AqVg2b9JyQXR6wSQ2TmH4',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:59:16.198Z',
      username: 'dicoding',
    };

    const expectedComments = [
      {
        id: 'comment-123',
        content: 'Nice argument',
        date: '2021-08-08T07:59:18.982Z',
        username: 'dicoding',
        isdelete: false,
      },
      {
        id: 'comment-125',
        content: '**komentar telah dihapus**',
        date: '2021-08-08T08:59:18.982Z',
        username: 'indonesia',
        isdelete: true,
      },
    ];

    const expectedReplies = [
      {
        id: 'reply-BErOXUSefjwWGW1Z10Ihk',
        content: '**balasan telah dihapus**',
        date: '2021-08-08T07:59:48.766Z',
        username: 'johndoe',
        isdelete: true,
        commentid: 'comment-123',
      },
      {
        id: 'reply-xNBtm9HPR-492AeiimpfN',
        content: 'sebuah balasan',
        date: '2021-08-08T08:07:01.522Z',
        username: 'dicoding',
        isdelete: false,
        commentid: 'comment-123',
      },
    ];

    const expectedThreadDetails = {
      id: 'thread-AqVg2b9JyQXR6wSQ2TmH4',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:59:16.198Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          content: 'Nice argument',
          username: 'dicoding',
          date: '2021-08-08T07:59:18.982Z',
          replies: [
            {
              id: 'reply-BErOXUSefjwWGW1Z10Ihk',
              content: '**balasan telah dihapus**',
              date: '2021-08-08T07:59:48.766Z',
              username: 'johndoe',
            },
            {
              id: 'reply-xNBtm9HPR-492AeiimpfN',
              content: 'sebuah balasan',
              date: '2021-08-08T08:07:01.522Z',
              username: 'dicoding',
            },
          ],
          likeCount: 1,
        },
        {
          id: 'comment-125',
          content: '**komentar telah dihapus**',
          date: '2021-08-08T08:59:18.982Z',
          username: 'indonesia',
          replies: [],
          likeCount: 1,
        },
      ],
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComments));
    mockLikeRepository.getLikesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(1));
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedReplies));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(expectedThreadDetails);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload);
    expect(mockLikeRepository.getLikesByCommentId).toBeCalledWith('comment-123');
    expect(mockLikeRepository.getLikesByCommentId).toBeCalledWith('comment-125');
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(useCasePayload);
  });
});
