import type { Diagram } from '@/lib/domain/diagram';

/**
 * Converts a raw diagram API response (which has `id` already mapped via
 * toJSON transform on the server, and ISO date strings) into the domain
 * `Diagram` type (which uses `Date` objects for createdAt/updatedAt).
 */
export function fromApiDiagram(raw: Record<string, unknown>): Diagram {
    return {
        ...(raw as unknown as Diagram),
        createdAt: new Date(raw.createdAt as string),
        updatedAt: new Date(raw.updatedAt as string),
    };
}
