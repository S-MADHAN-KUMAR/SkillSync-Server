"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericRepository = void 0;
class GenericRepository {
    constructor(model) {
        this.model = model;
    }
    create(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.create(payload);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findById(id);
        });
    }
    findOne(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne(filter);
        });
    }
    findAll() {
        return __awaiter(this, arguments, void 0, function* (filter = {}, skip = 0, limit = 10) {
            return yield this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const filteredData = Object.fromEntries(Object.entries(data).filter(([_, value]) => value != null && value !== ''));
            if (Object.keys(filteredData).length === 0) {
                return null;
            }
            return yield this.model.findByIdAndUpdate(id, { $set: filteredData }, { new: true, upsert: false });
        });
    }
    countDocuments() {
        return __awaiter(this, arguments, void 0, function* (filter = {}) {
            return yield this.model.countDocuments(filter);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.findByIdAndDelete(id);
            return result !== null;
        });
    }
    updateNull(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndUpdate(id, data, { new: true });
        });
    }
    findOneAndUpdate(filter, update) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOneAndUpdate(filter, update, {
                new: true,
                upsert: false,
            });
        });
    }
    findOneAndDelete(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.findOneAndDelete(filter);
            return result !== null;
        });
    }
    updateMany(filter, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.updateMany(filter, update);
            return result.modifiedCount || 0;
        });
    }
    deleteMany(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.deleteMany(filter);
            return result.deletedCount > 0;
        });
    }
    aggregate(pipeline) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.aggregate(pipeline).exec();
        });
    }
    incrementField(id_1, field_1) {
        return __awaiter(this, arguments, void 0, function* (id, field, amount = 1) {
            return yield this.model.findByIdAndUpdate(id, { $inc: { [field]: amount } }, { new: true });
        });
    }
    decrementField(id_1, field_1) {
        return __awaiter(this, arguments, void 0, function* (id, field, amount = 1) {
            return yield this.model.findByIdAndUpdate(id, { $inc: { [field]: -amount } }, { new: true });
        });
    }
    findAllSorted() {
        return __awaiter(this, arguments, void 0, function* (filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 0) {
            return yield this.model.find(filter).sort(sort).skip(skip).limit(limit);
        });
    }
}
exports.GenericRepository = GenericRepository;
