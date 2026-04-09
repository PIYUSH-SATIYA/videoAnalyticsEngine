
## Index Strategy Review

The following indexes are chosen based on expected query patterns in the system. Since the `events` table will likely grow very large, indexing the columns most frequently used in filtering and joins is critical.

### `events(session_id)`

**Purpose**

Used when joining events to sessions.

Example query pattern:

```sql
SELECT *
FROM events e
JOIN sessions s ON e.session_id = s.session_id;
```

Since `events` will contain many rows, indexing `session_id` allows the database to locate relevant events for a session quickly.

**Conclusion**

Good index. Necessary for join performance.

---

### `events(video_id)`

**Purpose**

Used when querying events related to a specific video.

Example query pattern:

```sql
SELECT *
FROM events
WHERE video_id = ?;
```

Analytics such as:

- number of plays per video
- engagement metrics
- watch behavior analysis

will frequently filter by `video_id`.

**Conclusion**

Good index. Very common analytics access pattern.

---

### `events(event_timestamp)`

**Purpose**

Used for time-based filtering.

Example query pattern:

```sql
SELECT *
FROM events
WHERE event_timestamp BETWEEN '2025-01-01' AND '2025-01-02';
```

Time-based queries are fundamental in analytics systems for:

- daily activity
- retention analysis
- time-series metrics
- usage trends

**Conclusion**

Good index. Important for time-series queries.

---

### `sessions(user_id)`

**Purpose**

Used when querying activity for a specific user.

Typical access path:

users → sessions → events

Example query pattern:

```sql
SELECT *
FROM sessions
WHERE user_id = ?;
```

This index helps locate all sessions belonging to a user efficiently.

**Conclusion**

Good index. Required for user-level analysis.

---

### `sessions(device_id)`

**Purpose**

Used when analyzing sessions originating from specific devices.

Example query pattern:

```sql
SELECT *
FROM sessions
WHERE device_id = ?;
```

Useful for analytics such as:

- device usage distribution
- platform engagement patterns
- debugging device-specific issues

**Conclusion**

Less critical than other indexes, but still useful for device-level analysis.
