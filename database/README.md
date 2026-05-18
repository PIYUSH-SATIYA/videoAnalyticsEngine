# Database Setup (Local)

## 1) Create the database

```bash
mysql -u root -p -e "CREATE DATABASE video_analytics;"
```

## 2) Apply base schema files (ordered)

```bash
mysql -u root -p video_analytics < database/schema/001_init.sql
mysql -u root -p video_analytics < database/schema/002_users.sql
mysql -u root -p video_analytics < database/schema/003_videos.sql
mysql -u root -p video_analytics < database/schema/004_device.sql
mysql -u root -p video_analytics < database/schema/005_sessions.sql
mysql -u root -p video_analytics < database/schema/006_events.sql
mysql -u root -p video_analytics < database/schema/007_indexes.sql
```

## 3) Apply migrations
```bash
mysql -u root -p video_analytics < database/schema/migrations_sql/008_mig_10-03-26_users-videos.sql
mysql -u root -p video_analytics < database/schema/migrations_sql/009_mig_14-04-26_analytics_indexes.sql
```

## 4) Generate synthetic data (optional)
```bash
python database/scripts/generate_synthetic_data.py
```

## 5) Load synthetic data (optional)
```bash
mysql -u root -p video_analytics < database/scripts/load_synthetic_csv.sql
```

## 6) Verify schema

```bash
mysql -u root -p -e "SHOW TABLES;" video_analytics
```
