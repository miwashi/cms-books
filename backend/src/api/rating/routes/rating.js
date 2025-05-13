'use strict';

/**
 * rating router
 */

 const { createCoreRouter } = require('@strapi/strapi').factories;

 module.exports = createCoreRouter('api::rating.rating');


// module.exports = {
//     routes: [
//       {
//         method: 'POST',
//         path: '/ratings',
//         handler: 'rating.create',
//         config: {
//           policies: [],
//           auth: { scope: ['authenticated'] } // ✅ auth는 반드시 객체!
//         }
//       }
//     ]
//   };
  