'use strict';

const fs = require('fs/promises');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Parsea contenido M3U
 */
function parseM3U(m3uContent) {
  const lines = m3uContent
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const channels = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!line.startsWith('#EXTINF')) {
      continue;
    }

    const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
    const tvgNameMatch = line.match(/tvg-name="([^"]*)"/);
    const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/);
    const groupTitleMatch = line.match(/group-title="([^"]*)"/);
    const tvgCountryMatch = line.match(/tvg-country="([^"]*)"/);
    const tvgLanguageMatch = line.match(/tvg-language="([^"]*)"/);

    const lastCommaIndex = line.lastIndexOf(',');

    const displayName =
      lastCommaIndex !== -1
        ? line.substring(lastCommaIndex + 1).trim()
        : '';

    let streamUrl = '';

    for (let j = i + 1; j < lines.length; j++) {
      if (!lines[j].startsWith('#')) {
        streamUrl = lines[j].trim();
        i = j;
        break;
      }
    }

    if (
      !streamUrl ||
      (!streamUrl.startsWith('http://') &&
        !streamUrl.startsWith('https://'))
    ) {
      continue;
    }

    channels.push({
      id: tvgIdMatch?.[1] || '',
      name: tvgNameMatch?.[1] || displayName || 'Canal sin nombre',
      logo: tvgLogoMatch?.[1] || '',
      group: groupTitleMatch?.[1] || 'Sin categoría',
      country: tvgCountryMatch?.[1] || '',
      language: tvgLanguageMatch?.[1] || '',
      url: streamUrl,
    });
  }

  return channels;
}

/**
 * GET /api/channels/:country
 */
async function getChannelsByCountry(req, res, next) {
  try {
    const country = (req.params.country || 'mx')
      .toLowerCase()
      .trim();

    if (!/^[a-z]{2,3}$/.test(country)) {
      return res.status(400).json({
        success: false,
        message:
          'El código de país debe tener 2 o 3 letras (ej: mx, us, gb).',
      });
    }

    let m3uContent;

    try {
      const playlistPath = path.join(
        __dirname,
        '../playlist',
        `${country}.m3u`
      );

      m3uContent = await fs.readFile(
        playlistPath,
        'utf8'
      );
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: `No existe el archivo ${country}.m3u`,
      });
    }

    const allChannels = parseM3U(m3uContent);

    const groupFilter = req.query.group;

    const filtered = groupFilter
      ? allChannels.filter((ch) =>
          ch.group
            .toLowerCase()
            .includes(groupFilter.toLowerCase())
        )
      : allChannels;

    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      500,
      Math.max(
        1,
        parseInt(req.query.limit, 10) || 200
      )
    );

    const start = (page - 1) * limit;

    const paginated = filtered.slice(
      start,
      start + limit
    );

    const groups = [
      ...new Set(
        allChannels.map((ch) => ch.group)
      ),
    ].sort();

    return res.json({
      success: true,
      country,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(
        filtered.length / limit
      ),
      groups,
      channels: paginated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/channels
 */
async function getAvailableCountries(_req, res, next) {
  try {
    const countries = [
      { code: 'mx', name: 'México' },
      { code: 'us', name: 'Estados Unidos' },
      { code: 'es', name: 'España' },
      { code: 'ar', name: 'Argentina' },
      { code: 'co', name: 'Colombia' },
      { code: 'cl', name: 'Chile' },
      { code: 'br', name: 'Brasil' },
      { code: 'pe', name: 'Perú' },
      { code: 've', name: 'Venezuela' },
      { code: 'gb', name: 'Reino Unido' },
    ];

    return res.json({
      success: true,
      countries,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getChannelsByCountry,
  getAvailableCountries,
};