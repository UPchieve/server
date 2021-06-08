import { Model, Document, Types } from 'mongoose'
import {
  RepoCreateError,
  RepoReadError,
  RepoUpdateError,
  RepoDeleteError
} from './Errors'

export interface Create<T extends Record<string, any>> {
  create(data: Partial<T>): Promise<T>
}

export interface Read<T extends Record<string, any>> {
  getById(id: Types.ObjectId | string): Promise<T>
  getAll(): Promise<T[]>
  getOneByPartial(template: Partial<T>): Promise<T>
}

export interface Update<T extends Record<string, any>> {
  updateById(id: Types.ObjectId | string, update: Partial<T>): Promise<Boolean>
}

export interface Delete<T extends Record<string, any>> {
  deleteById(id: Types.ObjectId | string): Promise<boolean>
}

export type Repository<T> = Create<T> & Read<T> & Update<T> & Delete<T>

export function createFactory<T extends Record<string, any>>(
  model: Model<T & Document>
): Create<T> {
  const create = async (data: Partial<T>): Promise<T> => {
    try {
      const doc = await model.create(data)
      return doc.toObject() as T
    } catch (err) {
      throw new RepoCreateError(err.message)
    }
  }
  return { create }
}

export function readFactory<T extends Record<string, any>>(
  model: Model<T & Document>
): Read<T> {
  const getById = async (id: Types.ObjectId | string): Promise<T> => {
    try {
      return await model
        .findById(id)
        .lean()
        .exec() as T
    } catch (err) {
      throw new RepoReadError(err.message)
    }
  }
  const getAll = async (): Promise<T[]> => {
    try {
      return await model
        .find()
        .lean()
        .exec() as T[]
    } catch (err) {
      throw new RepoReadError(err.message)
    }
  }
  const getOneByPartial = async (template: Partial<T>): Promise<T> => {
    try {
      return await model
        .findOne(template)
        .lean()
        .exec() as T
    } catch (err) {
      throw new RepoReadError(err.message)
    }
  }
  return { getById, getAll, getOneByPartial }
}

export function updateFactory<T extends Record<string, any>>(
  model: Model<T & Document>
): Update<T> {
  const updateById = async (
    id: Types.ObjectId | string,
    update: Partial<T>
  ): Promise<Boolean> => {
    try {
      // @ts-expect-error
      const data = await model.updateOne({ _id: id }, update).exec()
      if (data.modifiedCount) return true
      return false
    } catch (err) {
      throw new RepoUpdateError(err.message)
    }
  }
  return { updateById }
}

export function deleteFactory<T extends Record<string, any>>(
  model: Model<T & Document>
): Delete<T> {
  const deleteById = async (id: Types.ObjectId | string): Promise<boolean> => {
    try {
      // @ts-expect-error
      const data = await model.deleteOne({ _id: id }).exec()
      if (data.deletedCount) return true
      return false
    } catch (err) {
      throw new RepoDeleteError(err.message)
    }
  }
  return { deleteById }
}

export function repositoryFactory<T extends Record<string, any>>(
  model: Model<T & Document>
): Repository<T> {
  return {
    ...createFactory<T>(model),
    ...readFactory<T>(model),
    ...updateFactory<T>(model),
    ...deleteFactory<T>(model)
  } as Repository<T>
}
