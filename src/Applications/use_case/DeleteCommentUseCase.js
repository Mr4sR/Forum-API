/* eslint-disable max-len */

class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadExistById(useCasePayload.threadId);
    await this._commentRepository.verifyCommentExistById(useCasePayload.commentId);
    await this._commentRepository.verifyCommentOwner(useCasePayload.commentId, useCasePayload.owner);
    return this._commentRepository.deleteCommentById(useCasePayload.commentId);
  }
}

module.exports = DeleteCommentUseCase;
