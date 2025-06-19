import { Model, Document, FilterQuery, UpdateQuery, PipelineStage } from "mongoose";

export interface IGenericRepository<T extends Document> {
    create(payload: Partial<T>): Promise<T>;
    findById(id: string): Promise<T | null>;
    findOne(filter: object): Promise<T | null>;
    countDocuments(filter: object): Promise<number>;
    findAll(filter?: object, skip?: number, limit?: number): Promise<T[]>;
    update(id: string, data: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<Boolean>;
    updateNull(id: string, data: Partial<T>): Promise<T | null>
    updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<number>;
    findOneAndUpdate(
        filter: FilterQuery<T>,
        update: UpdateQuery<T>
    ): Promise<T | null>;
    findOneAndDelete(
        filter: FilterQuery<T>,
    ): Promise<boolean>
    deleteMany(filter: FilterQuery<T>): Promise<boolean>;




    aggregate(pipeline: any[]): Promise<any[]>
    incrementField(id: string, field: keyof T, amount?: number): Promise<T | null>;
    decrementField(id: string, field: keyof T, amount?: number): Promise<T | null>;

    /** New method for sorted find */
    findAllSorted(
        filter?: FilterQuery<T>,
        sort?: Record<string, 1 | -1>,
        skip?: number,
        limit?: number
    ): Promise<T[]>;
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
        return await this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    }

    // async update(id: string, data: Partial<T>): Promise<T | null> {
    //     const filteredData = Object.fromEntries(
    //         Object.entries(data).filter(([_, value]) => value != null && value !== '')
    //     );

    //     if (Object.keys(filteredData).length === 0) {
    //         return null;
    //     }

    //     return await this.model.findByIdAndUpdate(
    //         id,
    //         { $set: filteredData } as any,
    //         { new: true, upsert: false }
    //     );
    // }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        const filteredData: Partial<T> = Object.fromEntries(
            Object.entries(data).filter(([_, value]) => value != null && value !== '')
        ) as Partial<T>;

        if (Object.keys(filteredData).length === 0) {
            return null;
        }

        return this.model.findByIdAndUpdate(
            id,
            { $set: filteredData },
            { new: true, upsert: false }
        ).exec();
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

    async findOneAndUpdate(
        filter: FilterQuery<T>,
        update: UpdateQuery<T>
    ): Promise<T | null> {
        return await this.model.findOneAndUpdate(filter, update, {
            new: true,
            upsert: false,
        });
    }

    async findOneAndDelete(filter: FilterQuery<T>): Promise<boolean> {
        const result = await this.model.findOneAndDelete(filter);
        return result !== null;
    }

    async updateMany(
        filter: FilterQuery<T>,
        update: UpdateQuery<T>
    ): Promise<number> {
        const result = await this.model.updateMany(filter, update);
        return result.modifiedCount || 0;
    }

    async deleteMany(filter: FilterQuery<T>): Promise<boolean> {
        const result = await this.model.deleteMany(filter);
        return result.deletedCount > 0;
    }

    async aggregate(pipeline: any[]): Promise<any[]> {
        return this.model.aggregate(pipeline).exec();
    }

    async incrementField(id: string, field: keyof T, amount: number = 1): Promise<T | null> {
        return await this.model.findByIdAndUpdate(
            id,
            { $inc: { [field]: amount } } as UpdateQuery<T>,
            { new: true }
        );
    }

    async decrementField(id: string, field: keyof T, amount: number = 1): Promise<T | null> {
        return await this.model.findByIdAndUpdate(
            id,
            { $inc: { [field]: -amount } } as UpdateQuery<T>,
            { new: true }
        );
    }


    async findAllSorted(
        filter: FilterQuery<T> = {},
        sort: Record<string, 1 | -1> = { createdAt: -1 },
        skip = 0,
        limit = 0
    ): Promise<T[]> {
        return await this.model.find(filter).sort(sort).skip(skip).limit(limit);
    }


}