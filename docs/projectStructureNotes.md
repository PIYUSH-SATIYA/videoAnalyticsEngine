## Intial Rules

This project treats schemas as code.

- SQL schema files are the single source of truth.
- The actual database is an execution artifact, not an authority.
- Databases can be dropped, recreated, or corrupted without loss of knowledge.
- Schema files must always be able to recreate the database from scratch.

### Rules of Immutability

- Once a schema file is committed by a user and it has been pushed on remote, which means others have started using it, so that exact file can't be changed now.
- any change to the database structure is expressed as a new schema file
    - like while above rule being followed, if that schema is to be changed, a new file with modification
- History is preserved through ordered SQL files and not edits in those files

### No manual drifts

- No one is allowed to “just fix it in the database”.
- If something changes, It changes the SQL and then get applied to the database
- The database must never contain changes that are not represented in Git.

### Reproducibility over convinience

- Any team member should be able to:
    - Clone the repository
    - Run schema files in order
    - Obtain the exact same database structure

## schema/ directory

`“Schema files describe change, not state.”`

This dir contains all **Structural Definitions** of the database.

What belongs to here:

- CREATE TABLE
- ALTER TABLE
- Constraints (PRIMARY KEY, FOREIGN KEY, CHECK)
- Indexes
- Enums (if used)
- Any change that affects the shape or integrity of data

What does not belong here:

- Data insertions (except extremely minimal and unavoidable).
- Analytics Queries.
- Experimental or Temporary SQL.

### File conventions

- Files are numbered sequentially:
    - 001_init.sql
    - 002_add_constraints.sql
    - 003_add_indexes.sql

- Files are executed in order.

- Older files are never modified after being depended upon.

### Mental model

Think of schema/ as:

- Git history for the database
- A manual migration system
- The authoritative contract of how data is allowed to exist

## queries/ dir

This contains read-only SQL.

What belongs here:

- Analytics queries
- Reporting queries
- Exploratory analysis
- Performance experiments (read-side only)

What does NOT belong here

- CREATE, ALTER, or DROP statements
- Anything that mutates schema
- Anything that mutates data

### Purpose

- Demonstrate how insights are derived from raw data
- Prove that the schema design supports real questions
- Serve as documentation-by-example for analytics use cases

Queries in this directory assume the schema already exists.

## docs/ dir

docs/ Directory

This directory contains thinking, not SQL.

### What belongs here

- Design decisions and their rationale
- Trade-offs that were considered
- Assumptions and constraints
- Notes meant for teammates, TAs, or future maintainers

### What does NOT belong here

- Schema definitions
- Queries that should be executable
- Implementation details already obvious from SQL

### Purpose:

- Capture why decisions were made, not just what was written
- Prevent repeating the same design debates
- Act as a bridge between theory and implementation

If someone asks “why is the schema designed this way?”, the answer should live here.

# First Principle

- The database is temporary.
- The schema is permanent.
- The queries are evidence.
- The docs are intent.
