const conditions = [
  {
    displayName: 'Has Locale Access',
    name: 'has-locale-access',
    plugin: 'i18n',
    handler(user: any, options: any) {
      const { locales } = options.permission.properties || {};
      const { superAdminCode } = strapi.admin.services.role.constants;

      const isSuperAdmin = user.roles.some((role: any) => role.code === superAdminCode);

      if (isSuperAdmin) {
        return true;
      }

      return {
        locale: {
          $in: locales || [],
        },
      };
    },
  },
];

const registerI18nConditions = async () => {
  const { conditionProvider } = strapi.admin.services.permission;

  await conditionProvider.registerMany(conditions);
};

export default {
  conditions,
  registerI18nConditions,
};
