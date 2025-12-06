#!/usr/bin/env node
const bcrypt = require('bcrypt')

async function main() {
  const password = process.argv[2]
  if (!password) {
    console.log('Usage: node gen-hash.js <password>')
    process.exit(1)
  }
  const hash = await bcrypt.hash(password, 10)
  console.log('Password:', password)
  console.log('Hash:', hash)
  console.log('\nExport as environment variable:')
  console.log(`ADMIN_PASSWORD_HASH='${hash}'`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
