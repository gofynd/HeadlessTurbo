export const asField = (value, type = "text") => ({ type, value });

export const externalAction = (url) => ({
  page: {
    type: "external",
    query: {
      url: [url],
    },
  },
});

export const internalAction = (type, url = null) => {
  if (url) {
    return {
      page: {
        type: "page",
        query: {
          url: [url],
        },
      },
    };
  }
  return {
    page: {
      type,
    },
  };
};

