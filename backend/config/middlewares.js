module.exports = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];


// module.exports = [
//   {
//     name: 'strapi::errors',
//   },
//   {
//     name: 'strapi::security',
//   },
//   {
//     name: 'strapi::cors', // CORS 
//     config: {
//       enabled: true,
//       origin: ["http://localhost:5500"],  //  URL
//     },
//   },
//   {
//     name: 'strapi::query', // 
//   },
//   {
//     name: 'strapi::body', //
//   },
//   {
//     name: 'strapi::session',
//   },
//   {
//     name: 'strapi::favicon',
//   },
//   {
//     name: 'strapi::public',
//   },
// ];
