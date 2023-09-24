class AddLikeUseCase {
  constructor({ likeRepository, commentRepository, threadRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadExistById(useCasePayload.threadId);
    await this._commentRepository.verifyCommentExistById(useCasePayload.commentId);
    const isLikeExist = await this._likeRepository
      .verifyLikeExist(useCasePayload.commentId, useCasePayload.owner);

    if (isLikeExist) {
      return this._likeRepository.deleteLike(useCasePayload.commentId, useCasePayload.owner);
    }

    return this._likeRepository.addLike(useCasePayload.commentId, useCasePayload.owner);
  }
}

module.exports = AddLikeUseCase;
