let version = 1;

export const cache = {
  getVersion: () => version,
  incrementVersion: () => version++,
};
