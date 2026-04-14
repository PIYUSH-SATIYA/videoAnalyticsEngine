import { RowDataPacket } from 'mysql2';
import { DatabaseError } from '../../core/errors/AppError';
import { getPool } from './pool';

export interface QueryExecutionResult {
  dataRows: RowDataPacket[];
  metadataRow: Record<string, unknown>;
  queryTimeMs: number;
}

function isRowSet(value: unknown): value is RowDataPacket[] {
  return Array.isArray(value);
}

export async function executeAnalyticsSql(sql: string): Promise<QueryExecutionResult> {
  const pool = getPool();
  const startedNs = process.hrtime.bigint();

  try {
    const [results] = await pool.query(sql);
    const elapsedNs = process.hrtime.bigint() - startedNs;
    const elapsedMs = Number(elapsedNs) / 1_000_000;

    const sets = Array.isArray(results) ? results : [results];

    const rowSets = sets.filter((set) => isRowSet(set)) as RowDataPacket[][];
    const meaningfulRowSets = rowSets.filter((set) => set.length > 0);

    if (meaningfulRowSets.length === 0) {
      return {
        dataRows: [],
        metadataRow: {},
        queryTimeMs: Number(elapsedMs.toFixed(3))
      };
    }

    const metadataSet = meaningfulRowSets[meaningfulRowSets.length - 1];
    const dataSet = meaningfulRowSets.length > 1 ? (meaningfulRowSets[0] ?? []) : [];

    return {
      dataRows: dataSet,
      metadataRow: (metadataSet?.[0] ?? {}) as Record<string, unknown>,
      queryTimeMs: Number(elapsedMs.toFixed(3))
    };
  } catch (error) {
    throw new DatabaseError(
      `Failed to execute analytics query: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
