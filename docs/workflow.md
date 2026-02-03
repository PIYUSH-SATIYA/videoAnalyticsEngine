## How we will be working

- One shared Git repository
- Everyone runs schema files locally
- No one edits existing schema files after merge
- New changes = new numbered SQL file
- Schema discussions happen before writing SQL

## How will we actually run the SQL

Typical loop:

- Write SQL in VS Code
- Save it
- Run it via terminal:

```bash
psql -d your_db_name -f schema/001_init.sql
```

If it fails, you fix the file, not the database manually.

You should get comfortable destroying and recreating the database during early design. Databases are disposable; schema files are not.
