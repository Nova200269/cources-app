const mongoose = require('mongoose');
const joi = require("joi");
const translate = [{
    lang: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        required: true,
    }
}];

const translationArraySchema = joi.array().items(joi.object({
    lang: joi.string().required(),
    value: joi.string().required(),
}));

const languagesSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
}, { collection: "language", timestamps: true });

const Language = mongoose.model('Language', languagesSchema);

// function validateCreateLanguage(obj) {
//     const schema = joi.object({
//         code: joi.string().required(),
//     });
//     return schema.validate(obj);
// }

// function validateUpdateLanguage(obj) {
//     const schema = joi.object({
//         code: joi.string(),
//     });
//     return schema.validate(obj);
// }

function getTranslation(translations, lang) {
    const translation = translations.find(t => t.lang === lang);
    if (!translation) {
        const englishTranslation = translations.find(t => t.lang === 'en');
        return englishTranslation ? englishTranslation.value : null;
    }
    return translation.value;
}

module.exports = {
    translate,
    Language,
    getTranslation,
    translationArraySchema
};