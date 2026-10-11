import {
    createFunction,
    readFunction,
    readByIdFunction,
    readByUniqueKeyFunction,
    updateFunction,
    deleteFunction
} from "../../services/mapping/location.service.js";

const create = async (req, res) => {}
const read = async (req, res) => {}
const readById = async (req, res) => {}
const readByUniqueKey = async (req, res) => {}
const update = async (req, res) => {}
const remove = async (req, res) => {}

const Location = { create, read, readById, readByUniqueKey, update, remove };
export default Location;