#!/usr/bin/env node
import fs from 'node:fs';

const errors = [];

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (err) {
    errors.push(`${path}: invalid JSON (${err.message})`);
    return null;
  }
}

function isIsoLocal(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value);
}

function checkEvents(path) {
  const events = readJson(path);
  if (!Array.isArray(events)) {
    errors.push(`${path}: expected an array of events.`);
    return;
  }

  const titles = new Set();

  events.forEach((event, i) => {
    const at = `${path}[${i}]`;

    for (const key of ['title', 'startLocal', 'endLocal', 'meet', 'mapsQuery']) {
      if (!event?.[key] || typeof event[key] !== 'string') {
        errors.push(`${at}: missing or invalid string field '${key}'.`);
      }
    }

    if (typeof event?.title === 'string') {
      if (titles.has(event.title)) {
        errors.push(`${at}: duplicate title '${event.title}'.`);
      }
      titles.add(event.title);
    }

    if (isIsoLocal(event?.startLocal) && isIsoLocal(event?.endLocal)) {
      const start = new Date(event.startLocal);
      const end = new Date(event.endLocal);
      if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
        errors.push(`${at}: invalid date parse in startLocal/endLocal.`);
      } else if (end <= start) {
        errors.push(`${at}: endLocal must be after startLocal.`);
      }
    } else {
      errors.push(`${at}: startLocal/endLocal must match YYYY-MM-DDTHH:mm format.`);
    }
  });
}

function checkSpotlight(path) {
  const data = readJson(path);
  if (!data || typeof data !== 'object') {
    errors.push(`${path}: expected object.`);
    return;
  }

  if (!data.month || typeof data.month !== 'string') {
    errors.push(`${path}: month must be a non-empty string.`);
  }

  const member = data.member;
  if (!member || typeof member !== 'object') {
    errors.push(`${path}: member object is required.`);
    return;
  }

  for (const key of ['name', 'chapter', 'role', 'photo', 'why']) {
    if (!member[key] || typeof member[key] !== 'string') {
      errors.push(`${path}: member.${key} must be a non-empty string.`);
    }
  }

  if (!Array.isArray(member.highlights)) {
    errors.push(`${path}: member.highlights must be an array of strings.`);
  } else {
    if (member.highlights.length === 0) {
      errors.push(`${path}: member.highlights should contain at least one item.`);
    }
    member.highlights.forEach((h, i) => {
      if (!h || typeof h !== 'string') {
        errors.push(`${path}: member.highlights[${i}] must be a non-empty string.`);
      }
    });
  }

  if (typeof member.quote !== 'string') {
    errors.push(`${path}: member.quote must be a string (can be empty).`);
  }
}

checkEvents('data/events.json');
checkSpotlight('data/spotlight.json');

if (errors.length) {
  console.error('❌ Content validation failed:');
  for (const e of errors) console.error(` - ${e}`);
  process.exit(1);
}

console.log('✅ Content validation passed for data/events.json and data/spotlight.json');
