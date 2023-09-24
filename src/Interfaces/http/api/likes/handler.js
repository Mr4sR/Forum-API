const LikeControlUseCase = require('../../../../Applications/use_case/LikeControlUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: userId } = request.auth.credentials;
    const likeControlUseCase = this._container.getInstance(LikeControlUseCase.name);
    const like = await likeControlUseCase.execute({
      threadId, commentId, owner: userId,
    });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = LikesHandler;
