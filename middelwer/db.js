const express = require('express');
const { Pool } = require('pg');

// Database connection pool
const pool = new Pool({
  user: 'sameer',
  host: 'dpg-cphik1gl6cac73a1vdeg-a',
  database: 'ilaundry',
  password: 'Pa97uXshP4oO6FVldo7d6t5OuNv1nDy7',
  port: 5432,
});

// Promisify query function
const pgQuery = (qry) => {
  return new Promise((resolve, reject) => {
    pool.query(qry, (err, res) => {
      if (err) return reject(err);
      resolve(res.rows);
    });
  });
};

module.exports = { pool, pgQuery };
