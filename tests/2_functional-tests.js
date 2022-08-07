const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
var deleteID;

suite('Functional Tests', function() {
    test("Create an issue with every field: POST request to /api/issues/{project}", (done) => {
        chai
          .request(server)
          .post("/api/issues/project")
          .set("content-type", "application/json")
          .send({
            issue_title: "title",
            issue_text: "text",
            created_by: "me",
            assigned_to: "you",
            status_text: "it's an issue"
            })
          .end(function(err,res) {
            assert.equal(res.status, 200);
            deleteID = res.body._id;
            assert.equal(res.body.issue_title, "title");
            assert.equal(res.body.issue_text, "text");
            assert.equal(res.body.created_by, "me");
            assert.equal(res.body.assigned_to, "you");
            assert.equal(res.body.status_text, "it's an issue");
            done();
          });
      });
      test("Create an issue with only required fields: POST request to /api/issues/{project}", (done) => {
        chai
          .request(server)
          .post("/api/issues/project")
          .set("content-type", "application/json")
          .send({
            issue_title: "title",
            issue_text: "text",
            created_by: "me",
            assigned_to: "",
            status_text: ""
            })
          .end(function(err,res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, "title");
            assert.equal(res.body.issue_text, "text");
            assert.equal(res.body.created_by, "me");
            assert.equal(res.body.assigned_to, "");
            assert.equal(res.body.status_text, "");
            done();
          });
      });
      test("Create an issue with missing required fields: POST request to /api/issues/{project}", (done) => {
        chai
          .request(server)
          .post("/api/issues/project")
          .set("content-type", "application/json")
          .send({
            issue_title: "",
            issue_text: "",
            created_by: "me",
            assigned_to: "",
            status_text: ""
            })
          .end(function(err,res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "required field(s) missing");
            done();
          });
      });
      test("View issues on a project: GET request to /api/issues/{project}", (done) => {
        chai
          .request(server)
          .get("/api/issues/mom")
          .end(function(err,res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.length, res.body.length);
            done();
          });
      });
      test("View issues on a project with multiple filters: GET request to /api/issues/{project}", (done) => {
        chai
          .request(server)
          .get("/api/issues/mom")
          .query({_id: "62ef99398402ae57d5dcb483", assigned_to: "you"})
          .end(function(err,res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body[1],
                undefined
            );
            done();
          });
      });
      test("View issues on a project with one filter: GET request to /api/issues/{project}", (done) => {
        chai
          .request(server)
          .get("/api/issues/mom")
          .query({_id: "62ef99398402ae57d5dcb483"})
          .end(function(err,res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body[1], {
              _id: "62ef99398402ae57d5dcb483",
              assigned_to: "you",
              created_by: "me",
              created_on: "2022-08-07T10:46:03.221Z",
              issue_text: "text",
              issue_title: "title",
              open: true,
              status_text: "issue",
              updated_on: "2022-08-07T10:46:03.221Z"
            });
            done();
          });
          
          
      });
      test("Update one field on an issue: PUT request to /api/issues/{project}", (done)=>{
        chai
            .request(server)
            .put("/api/issues/mom")
            .send({
                _id: "62ef9a2c8402ae57d5dcb489",
                issue_text: "editted text"
            })
            .end(function(err,res){
                assert.equal(res.status, 200);
                assert.equal(res.body.result, "successfully updated");
                assert.equal(res.body._id, "62ef9a2c8402ae57d5dcb489");
                done();
            });
            

      });
      test("Update multiple fields on an issue: PUT request to /api/issues/{project}", (done)=>{
        chai
            .request(server)
            .put("/api/issues/mom")
            .send({
                _id: "62ef9a2c8402ae57d5dcb489",
                issue_title: "editted title",
                issue_text: "editted text"
            })
            .end(function(err,res){
                assert.equal(res.status, 200);
                assert.equal(res.body.result, "successfully updated");
                assert.equal(res.body._id, "62ef9a2c8402ae57d5dcb489");
                done();
            });

      });
      test("Update an issue with missing _id: PUT request to /api/issues/{project}", (done)=>{
        chai
            .request(server)
            .put("/api/issues/deeznuts")
            .send({
                issue_title: "editted title",
                issue_text: "editted text"
            })
            .end(function(err,res){
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "missing _id");
                done();
            });

      });
      test("Update an issue with no fields to update: PUT request to /api/issues/{project}", (done)=>{
        chai
            .request(server)
            .put("/api/issues/deeznuts")
            .send({
                _id: "62eefe8df45a16e410ae0b2e"
            })
            .end(function(err,res){
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "no update field(s) sent");
                done();
            });

      });
      test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", (done)=>{
        chai
            .request(server)
            .put("/api/issues/deeznuts")
            .send({
                _id: "62ffee8df45b16e410ea0b2e",
                issue_title: "cant update"
            })
            .end(function(err,res){
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "could not update");
                done();
            });

      });
      test("Delete an issue: DELETE request to /api/issues/{project}", (done)=>{
        chai
            .request(server)            
            .delete("/api/issues/project")
            .send({
              _id: deleteID
            })
            .end(function(err,res){
              assert.equal(res.status, 200);
              assert.equal(res.body.result, "successfully deleted");
              done();
            });
      });
      test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", (done)=>{
        chai
            .request(server)
            .delete("/api/issues/mom")
            .send({
              _id: "62fe951661991c45eb406111"
            })
            .end(function(err,res){
              assert.equal(res.status, 200);
              assert.equal(res.body.error, "could not delete");
              done();
            });
      });
      test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", (done)=>{
        chai
            .request(server)
            .delete("/api/issues/mom")
            .send({
              _id: null
            })
            .end(function(err,res){
              assert.equal(res.status, 200);
              assert.equal(res.body.error, "missing _id");
              done();
            });
      });

});
