import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

// ─── Sub-document interfaces ────────────────────────────────────────────────

export interface IDBField {
    id: string;
    name: string;
    type: Record<string, unknown>;
    primaryKey: boolean;
    unique: boolean;
    nullable: boolean;
    increment?: boolean | null;
    isArray?: boolean | null;
    createdAt: number;
    characterMaximumLength?: string | null;
    precision?: number | null;
    scale?: number | null;
    default?: string | null;
    collation?: string | null;
    comments?: string | null;
    check?: string | null;
}

export interface IDBIndex {
    id: string;
    name: string;
    unique: boolean;
    fieldIds: string[];
    createdAt: number;
    type?: string | null;
    isPrimaryKey?: boolean | null;
    comments?: string | null;
}

export interface IDBCheckConstraint {
    id: string;
    name: string;
    definition: string;
}

export interface IDBTable {
    id: string;
    name: string;
    schema?: string | null;
    x: number;
    y: number;
    fields: IDBField[];
    indexes: IDBIndex[];
    checkConstraints?: IDBCheckConstraint[] | null;
    color: string;
    isView: boolean;
    isMaterializedView?: boolean | null;
    createdAt: number;
    width?: number | null;
    comments?: string | null;
    order?: number | null;
    expanded?: boolean | null;
    parentAreaId?: string | null;
}

export interface IDBRelationship {
    id: string;
    name: string;
    sourceSchema?: string | null;
    sourceTableId: string;
    targetSchema?: string | null;
    targetTableId: string;
    sourceFieldId: string;
    targetFieldId: string;
    sourceCardinality: 'one' | 'many';
    targetCardinality: 'one' | 'many';
    createdAt: number;
}

export interface IDBDependency {
    id: string;
    schema?: string | null;
    tableId: string;
    dependentSchema?: string | null;
    dependentTableId: string;
    createdAt: number;
}

export interface IArea {
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    order?: number;
}

export interface INote {
    id: string;
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    order?: number;
}

export interface IDBCustomTypeField {
    field: string;
    type: string;
}

export interface IDBCustomType {
    id: string;
    schema?: string | null;
    name: string;
    kind: 'enum' | 'composite';
    values?: string[] | null;
    fields?: IDBCustomTypeField[] | null;
    order?: number | null;
}

// ─── Top-level Diagram interface ─────────────────────────────────────────────

export interface IDiagram extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    databaseType: string;
    databaseEdition?: string | null;
    tables: IDBTable[];
    relationships: IDBRelationship[];
    dependencies: IDBDependency[];
    areas: IArea[];
    notes: INote[];
    customTypes: IDBCustomType[];
    createdAt: Date;
    updatedAt: Date;
}

// ─── Sub-document schemas ─────────────────────────────────────────────────────

const dbFieldSchema = new Schema<IDBField>(
    {
        id: { type: String, required: true },
        name: { type: String, required: true },
        type: { type: Schema.Types.Mixed, required: true },
        primaryKey: { type: Boolean, default: false },
        unique: { type: Boolean, default: false },
        nullable: { type: Boolean, default: true },
        increment: { type: Boolean, default: null },
        isArray: { type: Boolean, default: null },
        createdAt: { type: Number, required: true },
        characterMaximumLength: { type: String, default: null },
        precision: { type: Number, default: null },
        scale: { type: Number, default: null },
        default: { type: String, default: null },
        collation: { type: String, default: null },
        comments: { type: String, default: null },
        check: { type: String, default: null },
    },
    { _id: false }
);

const dbIndexSchema = new Schema<IDBIndex>(
    {
        id: { type: String, required: true },
        name: { type: String, required: true },
        unique: { type: Boolean, default: false },
        fieldIds: [{ type: String }],
        createdAt: { type: Number, required: true },
        type: { type: String, default: null },
        isPrimaryKey: { type: Boolean, default: null },
        comments: { type: String, default: null },
    },
    { _id: false }
);

const dbCheckConstraintSchema = new Schema<IDBCheckConstraint>(
    {
        id: { type: String, required: true },
        name: { type: String, required: true },
        definition: { type: String, required: true },
    },
    { _id: false }
);

const dbTableSchema = new Schema<IDBTable>(
    {
        id: { type: String, required: true },
        name: { type: String, required: true },
        schema: { type: String, default: null },
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        fields: [dbFieldSchema],
        indexes: [dbIndexSchema],
        checkConstraints: [dbCheckConstraintSchema],
        color: { type: String, required: true },
        isView: { type: Boolean, default: false },
        isMaterializedView: { type: Boolean, default: null },
        createdAt: { type: Number, required: true },
        width: { type: Number, default: null },
        comments: { type: String, default: null },
        order: { type: Number, default: null },
        expanded: { type: Boolean, default: null },
        parentAreaId: { type: String, default: null },
    },
    { _id: false }
);

const dbRelationshipSchema = new Schema<IDBRelationship>(
    {
        id: { type: String, required: true },
        name: { type: String, required: true },
        sourceSchema: { type: String, default: null },
        sourceTableId: { type: String, required: true },
        targetSchema: { type: String, default: null },
        targetTableId: { type: String, required: true },
        sourceFieldId: { type: String, required: true },
        targetFieldId: { type: String, required: true },
        sourceCardinality: {
            type: String,
            enum: ['one', 'many'],
            required: true,
        },
        targetCardinality: {
            type: String,
            enum: ['one', 'many'],
            required: true,
        },
        createdAt: { type: Number, required: true },
    },
    { _id: false }
);

const dbDependencySchema = new Schema<IDBDependency>(
    {
        id: { type: String, required: true },
        schema: { type: String, default: null },
        tableId: { type: String, required: true },
        dependentSchema: { type: String, default: null },
        dependentTableId: { type: String, required: true },
        createdAt: { type: Number, required: true },
    },
    { _id: false }
);

const areaSchema = new Schema<IArea>(
    {
        id: { type: String, required: true },
        name: { type: String, required: true },
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        color: { type: String, required: true },
        order: { type: Number },
    },
    { _id: false }
);

const noteSchema = new Schema<INote>(
    {
        id: { type: String, required: true },
        content: { type: String, required: true },
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        color: { type: String, required: true },
        order: { type: Number },
    },
    { _id: false }
);

const dbCustomTypeFieldSchema = new Schema<IDBCustomTypeField>(
    {
        field: { type: String, required: true },
        type: { type: String, required: true },
    },
    { _id: false }
);

const dbCustomTypeSchema = new Schema<IDBCustomType>(
    {
        id: { type: String, required: true },
        schema: { type: String, default: null },
        name: { type: String, required: true },
        kind: { type: String, enum: ['enum', 'composite'], required: true },
        values: [{ type: String }],
        fields: [dbCustomTypeFieldSchema],
        order: { type: Number, default: null },
    },
    { _id: false }
);

// ─── Diagram schema ───────────────────────────────────────────────────────────

const diagramSchema = new Schema<IDiagram>(
    {
        // @ts-expect-error overriding default ObjectId _id with String
        _id: { type: String, required: true },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: { type: String, required: true, trim: true },
        databaseType: { type: String, required: true },
        databaseEdition: { type: String, default: null },
        tables: [dbTableSchema],
        relationships: [dbRelationshipSchema],
        dependencies: [dbDependencySchema],
        areas: [areaSchema],
        notes: [noteSchema],
        customTypes: [dbCustomTypeSchema],
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc, ret: Record<string, unknown>) {
                ret['id'] = ret['_id'];
                delete ret['_id'];
                delete ret['__v'];
                return ret;
            },
        },
    }
);

export const Diagram = mongoose.model<IDiagram>('Diagram', diagramSchema);
