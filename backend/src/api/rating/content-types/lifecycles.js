module.exports = {
  async afterCreate(event) {
    const { result } = event;

    const populated = await strapi.entityService.findOne('api::rating.rating', result.id, {
      populate: ['book'],
    });

    if (populated.book?.title) {
      await strapi.entityService.update('api::rating.rating', result.id, {
        data: {
          book_title: populated.book.title,
        },
      });
    }
  },

  async afterUpdate(event) {
    const { result } = event;

    const populated = await strapi.entityService.findOne('api::rating.rating', result.id, {
      populate: ['book'],
    });

    if (populated.book?.title) {
      await strapi.entityService.update('api::rating.rating', result.id, {
        data: {
          book_title: populated.book.title,
        },
      });
    }
  },
};
