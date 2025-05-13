// /src/api/rating/content-types/rating/lifecycles.js

// /src/api/rating/content-types/rating/lifecycles.js

// module.exports = {
//   async afterCreate(event) {
//     const { result } = event;

//     const isRelated =
//       result.user && typeof result.user === 'object' && result.user.id &&
//       result.book && typeof result.book === 'object' && result.book.id;

//     if (isRelated) {
//       await strapi.entityService.update('api::rating.rating', result.id, {
//         data: {
//           publishedAt: new Date().toISOString(),
//         },
//       });
//     }
//   },
// };


// module.exports = {
//   async afterCreate(event) {
//     const { result } = event;

//     const populated = await strapi.entityService.findOne('api::rating.rating', result.id, {
//       populate: ['user', 'book'],
//     });

//     if (populated.user && populated.book) {
//       await strapi.entityService.update('api::rating.rating', result.id, {
//         data: {
//           publishedAt: new Date().toISOString(),
//         },
//       });
//     }
//   },
// };


// /src/api/rating/content-types/rating/lifecycles.js
module.exports = {
  async afterCreate(event) {
    const { result, params } = event;

    // Populate book and user explicitly after creation
    const populated = await strapi.entityService.findOne('api::rating.rating', result.id, {
      populate: ['user', 'book',"title"],
    });

    if (populated.book && populated.user) {
      await strapi.entityService.update('api::rating.rating', result.id, {
        data: {
          book: populated.book.id,    // reassign to ensure connection
          book_title: populated.book.title,
          user: populated.user.id,
          publishedAt: new Date().toISOString(),
        },
      });
    }
  },
};
