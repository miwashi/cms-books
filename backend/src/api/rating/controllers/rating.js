'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::rating.rating', ({ strapi }) => ({
  // Custom CREATE that links user and book properly
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized("You're not logged in");

    const { rating, book } = ctx.request.body.data;

    if (!rating || !book) {
      return ctx.badRequest("Rating and book ID are required.");
    }

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

  // Custom DELETE that verifies user ownership before deletion
  async delete(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user) return ctx.unauthorized("You're not logged in");
    if (!id) return ctx.badRequest("Rating ID is required.");

    const rating = await strapi.entityService.findOne('api::rating.rating', id, {
      populate: ['user'],
    });

    if (!rating) return ctx.notFound("Rating not found.");

    if (rating.user?.id !== user.id) {
      return ctx.unauthorized("You do not own this rating.");
    }

    await strapi.entityService.delete('api::rating.rating', id);
    ctx.status = 204;
  },
}));
