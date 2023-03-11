const ctrlWrapper = ctrl => {
    const func = async (req, res, next) => {
        try {
            await ctrl(req, res, next);
        } catch (error) {
            console.log("Error in wrapper",error);
            next(error)
        }
    }
    return func;
}

module.exports = ctrlWrapper;