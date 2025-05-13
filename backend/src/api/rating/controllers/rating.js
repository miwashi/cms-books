// /src/api/rating/controllers/rating.js
'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::rating.rating', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized("You're not logged in");

    const { rating, book } = ctx.request.body.data;

    const response = await strapi.entityService.create('api::rating.rating', {
      data: {
        rating,
        user: user.id,
        book,
        publishedAt: new Date().toISOString(),
      },
    });

    return response;
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    const rating = await strapi.entityService.findOne('api::rating.rating', id, {
      populate: ['user'],
    });

    if (!rating || rating.user?.id !== user.id) {
      return ctx.unauthorized("You cannot delete this rating");
    }

    await strapi.entityService.delete('api::rating.rating', id);
    return ctx.send({ ok: true });
  },
}));
