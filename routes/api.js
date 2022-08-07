'use strict';

module.exports = function (app) {
  require('dotenv').config();
  let mongoose= require('mongoose');
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const issueSch = new mongoose.Schema({
    issue_title: {
      type: String,
      required: true
    },
    issue_text: {
      type: String,
      required: true
    },
    created_on: {
      type: Date,
      default: new Date()
    },
    updated_on: {
      type: Date,
      default: new Date()
    },
    created_by: {
      type: String,
      required: true
    },
    assigned_to: {
      type: String
    },
    open: {
      type: Boolean
    },
    status_text: {
      type: String
    }
  })

let Issue = mongoose.model("Issue", issueSch);
const projSch = new mongoose.Schema({
  name: String,
  issues: [issueSch]
});
let Project = mongoose.model("Project", projSch)
  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let {issue_title, issue_text, created_by, assigned_to, status_text, open}= req.query;
      Project.findOne({name: project}, (err,data)=>{
        if (err) return console.log(err);
        if(!data){
          const form = new Project({
            name: project,
            issues: []
          });
          form.save((err,doc)=>{
            if (err) return console.log(err);
            return res.json(doc.issues);
          })
        }
      if(data){
        let ish= data.issues;
        let check= {};
        if (issue_title) check.issue_title= issue_title ;
        if (issue_text) check.issue_text= issue_text;
        if (created_by) check.created_by= created_by;
        if (assigned_to) check.assigned_to= assigned_to;
        if (status_text) check.status_text= status_text;
        if (open) check.open = open;
        let filter = data.issues.filter(function(x){
          let checky = JSON.stringify(check).replace(/[{}]/g, "");
          let regrex= new RegExp(checky, 'gi');
          return regrex.test(JSON.stringify(x));
        });
        return res.json(filter)
      }
      })
      
    })
    
    .post(function (req, res){
      let project = req.params.project;
      if(!req.body.issue_title||!req.body.issue_text||!req.body.created_by){
        return res.json({ error: 'required field(s) missing' })
      }
      const form = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to||"",
        status_text: req.body.status_text||"",
        open: true
      });
      Project.findOne({name: project}, (err,data)=>{
        if (err)  return res.send({error: "posting error occured"})
        if(!data){
            const proj= new Project({
              name: project,
              issues: [form]
            });
            proj.save((err,doc)=>{
              if (err||!doc){
                return res.send({error: "posting error occured"})
              }
              res.json(form);
              return
            })  
        }
        if(data){
            data.issues.push(form);
            data.save((err,doc)=>{
              if (err||!doc) return console.log(err);
              res.json(form);
              return
            })
        }
        })
    })
    
    .put(function (req, res){
      let project = req.params.project;
      let {_id, issue_title, issue_text, created_by, assigned_to, status_text, open}= req.body;
      Project.findOne({name: project}, (err,data)=>{
        if (err) return res.json({ error: 'could not update', '_id': _id });
        if(!_id) return res.json({ error: 'missing _id' });
        if(!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open){ 
          return res.json({ error: 'no update field(s) sent', '_id': _id })}
        if(data){
          if(data.issues.every(function(x){; return x.id!==_id})){
            return res.json({ error: 'could not update', '_id': _id })}
          let ish= data.issues.filter(function(x){ return x.id==_id});
          let form= data.issues.filter(function(x){return x.id!==_id});
          if(issue_title) ish[0].issue_title= issue_title;
          if(issue_text) ish[0].issue_text= issue_text;
          if(created_by) ish[0].created_by= created_by;
          if(assigned_to) ish[0].assigned_to= assigned_to;
          if(status_text) ish[0].status_text= status_text;
          if(open!==undefined) ish[0].open= open;
          ish[0].updated_on= new Date();
          data.issues= [ish[0], ...form];
          data.save((err,doc)=>{
            if (err) return res.json({ error: 'could not update', '_id': _id });
            res.json({  result: 'successfully updated', '_id': _id })
            
          })
          
        }

      })
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      let _id = req.body._id;
      Project.findOne({name: project}, (err,data)=>{
        if (err||!data){ 
          return res.json({ error: 'could not delete', '_id': id });}
        if(!_id){ 
          return res.json({ error: 'missing _id' });}
        if(data){
          if(data.issues.filter(function(x){return x.id==_id}).length===0){
            return res.json({ error: 'could not delete', '_id': _id })
          }
         let ish = data.issues.filter(function(x){ 
            return x.id==_id});
           
         data.issues= ish;
         data.save((err,doc)=>{
          if (err) return res.json({ error: 'could not delete', '_id': _id });
           return res.json({ result: 'successfully deleted', '_id': _id });}
         )
        }
      })
    });
    
};
