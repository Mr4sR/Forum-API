exports.up = (pgm) => {
  pgm.createTable('likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    commentid: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    owner: {
      type: 'TEXT',
      notNull: true,
    },
  });

  pgm.addConstraint(
    'likes',
    'fk_likes.commentid_comments.id',
    'FOREIGN KEY(commentid) REFERENCES comments(id) ON DELETE CASCADE',
  );

  pgm.addConstraint(
    'likes',
    'fk_likes.owner_users.id',
    'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('likes');
};
