export const endpoints = {
  auth: {
    login: "/api/auth/login",
    changePassword: "/api/auth/change-password",
  },
  employees: {
    list: "/api/employees",
    create: "/api/employees",
    detail: (id: string) => `/api/employees/${id}`,
    update: (id: string) => `/api/employees/${id}`,
    renew: (id: string) => `/api/employees/${id}/renew`,
    delete: (id: string) => `/api/employees/${id}`,
    history: (id: string) => `/api/employees/${id}/history`,
    public: (slug: string) => `/api/public/employee/${slug}`,
  },
  users: {
    list: "/api/users",
    create: "/api/users",
    delete: (id: string) => `/api/users/${id}`,
  },
};