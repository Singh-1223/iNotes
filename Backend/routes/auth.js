const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // json web token , signing data with secret , make cookei
const fetchuser = require('../middleware/Fetchusers');
const JWT_SECRET = "whatadayboy";

// ROUTE : 1   Create a User using: POST '/api/auth/signup'. NO login required
router.post("/signup",
    [
        body("name", "Enter a valid name").isLength({ min: 3 }),
        body("email", "Enter a valid Email").isEmail(),
        body("password", "Password must be atleast 5 characters").isLength({
            min: 5,
        }),
    ],
    async (req, res) => {
        let success=false;
        // if there are errors, return bad requests and errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success,errors: errors.array() });
        }

        try {
            // check whether the user wiht this email exists already
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                return res
                    .status(400)
                    .json({success, error: "Sorry a user with this email already exists" });
            }

            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt); // generating a secure password
            // creating a new user
            user = await User.create({
                name: req.body.name,
                password: secPass,
                email: req.body.email,
            });

            const data = {
                user: {
                    id: user.id,
                },
            };

            const authtoken = jwt.sign(data, JWT_SECRET); // signing data wiht JWT_SECRET
             success=true;
            res.json({ success,authtoken });
            // res.json(user);
        } catch (error) {
            console.log(error.message);
            res.status(500).send("Some Error occured");
        }
    }
);

// ROUTE :2 -  Authenticate a User using: POST '/api/auth/login'.

router.post("/login",
    [
        body("email", "Enter a valid Email").isEmail(),
        body("password", "Passwor coannot be blank").exists(),
    ],
    async (req, res) => {
        let success=false;
        // if there are errors, return bad requests and errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (!user) {
                success:false
                return res
                    .status(400)
                    .json({ error: "Please try to login with correct credentials" });
            }

            const passwordCompare = await bcrypt.compare(password, user.password);
            if (!passwordCompare) {
                success=false;
                return res
                    .status(400)
                    .json({ success,error: "Please try to login with correct credentials" });
            }

            const data = {
                user: {
                    id: user.id,
                },
            };
            const authtoken = jwt.sign(data, JWT_SECRET); // signing data wiht JWT_SECRET
            success=true;
            res.json({ success,authtoken });
        } catch (error) {
            console.log(error.message);
            res.status(500).send("Internal Server Error");
        }
    }
);

// ROUTE :3 - Get loggedIn user details using: POST '/api/auth/getuser'.  LOGIN REQUIRED
router.post("/getuser",fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
