var express = require('express');
var router = express.Router();
var skill_dal = require('../dal/skill_dal');

/* GET users listing. */
router.get('/all', function(req, res, next) {
    skill_dal.getAll(function(err, result) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            console.log(result);
            res.render('skill/skill_view_all', {skills: result});
        }
    })
});

router.get('/add', function(req, res) {
    res.render('skill/skill_add');
});

router.get('/insert', function(req, res) {
    skill_dal.insert(req.query, function(err, result) {
        if(err) {
            console.log(err);
            res.send(err);
        }
        else {
            res.redirect(302, '/skill/all');
        }
    });
});

module.exports = router;