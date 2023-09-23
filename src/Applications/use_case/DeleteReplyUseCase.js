/* eslint-disable max-len */

class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadExistById(useCasePayload.threadId);
    await this._commentRepository.verifyCommentExistById(useCasePayload.commentId);
    await this._replyRepository.verifyReplyExistById(useCasePayload.replyId);
    await this._replyRepository.verifyReplyOwner(useCasePayload.replyId, useCasePayload.owner);
    return this._replyRepository.deleteReplyById(useCasePayload.replyId);
  }
}

module.exports = DeleteReplyUseCase;
