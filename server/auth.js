'use strict';

const crypto = require('crypto');

function hashPassword(password, salt){
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, hash){
  const check = crypto.scryptSync(String(password), salt, 64).toString('hex');
  const a = Buffer.from(check, 'hex');
  const b = Buffer.from(hash, 'hex');
  if(a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function genToken(){
  return crypto.randomBytes(32).toString('hex');
}

module.exports = { hashPassword, verifyPassword, genToken };
