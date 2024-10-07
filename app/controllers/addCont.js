const asyncHandler = require("express-async-handler")
const { Add, validateCreateAdd, validateUpdateAdd } = require("../models/Add")

const getAllAdds = asyncHandler(
    async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const adds = await Add.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
        const count = await Add.countDocuments();
        if (adds) {
            res.status(200).json({
                status: 'success',
                count: count,
                result: adds,
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Adds are not found"
            })
        }
    }
)

const getAddById = asyncHandler(
    async (req, res) => {
        const add = await Add.findById(req.params.id)
        if (add) {
            res.status(200).json({
                status: 'success',
                result: add
            })
        } else {
            res.status(404).json({
                status: "error",
                message: "Add is not found"
            })
        }
    }
)

const createAdd = asyncHandler(
    async (req, res) => {
        const { error } = validateCreateAdd(req.body)
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message
            })
        }
        const add = new Add(
            {
                image: req.body.image,
                text: req.body.text,
                url: req.body.url
            }
        )
        const result = await add.save()
        res.status(201).json({
            status: 'success',
            result: result
        })
    }
)

const updateAdd = asyncHandler(
    async (req, res) => {
        const { error } = validateUpdateAdd(req.body)
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message
            })
        }
        const updatedAdd = await Add.findByIdAndUpdate(req.params.id, {
            $set: {
                image: req.body.image,
                text: req.body.text,
                url: req.body.url
            }
        }, { new: true })
        if (updatedAdd) {
            res.status(200).json({
                status: 'success',
                result: updatedAdd
            })
        } else {
            res.status(400).json({
                status: 'error',
                message: "Add is not found"
            })
        }
    }
)

const deleteAdd = asyncHandler(
    async (req, res) => {
        const { id } = req.params;
        const add = await Add.findByIdAndDelete(id)
        if (add) {
            res.status(200).json({
                status: 'success',
                message: "Add has been deleted"
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Add is not found"
            })
        }
    });

const deleteAllAdds = asyncHandler(async (req, res) => {
    await Add.deleteMany({});
    res.status(200).json({ message: 'All Adds have been deleted successfully.' });
});

module.exports = {
    getAllAdds,
    getAddById,
    createAdd,
    updateAdd,
    deleteAdd,
    deleteAllAdds
}
