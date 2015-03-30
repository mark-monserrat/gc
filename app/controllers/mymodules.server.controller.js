'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    MyModule = mongoose.model('MyModule');

/**
 * Create a Module
 */
exports.create = function(req, res) {

};

/**
 * Show the current Module
 */
exports.read = function(req, res) {
    res.json(req.module);
};

/**
 * Update a Module
 */
exports.update = function(req, res) {

};

/**
 * Delete an Module
 */
exports.delete = function(req, res) {

};

/**
 * List of Modules
 */
exports.list = function(req, res) {
    var initiateModule = function(varmod, callback){
        var modules_ = [];
        var counter = 0;
        if(varmod.length===0){
            return callback(modules_);
        }
        getSubModules(varmod[counter],
            function(_mod, next) {
                if(_mod.privileges.length>0){
                    initiateModule(_mod.privileges, function(mode){
                        modules_.push({
                            _id: _mod._id,
                            en_us: _mod.en_us,
                            ch_hk: _mod.ch_hk,
                            priv_id: _mod.priv_id,
                            privileges: mode
                        });
                        counter++;
                        next(varmod[counter]);
                    });
                } else {
                    modules_.push(_mod);
                    counter++;
                    next(varmod[counter]);
                }
            },function(){
                callback(modules_);
            }
        );
    };
    var getSubModules = function(module_, next, finish){
        if(module_===undefined){
            finish();
            return;
        }
        MyModule.find({parent:module_._id}).exec(function(err, _submodules){
            if(err){
                return res.send(400,{
                    message:'Error'
                });
            } else {
                var _mod = {
                    _id : module_._id,
                    en_us : module_.en_us,
                    ch_hk : module_.ch_hk,
                    checked : module_.checked,
                    priv_id : module_.priv_id,
                    privileges : _submodules
                };
                next(_mod, function(_modules){
                    getSubModules(_modules, next, finish);
                });
            }
        });
    };

    // find all modules where parent is null
    MyModule.find({parent:{$exists:false}}).exec(function(err,_modules){
       if(err){
           return res.send(400, {
               message: 'Error populating modules'
           });
       } else {
           initiateModule(_modules,
               function(_modules_){
                   res.jsonp(_modules_);
               }
           );
       }
    });
};


/**
 * Module middleware
 */
exports.moduleByID = function(req, res, next, id) {
    MyModule.findById(id).exec(function(err, module) {
        if (err) return next(err);
        if (! module) return next(new Error('Failed to load Module ' + id));
        req.module = module;
        next();
    });
};