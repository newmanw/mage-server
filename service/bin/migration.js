#! /usr/bin/env node

/* eslint-disable @typescript-eslint/no-use-before-define */

const path = require('path');
const fs = require('fs');
const { program: prog } = require('commander');
const env = require('../lib/environment/env');
const { Migrator } = require('mongodb-migrations');
const { migrationCollection } = require('../lib/migrate');

const migrationsDir = path.resolve(__dirname, '..', 'lib', 'migrations');
const srcMigrationsDir = path.resolve(__dirname, '..', 'src', 'migrations');

prog.version('0');

prog.command('create <name>')
  .description('generate a new migration script in the migrations directory')
  .action(name => {
    // had to do this intead of mongodb-migrations's Migrator.create() because
    // that tries to require() all the migration files instead of just finding
    // the next ordinal to assign.  loading the migration files with require()
    // fails because they cannot load the typescript modules in the source tree.
    const migrationFiles = parseMigrationFileNames();
    const last = migrationFiles[migrationFiles.length - 1] || null
    const next = last ? last.ordinal + 1 : 1;
    const nextFormatted = String(next).padStart(3, '0');
    const migrationFileName = `${nextFormatted}-${name}.js`;
    const migrationPath = path.resolve(srcMigrationsDir, migrationFileName);
    const stub = require('mongodb-migrations/lib/migration-stub')(name);
    fs.writeFileSync(migrationPath, stub);
    console.log(`created migration stub ${migrationPath}`);
  });

prog.command('run')
  .description('apply all the migrations in lib/migrations directory.  make sure you npm run build first!')
  .action(() => {
    const migrator = new Migrator({
      url: env.mongo.uri,
      collection: migrationCollection,
      options: env.mongo.options
    })
    migrator.runFromDir(migrationsDir,
      (err, results) => {
        setImmediate(() => {
          console.log(JSON.stringify(results, null, 2));
          if (err) {
            console.log('migration failed: ', err);
          }
          // mongodb-migrations uses lodash.defer() to do the progress callbacks
          // so they all run after the migration actually completes
          migrator.dispose((err) => {
            if (err) {
              console.log('error shutting down: ', err);
            }
            else {
              console.log('migration complete');
            }
          });
        })
      });
  });

prog.parse(process.argv);

function parseMigrationFileNames() {
  const files = fs.readdirSync(srcMigrationsDir);
  return files.filter(function(f) {
    return path.extname(f) === '.js' && !f.startsWith('.');
  }).map(function(f) {
    let ordinal = null;
    const numericPrefix = f.match(/^(\d+)/);
    if (numericPrefix) {
      ordinal = parseInt(numericPrefix[1]);
    }
    if (!ordinal) {
      throw new Error(`migration file does not have numberic ordering prefix: ${f}`);
    }
    return {
      ordinal,
      name: f
    };
  }).sort(function(f1, f2) {
    return f1.ordinal - f2.ordinal;
  })
}