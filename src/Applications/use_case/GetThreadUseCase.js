/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */

class GetThreadUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository, likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    const thread = await this._threadRepository.getThreadById(useCasePayload);
    const comments = await this._commentRepository.getCommentsByThreadId(useCasePayload);
    const replies = await this._replyRepository.getRepliesByThreadId(useCasePayload);
    const clearComments = await this._replaceDeletedComment(comments);
    const clearReplies = await this._replaceDeletedReply(replies);
    const commentsWithReplies = this._addReplyToComment(clearComments, clearReplies);
    const commentsWithLikes = await this._addLikesToComment(commentsWithReplies);
    return {
      ...thread,
      comments: commentsWithLikes,
    };
  }

  _replaceDeletedComment(comments) {
    return comments.map((comment) => {
      if (comment.isdelete) {
        const updatedComment = { ...comment, content: '**komentar telah dihapus**' };
        delete updatedComment.isdelete;
        return updatedComment;
      }
      delete comment.isdelete;
      return comment;
    });
  }

  _replaceDeletedReply(replies) {
    return replies.map((reply) => {
      if (reply.isdelete) {
        const updatedReply = { ...reply, content: '**balasan telah dihapus**' };
        delete updatedReply.isdelete;
        return updatedReply;
      }
      delete reply.isdelete;
      return reply;
    });
  }

  _addReplyToComment(comments, replies) {
    const result = comments.map((comment) => {
      const commentReplies = replies
        .filter((reply) => {
          if (reply.commentid === comment.id) {
            delete reply.commentid;
            return true;
          }
          return false;
        })
        .map(({ commentid, ...reply }) => ({
          id: reply.id,
          content: reply.content,
          date: reply.date,
          username: reply.username,
        })); // Transform the structure of replies

      return {
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.content,
        replies: commentReplies,
      };
    });

    return result;
  }

  async _addLikesToComment(comments) {
    for (const comment of comments) {
      comment.likeCount = await this._likeRepository.getLikesByCommentId(comment.id);
    }
    return comments;
  }
}

module.exports = GetThreadUseCase;
