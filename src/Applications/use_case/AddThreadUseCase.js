const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const addThread = new AddThread(useCasePayload);
    const addedThread = await this._threadRepository.addThread(addThread);
    return addedThread;
  }
}

module.exports = AddThreadUseCase;
