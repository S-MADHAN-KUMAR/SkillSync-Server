import { Model, Document, FilterQuery, UpdateQuery } from "mongoose";

export interface IGenericRepository<T extends Document> {
    create(payload: Partial<T>): Promise<T>;
    findById(id: string): Promise<T | null>;
    findOne(filter: object): Promise<T | null>;
    countDocuments(filter: object): Promise<number>;
    findAll(filter?: object, skip?: number, limit?: number): Promise<T[]>;
    update(id: string, data: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<Boolean>;
    updateNull(id: string, data: Partial<T>): Promise<T | null>
    //=================================================================//
    // updateMany(filter: FilterQuery<T>, data: Partial<T>): Promise<number>;
    updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<number>;


}

export class GenericRepository<T extends Document>
    implements IGenericRepository<T> {
    private model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async create(payload: Partial<T>): Promise<T> {
        return await this.model.create(payload);
    }

    async findById(id: string): Promise<T | null> {
        return await this.model.findById(id);
    }

    async findOne(filter: object): Promise<T | null> {
        return await this.model.findOne(filter);
    }

    async findAll(filter: object = {}, skip: number = 0, limit: number = 10): Promise<T[]> {
        return await this.model.find(filter).skip(skip).limit(limit);
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        const filteredData = Object.fromEntries(
            Object.entries(data).filter(([_, value]) => value != null && value !== '')
        );

        if (Object.keys(filteredData).length === 0) {
            return null;
        }

        return await this.model.findByIdAndUpdate(
            id,
            { $set: filteredData } as any,
            { new: true, upsert: false }
        );
    }

    async countDocuments(filter: object = {}): Promise<number> {
        return await this.model.countDocuments(filter);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.model.findByIdAndDelete(id);
        return result !== null;
    }

    async updateNull(id: string, data: Partial<T>): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, data, { new: true });
    }
    //=============================================================================//
    // async updateMany(
    //     filter: FilterQuery<T>,
    //     data: Partial<T>
    // ): Promise<number> {
    //     const filteredData = Object.fromEntries(
    //         Object.entries(data).filter(([_, value]) => value != null && value !== '')
    //     );

    //     if (Object.keys(filteredData).length === 0) {
    //         return 0;
    //     }

    //     const result = await this.model.updateMany(
    //         filter,
    //         { $set: filteredData } as UpdateQuery<T>
    //     );

    //     return result.modifiedCount || 0;
    // }

    async updateMany(
        filter: FilterQuery<T>,
        update: UpdateQuery<T>
    ): Promise<number> {
        const result = await this.model.updateMany(filter, update);
        return result.modifiedCount || 0;
    }

}