// eslint-disable-next-line no-var
declare var strapi: any & { dirs: { app: { root } } };

declare module 'knex/lib/dialects/sqlite3/index';
declare module 'knex/lib/query/querybuilder';
declare module 'knex/lib/raw';
