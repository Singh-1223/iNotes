const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const fetchuser = require("../middleware/Fetchusers");
const Note = require("../models/Note");

// ROUTE :1 -- Get all the Notes using :GET "/api/notes/fetchallnotes" . Login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Some Error occured");
    }
});

// ROUTE :2 -- Add new Notes using :POST "/api/notes/addnote" . Login required
router.post("/addnote", fetchuser,
    [
        body("title", "Enter a valid title").isLength({ min: 3 }),
        body("description", "Description must be atleast 5 characters").isLength({ min: 5, }),
    ],
    async (req, res) => {
        try {
            // if there are errors, return bad requests and errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { title, description, tag } = req.body;

            const note = new Note({
                title,
                description,
                tag,
                user: req.user.id,
            });
            const savedNote = await note.save();
            res.json(savedNote);
        } catch (error) {
            console.log(error.message);
            res.status(500).send("Some Error occured");
        }
    }
);

// ROUTE :3 -- Update existing note using :PUT "/api/notes/addnote" . Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        //Create a newNote object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        // Find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }
        // Allow updation only if user owns this Note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Some Error occured");
    }

})

// ROUTE :4 -- Delete existing note using :DELETE "/api/notes/deletenote" . Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    try {
        // Find the note to be deleted and delete it
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }

        // Allow deletion only if user owns this Note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ 'success': 'note has been deleter', note: note });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Some Error occured");
    }
})

module.exports = router;
