\echo 'Delete and recreate seating db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE seating;
CREATE DATABASE seating;
\connect seating

\i seating-schema.sql
\i seating-seed.sql

\echo 'Delete and recreate seating_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE seating_test;
CREATE DATABASE seating_test;
\connect seating_test

\i seating-schema.sql

