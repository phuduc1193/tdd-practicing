'use strict';

module.exports = (app, options) => {

  app.get('/resource/phonetypes', (req, res, next) => {
    options.repository.getPhoneTypes().then((phonetypes) => {
      res.status(200).send(phonetypes);
    })
    .catch(next);
  });

  app.get('/resource/genders', (req, res, next) => {
    options.repository.getGenders().then((genders) => {
      res.status(200).send(genders);
    })
    .catch(next);
  });
};