'use strict';

const { Router } = require('express');
const {
  getChannelsByCountry,
  getAvailableCountries,
} = require('../controllers/channels.controller');

const router = Router();

/**
 * GET /api/countries
 * Lista los países disponibles para seleccionar en el frontend.
 */
router.get('/countries', getAvailableCountries);

/**
 * GET /api/channels/:country
 * Retorna los canales del país indicado (ej: mx, us, es).
 *
 * Query params opcionales:
 *   - group  {string}  Filtra canales por categoría
 *   - page   {number}  Página de resultados (default: 1)
 *   - limit  {number}  Canales por página (default: 200)
 */
router.get('/channels/:country', getChannelsByCountry);

module.exports = router;
