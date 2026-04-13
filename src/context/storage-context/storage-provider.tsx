import React, { useCallback, useMemo } from 'react';
import type { StorageContext } from './storage-context';
import { storageContext } from './storage-context';
import Dexie, { type EntityTable } from 'dexie';
import type { Diagram } from '@/lib/domain/diagram';
import type { DBTable } from '@/lib/domain/db-table';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import { determineCardinalities } from '@/lib/domain/db-relationship';
import type { ChartDBConfig } from '@/lib/domain/config';
import type { DBDependency } from '@/lib/domain/db-dependency';
import type { Area } from '@/lib/domain/area';
import type { DBCustomType } from '@/lib/domain/db-custom-type';
import type { DiagramFilter } from '@/lib/domain/diagram-filter/diagram-filter';
import type { Note } from '@/lib/domain/note';
import {
    apiGet,
    apiPost,
    apiPut,
    apiDelete,
    ApiClientError,
} from '@/lib/api-client';
import { fromApiDiagram } from '@/lib/api-mapper';

// ─── API response shapes ──────────────────────────────────────────────────────

interface DiagramListResponse {
    diagrams: Record<string, unknown>[];
}
interface DiagramResponse {
    diagram: Record<string, unknown>;
}
interface TablesResponse {
    tables: DBTable[];
}
interface TableResponse {
    table: DBTable;
}
interface RelationshipsResponse {
    relationships: DBRelationship[];
}
interface RelationshipResponse {
    relationship: DBRelationship;
}
interface AreasResponse {
    areas: Area[];
}
interface AreaResponse {
    area: Area;
}
interface NotesResponse {
    notes: Note[];
}
interface NoteResponse {
    note: Note;
}
interface CustomTypesResponse {
    customTypes: DBCustomType[];
}
interface CustomTypeResponse {
    customType: DBCustomType;
}

export const StorageProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    // ─── Dexie: used only for config, diagram_filters, and dependencies ───────
    const db = useMemo(() => {
        const dexieDB = new Dexie('ChartDB') as Dexie & {
            diagrams: EntityTable<Diagram, 'id'>;
            db_tables: EntityTable<DBTable & { diagramId: string }, 'id'>;
            db_relationships: EntityTable<
                DBRelationship & { diagramId: string },
                'id'
            >;
            db_dependencies: EntityTable<
                DBDependency & { diagramId: string },
                'id'
            >;
            areas: EntityTable<Area & { diagramId: string }, 'id'>;
            db_custom_types: EntityTable<
                DBCustomType & { diagramId: string },
                'id'
            >;
            notes: EntityTable<Note & { diagramId: string }, 'id'>;
            config: EntityTable<ChartDBConfig & { id: number }, 'id'>;
            diagram_filters: EntityTable<
                DiagramFilter & { diagramId: string },
                'diagramId'
            >;
        };

        // Keep ALL version declarations intact to preserve existing user data.
        // Tables that migrated to the API remain declared but are no longer
        // actively used by this provider.
        dexieDB.version(1).stores({
            diagrams: '++id, name, databaseType, createdAt, updatedAt',
            db_tables:
                '++id, diagramId, name, x, y, fields, indexes, color, createdAt, width',
            db_relationships:
                '++id, diagramId, name, sourceTableId, targetTableId, sourceFieldId, targetFieldId, type, createdAt',
            config: '++id, defaultDiagramId',
        });

        dexieDB.version(2).upgrade((tx) =>
            tx
                .table<DBTable & { diagramId: string }>('db_tables')
                .toCollection()
                .modify((table) => {
                    for (const field of table.fields) {
                        field.type = {
                            // @ts-expect-error string before
                            id: (field.type as string).split(' ').join('_'),
                            // @ts-expect-error string before
                            name: field.type,
                        };
                    }
                })
        );

        dexieDB.version(3).stores({
            diagrams:
                '++id, name, databaseType, databaseEdition, createdAt, updatedAt',
            db_tables:
                '++id, diagramId, name, x, y, fields, indexes, color, createdAt, width',
            db_relationships:
                '++id, diagramId, name, sourceTableId, targetTableId, sourceFieldId, targetFieldId, type, createdAt',
            config: '++id, defaultDiagramId',
        });

        dexieDB.version(4).stores({
            diagrams:
                '++id, name, databaseType, databaseEdition, createdAt, updatedAt',
            db_tables:
                '++id, diagramId, name, x, y, fields, indexes, color, createdAt, width, comment',
            db_relationships:
                '++id, diagramId, name, sourceTableId, targetTableId, sourceFieldId, targetFieldId, type, createdAt',
            config: '++id, defaultDiagramId',
        });

        dexieDB.version(5).stores({
            diagrams:
                '++id, name, databaseType, databaseEdition, createdAt, updatedAt',
            db_tables:
                '++id, diagramId, name, schema, x, y, fields, indexes, color, createdAt, width, comment',
            db_relationships:
                '++id, diagramId, name, sourceSchema, sourceTableId, targetSchema, targetTableId, sourceFieldId, targetFieldId, type, createdAt',
            config: '++id, defaultDiagramId',
        });

        dexieDB.version(6).upgrade((tx) =>
            tx
                .table<DBRelationship & { diagramId: string }>(
                    'db_relationships'
                )
                .toCollection()
                .modify((relationship, ref) => {
                    const { sourceCardinality, targetCardinality } =
                        determineCardinalities(
                            // @ts-expect-error string before
                            relationship.type ?? 'one_to_one'
                        );

                    relationship.sourceCardinality = sourceCardinality;
                    relationship.targetCardinality = targetCardinality;

                    // @ts-expect-error string before
                    delete ref.value.type;
                })
        );

        dexieDB.version(7).stores({
            diagrams:
                '++id, name, databaseType, databaseEdition, createdAt, updatedAt',
            db_tables:
                '++id, diagramId, name, schema, x, y, fields, indexes, color, createdAt, width, comment',
            db_relationships:
                '++id, diagramId, name, sourceSchema, sourceTableId, targetSchema, targetTableId, sourceFieldId, targetFieldId, type, createdAt',
            db_dependencies:
                '++id, diagramId, schema, tableId, dependentSchema, dependentTableId, createdAt',
            config: '++id, defaultDiagramId',
        });

        dexieDB.version(8).stores({
            diagrams:
                '++id, name, databaseType, databaseEdition, createdAt, updatedAt',
            db_tables:
                '++id, diagramId, name, schema, x, y, fields, indexes, color, createdAt, width, comment, isView, isMaterializedView, order',
            db_relationships:
                '++id, diagramId, name, sourceSchema, sourceTableId, targetSchema, targetTableId, sourceFieldId, targetFieldId, type, createdAt',
            db_dependencies:
                '++id, diagramId, schema, tableId, dependentSchema, dependentTableId, createdAt',
            config: '++id, defaultDiagramId',
        });

        dexieDB.version(9).upgrade((tx) =>
            tx
                .table<DBTable & { diagramId: string }>('db_tables')
                .toCollection()
                .modify((table) => {
                    for (const field of table.fields) {
                        if (typeof field.nullable === 'string') {
                            field.nullable =
                                (field.nullable as string).toLowerCase() ===
                                'true';
                        }
                    }
                })
        );

        dexieDB.version(10).stores({
            diagrams:
                '++id, name, databaseType, databaseEdition, createdAt, updatedAt',
            db_tables:
                '++id, diagramId, name, schema, x, y, fields, indexes, color, createdAt, width, comment, isView, isMaterializedView, order',
            db_relationships:
                '++id, diagramId, name, sourceSchema, sourceTableId, targetSchema, targetTableId, sourceFieldId, targetFieldId, type, createdAt',
            db_dependencies:
                '++id, diagramId, schema, tableId, dependentSchema, dependentTableId, createdAt',
            areas: '++id, diagramId, name, x, y, width, height, color',
            config: '++id, defaultDiagramId',
        });

        dexieDB.version(11).stores({
            diagrams:
                '++id, name, databaseType, databaseEdition, createdAt, updatedAt',
            db_tables:
                '++id, diagramId, name, schema, x, y, fields, indexes, color, createdAt, width, comment, isView, isMaterializedView, order',
            db_relationships:
                '++id, diagramId, name, sourceSchema, sourceTableId, targetSchema, targetTableId, sourceFieldId, targetFieldId, type, createdAt',
            db_dependencies:
                '++id, diagramId, schema, tableId, dependentSchema, dependentTableId, createdAt',
            areas: '++id, diagramId, name, x, y, width, height, color',
            db_custom_types:
                '++id, diagramId, schema, type, kind, values, fields',
            config: '++id, defaultDiagramId',
        });

        dexieDB
            .version(12)
            .stores({
                diagrams:
                    '++id, name, databaseType, databaseEdition, createdAt, updatedAt',
                db_tables:
                    '++id, diagramId, name, schema, x, y, fields, indexes, color, createdAt, width, comment, isView, isMaterializedView, order',
                db_relationships:
                    '++id, diagramId, name, sourceSchema, sourceTableId, targetSchema, targetTableId, sourceFieldId, targetFieldId, type, createdAt',
                db_dependencies:
                    '++id, diagramId, schema, tableId, dependentSchema, dependentTableId, createdAt',
                areas: '++id, diagramId, name, x, y, width, height, color',
                db_custom_types:
                    '++id, diagramId, schema, type, kind, values, fields',
                config: '++id, defaultDiagramId',
                diagram_filters: 'diagramId, tableIds, schemasIds',
            })
            .upgrade((tx) => {
                tx.table('config').clear();
            });

        dexieDB.version(13).stores({
            diagrams:
                '++id, name, databaseType, databaseEdition, createdAt, updatedAt',
            db_tables:
                '++id, diagramId, name, schema, x, y, fields, indexes, color, createdAt, width, comment, isView, isMaterializedView, order',
            db_relationships:
                '++id, diagramId, name, sourceSchema, sourceTableId, targetSchema, targetTableId, sourceFieldId, targetFieldId, type, createdAt',
            db_dependencies:
                '++id, diagramId, schema, tableId, dependentSchema, dependentTableId, createdAt',
            areas: '++id, diagramId, name, x, y, width, height, color',
            db_custom_types:
                '++id, diagramId, schema, type, kind, values, fields',
            config: '++id, defaultDiagramId',
            diagram_filters: 'diagramId, tableIds, schemasIds',
            notes: '++id, diagramId, content, x, y, width, height, color',
        });

        dexieDB.on('ready', async () => {
            const config = await dexieDB.config.get(1);
            if (!config) {
                await dexieDB.config.add({
                    id: 1,
                    defaultDiagramId: '',
                });
            }
        });

        return dexieDB;
    }, []);

    // ─── Config (Dexie) ───────────────────────────────────────────────────────

    const getConfig: StorageContext['getConfig'] = useCallback(async () => {
        return await db.config.get(1);
    }, [db]);

    const updateConfig: StorageContext['updateConfig'] = useCallback(
        async (config) => {
            await db.config.update(1, config);
        },
        [db]
    );

    // ─── Diagram filter (Dexie) ───────────────────────────────────────────────

    const getDiagramFilter: StorageContext['getDiagramFilter'] = useCallback(
        async (diagramId) => {
            return await db.diagram_filters.get({ diagramId });
        },
        [db]
    );

    const updateDiagramFilter: StorageContext['updateDiagramFilter'] =
        useCallback(
            async (diagramId, filter) => {
                await db.diagram_filters.put({ diagramId, ...filter });
            },
            [db]
        );

    const deleteDiagramFilter: StorageContext['deleteDiagramFilter'] =
        useCallback(
            async (diagramId) => {
                await db.diagram_filters.where({ diagramId }).delete();
            },
            [db]
        );

    // ─── Dependencies (Dexie) ─────────────────────────────────────────────────

    const addDependency: StorageContext['addDependency'] = useCallback(
        async ({ diagramId, dependency }) => {
            await db.db_dependencies.add({ ...dependency, diagramId });
        },
        [db]
    );

    const getDependency: StorageContext['getDependency'] = useCallback(
        async ({ diagramId, id }) => {
            return await db.db_dependencies.get({ id, diagramId });
        },
        [db]
    );

    const updateDependency: StorageContext['updateDependency'] = useCallback(
        async ({ id, attributes }) => {
            await db.db_dependencies.update(id, attributes);
        },
        [db]
    );

    const deleteDependency: StorageContext['deleteDependency'] = useCallback(
        async ({ diagramId, id }) => {
            await db.db_dependencies.where({ id, diagramId }).delete();
        },
        [db]
    );

    const listDependencies: StorageContext['listDependencies'] = useCallback(
        async (diagramId) => {
            return await db.db_dependencies
                .where('diagramId')
                .equals(diagramId)
                .toArray();
        },
        [db]
    );

    const deleteDiagramDependencies: StorageContext['deleteDiagramDependencies'] =
        useCallback(
            async (diagramId) => {
                await db.db_dependencies
                    .where('diagramId')
                    .equals(diagramId)
                    .delete();
            },
            [db]
        );

    // ─── Tables (API) ─────────────────────────────────────────────────────────

    const addTable: StorageContext['addTable'] = useCallback(
        async ({ diagramId, table }) => {
            await apiPost(`/api/diagrams/${diagramId}/tables`, table);
        },
        []
    );

    const getTable: StorageContext['getTable'] = useCallback(
        async ({ diagramId, id }) => {
            try {
                const data = await apiGet<TableResponse>(
                    `/api/diagrams/${diagramId}/tables/${id}`
                );
                return data.table;
            } catch (e) {
                if (e instanceof ApiClientError && e.status === 404)
                    return undefined;
                throw e;
            }
        },
        []
    );

    const updateTable: StorageContext['updateTable'] = useCallback(
        async ({ id, diagramId, attributes }) => {
            if (!diagramId) return;
            await apiPut(`/api/diagrams/${diagramId}/tables/${id}`, attributes);
        },
        []
    );

    const putTable: StorageContext['putTable'] = useCallback(
        async ({ diagramId, table }) => {
            await apiPut(
                `/api/diagrams/${diagramId}/tables/${table.id}`,
                table
            );
        },
        []
    );

    const deleteTable: StorageContext['deleteTable'] = useCallback(
        async ({ diagramId, id }) => {
            await apiDelete(`/api/diagrams/${diagramId}/tables/${id}`);
        },
        []
    );

    const listTables: StorageContext['listTables'] = useCallback(
        async (diagramId) => {
            const data = await apiGet<TablesResponse>(
                `/api/diagrams/${diagramId}/tables`
            );
            return data.tables;
        },
        []
    );

    const deleteDiagramTables: StorageContext['deleteDiagramTables'] =
        useCallback(async (diagramId) => {
            await apiPut(`/api/diagrams/${diagramId}`, { tables: [] });
        }, []);

    // ─── Relationships (API) ──────────────────────────────────────────────────

    const addRelationship: StorageContext['addRelationship'] = useCallback(
        async ({ diagramId, relationship }) => {
            await apiPost(
                `/api/diagrams/${diagramId}/relationships`,
                relationship
            );
        },
        []
    );

    const getRelationship: StorageContext['getRelationship'] = useCallback(
        async ({ diagramId, id }) => {
            try {
                const data = await apiGet<RelationshipResponse>(
                    `/api/diagrams/${diagramId}/relationships/${id}`
                );
                return data.relationship;
            } catch (e) {
                if (e instanceof ApiClientError && e.status === 404)
                    return undefined;
                throw e;
            }
        },
        []
    );

    const updateRelationship: StorageContext['updateRelationship'] =
        useCallback(async ({ id, diagramId, attributes }) => {
            if (!diagramId) return;
            await apiPut(
                `/api/diagrams/${diagramId}/relationships/${id}`,
                attributes
            );
        }, []);

    const deleteRelationship: StorageContext['deleteRelationship'] =
        useCallback(async ({ diagramId, id }) => {
            await apiDelete(`/api/diagrams/${diagramId}/relationships/${id}`);
        }, []);

    const listRelationships: StorageContext['listRelationships'] = useCallback(
        async (diagramId) => {
            const data = await apiGet<RelationshipsResponse>(
                `/api/diagrams/${diagramId}/relationships`
            );
            return data.relationships.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
        },
        []
    );

    const deleteDiagramRelationships: StorageContext['deleteDiagramRelationships'] =
        useCallback(async (diagramId) => {
            await apiPut(`/api/diagrams/${diagramId}`, { relationships: [] });
        }, []);

    // ─── Areas (API) ──────────────────────────────────────────────────────────

    const addArea: StorageContext['addArea'] = useCallback(
        async ({ diagramId, area }) => {
            await apiPost(`/api/diagrams/${diagramId}/areas`, area);
        },
        []
    );

    const getArea: StorageContext['getArea'] = useCallback(
        async ({ diagramId, id }) => {
            try {
                const data = await apiGet<AreaResponse>(
                    `/api/diagrams/${diagramId}/areas/${id}`
                );
                return data.area;
            } catch (e) {
                if (e instanceof ApiClientError && e.status === 404)
                    return undefined;
                throw e;
            }
        },
        []
    );

    const updateArea: StorageContext['updateArea'] = useCallback(
        async ({ id, diagramId, attributes }) => {
            if (!diagramId) return;
            await apiPut(`/api/diagrams/${diagramId}/areas/${id}`, attributes);
        },
        []
    );

    const deleteArea: StorageContext['deleteArea'] = useCallback(
        async ({ diagramId, id }) => {
            await apiDelete(`/api/diagrams/${diagramId}/areas/${id}`);
        },
        []
    );

    const listAreas: StorageContext['listAreas'] = useCallback(
        async (diagramId) => {
            const data = await apiGet<AreasResponse>(
                `/api/diagrams/${diagramId}/areas`
            );
            return data.areas;
        },
        []
    );

    const deleteDiagramAreas: StorageContext['deleteDiagramAreas'] =
        useCallback(async (diagramId) => {
            await apiPut(`/api/diagrams/${diagramId}`, { areas: [] });
        }, []);

    // ─── Custom types (API) ───────────────────────────────────────────────────

    const addCustomType: StorageContext['addCustomType'] = useCallback(
        async ({ diagramId, customType }) => {
            await apiPost(
                `/api/diagrams/${diagramId}/custom-types`,
                customType
            );
        },
        []
    );

    const getCustomType: StorageContext['getCustomType'] = useCallback(
        async ({ diagramId, id }) => {
            try {
                const data = await apiGet<CustomTypeResponse>(
                    `/api/diagrams/${diagramId}/custom-types/${id}`
                );
                return data.customType;
            } catch (e) {
                if (e instanceof ApiClientError && e.status === 404)
                    return undefined;
                throw e;
            }
        },
        []
    );

    const updateCustomType: StorageContext['updateCustomType'] = useCallback(
        async ({ id, diagramId, attributes }) => {
            if (!diagramId) return;
            await apiPut(
                `/api/diagrams/${diagramId}/custom-types/${id}`,
                attributes
            );
        },
        []
    );

    const deleteCustomType: StorageContext['deleteCustomType'] = useCallback(
        async ({ diagramId, id }) => {
            await apiDelete(`/api/diagrams/${diagramId}/custom-types/${id}`);
        },
        []
    );

    const listCustomTypes: StorageContext['listCustomTypes'] = useCallback(
        async (diagramId) => {
            const data = await apiGet<CustomTypesResponse>(
                `/api/diagrams/${diagramId}/custom-types`
            );
            return data.customTypes.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
        },
        []
    );

    const deleteDiagramCustomTypes: StorageContext['deleteDiagramCustomTypes'] =
        useCallback(async (diagramId) => {
            await apiPut(`/api/diagrams/${diagramId}`, { customTypes: [] });
        }, []);

    // ─── Notes (API) ──────────────────────────────────────────────────────────

    const addNote: StorageContext['addNote'] = useCallback(
        async ({ diagramId, note }) => {
            await apiPost(`/api/diagrams/${diagramId}/notes`, note);
        },
        []
    );

    const getNote: StorageContext['getNote'] = useCallback(
        async ({ diagramId, id }) => {
            try {
                const data = await apiGet<NoteResponse>(
                    `/api/diagrams/${diagramId}/notes/${id}`
                );
                return data.note;
            } catch (e) {
                if (e instanceof ApiClientError && e.status === 404)
                    return undefined;
                throw e;
            }
        },
        []
    );

    const updateNote: StorageContext['updateNote'] = useCallback(
        async ({ id, diagramId, attributes }) => {
            if (!diagramId) return;
            await apiPut(`/api/diagrams/${diagramId}/notes/${id}`, attributes);
        },
        []
    );

    const deleteNote: StorageContext['deleteNote'] = useCallback(
        async ({ diagramId, id }) => {
            await apiDelete(`/api/diagrams/${diagramId}/notes/${id}`);
        },
        []
    );

    const listNotes: StorageContext['listNotes'] = useCallback(
        async (diagramId) => {
            const data = await apiGet<NotesResponse>(
                `/api/diagrams/${diagramId}/notes`
            );
            return data.notes;
        },
        []
    );

    const deleteDiagramNotes: StorageContext['deleteDiagramNotes'] =
        useCallback(async (diagramId) => {
            await apiPut(`/api/diagrams/${diagramId}`, { notes: [] });
        }, []);

    // ─── Diagrams (API) ───────────────────────────────────────────────────────

    const addDiagram: StorageContext['addDiagram'] = useCallback(
        async ({ diagram }) => {
            // Send full diagram (including embedded sub-resources) in one request.
            // Dependencies are not part of the API and remain in Dexie.
            const { dependencies, ...rest } = diagram;
            await apiPost('/api/diagrams', {
                ...rest,
                tables: rest.tables ?? [],
                relationships: rest.relationships ?? [],
                areas: rest.areas ?? [],
                notes: rest.notes ?? [],
                customTypes: rest.customTypes ?? [],
            });

            for (const dep of dependencies ?? []) {
                await addDependency({ diagramId: diagram.id, dependency: dep });
            }
        },
        [addDependency]
    );

    const listDiagrams: StorageContext['listDiagrams'] = useCallback(
        async (
            options = {
                includeRelationships: false,
                includeTables: false,
                includeDependencies: false,
                includeAreas: false,
                includeCustomTypes: false,
                includeNotes: false,
            }
        ) => {
            const data = await apiGet<DiagramListResponse>('/api/diagrams');
            let diagrams = data.diagrams.map(fromApiDiagram);

            const needsFullFetch =
                options.includeTables ||
                options.includeRelationships ||
                options.includeAreas ||
                options.includeCustomTypes ||
                options.includeNotes;

            if (needsFullFetch) {
                diagrams = await Promise.all(
                    diagrams.map(
                        (d) => getDiagram(d.id, options) as Promise<Diagram>
                    )
                );
            }

            if (options.includeDependencies) {
                diagrams = await Promise.all(
                    diagrams.map(async (d) => ({
                        ...d,
                        dependencies: await listDependencies(d.id),
                    }))
                );
            }

            return diagrams;
        },
        [getDiagram, listDependencies]
    );

    const getDiagram: StorageContext['getDiagram'] = useCallback(
        async (
            id,
            options = {
                includeRelationships: false,
                includeTables: false,
                includeDependencies: false,
                includeAreas: false,
                includeCustomTypes: false,
                includeNotes: false,
            }
        ) => {
            try {
                const data = await apiGet<DiagramResponse>(
                    `/api/diagrams/${id}`
                );
                const raw = data.diagram as Record<string, unknown> & {
                    tables?: DBTable[];
                    relationships?: DBRelationship[];
                    areas?: Area[];
                    notes?: Note[];
                    customTypes?: DBCustomType[];
                };

                const diagram = fromApiDiagram(raw);

                if (!options.includeTables) delete diagram.tables;
                if (!options.includeRelationships) delete diagram.relationships;
                if (!options.includeAreas) delete diagram.areas;
                if (!options.includeNotes) delete diagram.notes;
                if (!options.includeCustomTypes) delete diagram.customTypes;

                if (options.includeDependencies) {
                    diagram.dependencies = await listDependencies(id);
                }

                return diagram;
            } catch (e) {
                if (e instanceof ApiClientError && e.status === 404)
                    return undefined;
                throw e;
            }
        },
        [listDependencies]
    );

    const updateDiagram: StorageContext['updateDiagram'] = useCallback(
        async ({ id, attributes }) => {
            // Changing the diagram's own id is not supported via the API.
            // Strip out fields that should not be sent to the API.
            const payload = { ...attributes } as Record<string, unknown>;
            delete payload['id'];
            delete payload['dependencies'];
            if (Object.keys(payload).length > 0) {
                await apiPut(`/api/diagrams/${id}`, payload);
            }
        },
        []
    );

    const deleteDiagram: StorageContext['deleteDiagram'] = useCallback(
        async (id) => {
            await Promise.all([
                apiDelete(`/api/diagrams/${id}`),
                deleteDiagramDependencies(id),
            ]);
        },
        [deleteDiagramDependencies]
    );

    return (
        <storageContext.Provider
            value={{
                getConfig,
                updateConfig,
                addDiagram,
                listDiagrams,
                getDiagram,
                updateDiagram,
                deleteDiagram,
                addTable,
                getTable,
                updateTable,
                putTable,
                deleteTable,
                listTables,
                addRelationship,
                getRelationship,
                updateRelationship,
                deleteRelationship,
                listRelationships,
                deleteDiagramTables,
                deleteDiagramRelationships,
                addDependency,
                getDependency,
                updateDependency,
                deleteDependency,
                listDependencies,
                deleteDiagramDependencies,
                addArea,
                getArea,
                updateArea,
                deleteArea,
                listAreas,
                deleteDiagramAreas,
                addCustomType,
                getCustomType,
                updateCustomType,
                deleteCustomType,
                listCustomTypes,
                deleteDiagramCustomTypes,
                addNote,
                getNote,
                updateNote,
                deleteNote,
                listNotes,
                deleteDiagramNotes,
                getDiagramFilter,
                updateDiagramFilter,
                deleteDiagramFilter,
            }}
        >
            {children}
        </storageContext.Provider>
    );
};
