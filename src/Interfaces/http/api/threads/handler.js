const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetThreadUseCase = require('../../../../Applications/use_case/GetThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;
    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { title, body } = request.payload;
    const { id: userId } = request.auth.credentials;
    const addThreadUseCase = await this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute({ title, body, owner: userId });

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadByIdHandler(request, h) {
    const { threadId } = request.params;
    const getThreadUseCase = await this._container.getInstance(GetThreadUseCase.name);
    const threadDetails = await getThreadUseCase.execute(threadId);

    const response = h.response({
      status: 'success',
      data: {
        thread: threadDetails,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
