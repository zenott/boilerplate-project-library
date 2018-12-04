/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if(err){
          console.log(err);
        } else {
          console.log('Successfully connected to the database');
          db.collection('books').find().toArray(function(err,doc){
            const toRet=doc.map(function(ele){return {title: ele.title, _id: ele._id, commentcount: (ele.comments) ? ele.comments.length : 0}})
            res.json(toRet);
          });
          
        }
      });
    })
    
    .post(function (req, res){
      var title = req.body.title;
      if(!title){
        res.json('no title provided');
        return;
      }
      //response will contain new book object including atleast _id and title
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if(err){
          console.log(err);
        } else {
          console.log('Successfully connected to the database');
          db.collection('books').insertOne({title: title}, function(err,doc){
            if(err){
              console.log(err);
            } else {
              res.json({title:title, _id:doc.insertedId});
            }
          })
        }
      });
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if(err){
          console.log(err);
        } else {
          console.log('Successfully connected to the database');
          db.collection('books').deleteMany({}, function(err, doc){
            if(err){
              console.log(err);
            } else {
              res.json('complete delete successful');
            }
          })
        }
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    
      if(!ObjectId.isValid(bookid)){
        res.json('no book exists');
        return;
      }
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if(err){
          console.log(err);
        } else {
          console.log('Successfully connected to the database');
          db.collection('books').findOne({_id: ObjectId(bookid)}, function(err,doc){
            if(err){
              console.log(err);
            } else {
              res.json((doc) ? doc : 'no book exists');
            }
          })
        }
      });
    
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
    
      if(!comment){
        res.json('no comment provided');
        return;
      }
      if(!ObjectId.isValid(bookid)){
        res.json('no book exists');
        return;
      }
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if(err){
          console.log(err);
        } else {
          console.log('Successfully connected to the database');
          db.collection('books').findOneAndUpdate({_id: ObjectId(bookid)}, {$push: {comments: comment}}, {returnOriginal : false}, function(err,doc){
            if(err){
              console.log(err);
            } else {
              res.json((doc.value) ? doc.value : 'no book exists');
            }
          })
        }
      });
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    });
  
};
