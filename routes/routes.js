const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const users = require('../models/users');
const fs = require('fs');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.filename + "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single('image')

router.post('/add', upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });
    user.save()
        .catch((err) => {
            res.json({ message:err.message, type:'danger'});
        })
        .then((result) => {
            req.session.message ={
                type:'primary',
                message:'User added successfully'
            }
            res.redirect('/')
        })

});


router.get('/', (req, res) => {
    User.find()
        .catch((err) => {
            res.json({ message: err.message });
        })
        .then((users) => {
            res.render('index', {
                title: 'CRUD APP',
                users: users,
            })
        })
})

router.get('/add', (req, res) => {
    res.render('adduser', { title: 'ADD USER' })
});

// edit user
router.get('/edit/:_id', (req, res) => {
    let id = req.params._id;
    User.findById(id)
        .catch((err) => {
            res.redirect('/');
        })
        .then((user) => {
            res.render('editusers', {
                title: 'EDIT USER',
                user: user,
            })
        })
})

// update user route

router.post('/update/:_id', upload, (req, res) => {
    let id = req.params._id;
    let new_image = '';
    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/+req.body.old_image');
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image,
    })
        .catch((err) => {
            res.json({ mesage: err.message, type: 'danger' });
        })
        .then((result) => {
            req.session.message = {
                type: 'success',
                message: 'updated succesfully'
            };
            res.redirect('/')
        })
})

//delete user
router.get('/delete/:_id', (req, res) => {
    let id = req.params._id;
    User.findByIdAndRemove(id)
        .then((result) => {
            if (result.image != "") {
                try {
                    fs.unlinkSync('./uploads/' + result.image);
                } catch (err) {
                    console.log(err);
                }
            }
            if (err) {
                res.json({ mesaage: err.message });
            }
        })
        .catch((err) => {
            req.session.message = {
                type: 'info',
                message: 'deleted syccesfully'
            };
            res.redirect('/');
        })
})


module.exports = router;