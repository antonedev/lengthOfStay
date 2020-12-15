exports.caToday = function () {
  const today = Date.now() - 1000 * 60 * 60 * 7;
  return new Date(today);
};
