// Siempre corre, objeto global, se actualiza dependendiendo del entorno en el que corre

//=============================
//           PORT
//=============================
process.env.PORT = process.env.PORT || 3000;


//=============================
//     TOKEN EXPIRATION
//=============================

process.env.TOKEN_EXPIRATION = 60 * 60 * 24 * 30;


//=============================
//   Authentication SEED
//=============================

process.env.SEED = 'seed';