const InvariantError = require('./InvariantError');

const errorMessages = {
  'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': 'tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada',
  'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': 'tidak dapat membuat user baru karena tipe data tidak sesuai',
  'REGISTER_USER.USERNAME_LIMIT_CHAR': 'tidak dapat membuat user baru karena karakter username melebihi batas limit',
  'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': 'tidak dapat membuat user baru karena username mengandung karakter terlarang',
  'USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY': 'harus mengirimkan username dan password',
  'USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION': 'username dan password harus string',
  'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': 'harus mengirimkan token refresh',
  'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': 'refresh token harus string',
  'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': 'harus mengirimkan token refresh',
  'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': 'refresh token harus string',
  'ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': 'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada',
  'ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': 'tidak dapat membuat thread baru karena tipe data tidak sesuai',
  'ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': 'tidak dapat menambahkan comment baru karena properti yang dibutuhkan tidak ada',
  'ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': 'tidak dapat menambahkan comment baru karena tipe data tidak sesuai',
  'ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY': 'tidak dapat menambahkan balasan baru karena properti yang dibutuhkan tidak ada',
  'ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION': 'tidak dapat menambahkan balasan baru karena tipe data tidak sesuai',
};

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {};

Object.keys(errorMessages).forEach((key) => {
  DomainErrorTranslator._directories[key] = new InvariantError(errorMessages[key]);
});

module.exports = DomainErrorTranslator;
