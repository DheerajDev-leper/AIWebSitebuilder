import User from "../models/user.model.js";

export const getCurrentUser = async (req,res) =>{
    try {
        if (!req.user){
            return res.json({user:null})
        }
        return res.json(req.user)
    } catch (error) {
        return res.status(500).json({message:`Current user error ${error}`})
    }
}

export const addCredits = async (req, res) => {
    try {
        const { plan } = req.body;

        const planCredits = {
            free: 100,
            pro: 500,
            premium: 1200,
        };

        if (!planCredits[plan]) {
            return res.status(400).json({
                message: "Invalid plan",
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $inc: {
                    credits: planCredits[plan],
                },
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            message: `${planCredits[plan]} credits added successfully`,
            credits: user.credits,
        });

    } catch (error) {
        console.log("Add credits error:", error);

        return res.status(500).json({
            message: "Failed to add credits",
        });
    }
};
