const asyncHandler = require("express-async-handler")
const { Unit, validateCreateUnit, validateUpdateUnit } = require("../models/Unit")

const getAllUnits = asyncHandler(
    async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const units = await Unit.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
        const count = await Unit.countDocuments();
        if (units) {
            res.status(200).json({
                status: 'success',
                count: count,
                result: units,
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Units are not found"
            })
        }
    }
)

const getUnitById = asyncHandler(
    async (req, res) => {
        const unit = await Unit.findById(req.params.id)
        if (unit) {
            res.status(200).json({
                status: 'success',
                result: unit
            })
        } else {
            res.status(404).json({
                status: "error",
                message: "Unit is not found"
            })
        }
    }
)

const createUnit = asyncHandler(
    async (req, res) => {
        const { error } = validateCreateUnit(req.body)
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message
            })
        }
        const unit = new Unit(
            {
                name: req.body.name,
                lectures: req.body.lectures,
            }
        )
        const result = await unit.save()
        res.status(201).json({
            status: 'success',
            result: result
        })
    }
)

const updateUnit = asyncHandler(
    async (req, res) => {
        const { error } = validateUpdateUnit(req.body)
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message
            })
        }
        const updatedUnit = await Unit.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.name,
                lectures: req.body.lectures,
            }
        }, { new: true })
        if (updatedUnit) {
            res.status(200).json({
                status: 'success',
                result: updatedUnit
            })
        } else {
            res.status(400).json({
                status: 'error',
                message: "Unit is not found"
            })
        }
    }
)

const deleteUnit = asyncHandler(
    async (req, res) => {
        const { id } = req.params;
        const unit = await Unit.findByIdAndDelete(id)
        if (unit) {
            res.status(200).json({
                status: 'success',
                message: "Unit has been deleted"
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Unit is not found"
            })
        }
    });

const deleteAllUnits = asyncHandler(async (req, res) => {
    await Unit.deleteMany({});
    res.status(200).json({ message: 'All Units have been deleted successfully.' });
});

module.exports = {
    getAllUnits,
    getUnitById,
    createUnit,
    updateUnit,
    deleteUnit,
    deleteAllUnits
}
