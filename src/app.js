const express = require('express');

const app = express();

const middleware1 = (req, res, next) => {
  console.log('doing stuff in middleware 1');
  next();
};

const middleware2 = (req, res, next) => {
  console.log('doing stuff in middleware 2');
  next();
};

app.get('/myroute', middleware1, middleware2, (req, res) => {
  console.log('handling /myroute');
  res.send('content for /myroute');
});

const extractName = (req, resp, next) => {
  if (req.query.name) {
    req.reqName = req.query.name;
    next();
  } else {
    resp.status(400).send('Oups le param name est obligatoire !');
  }
};

app.get('/hello', extractName, (req, res) => {
  console.log('handling /hello');
  res.send(`Hello ${req.reqName} !`);
});

app.get('/syncError', (req, res) => {
  throw new Error('BOOM');
});

app.get('/asyncError', (req, res, next) => {
  setTimeout(() => {
    // essaye de réaliser quelques chose js
    try {
      // on provoque une erreur
      throw new Error('BOOM', { cause: 'timeoutError' });
    } catch (err) {
      // on attrape l'erreur
      console.log(err);
      next(err); // on passe cette erreur au middleware de gestion d'erreur
    }
  }, 1000);
});

const handleError = (err, req, res, next) => {
  // selon la nature de l'erreur on envoye des réponses lié au contexte de l'erreur
  if (err.cause === 'timeoutError') {
    res.status(501).send('Erreur inconue de type timeout');
  }
  // si pas de réponse explicite, envoie d'une erreur par défaut (500)
  res.status(500).send('internal serveur erreur');
};

app.use(handleError);

module.exports.app = app;
