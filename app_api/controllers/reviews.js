var mongoose = require('mongoose');

var Loc = mongoose.model('Location');

var sendJsonResponse = function(res, status, content){
    res.status(status);
    res.json(content);
};

module.exports.reviewsCreate = function(req, res){
    var locationid = req.params.locationid;
    
    if(locationid){
      Loc
          .findById(locationid)
          .select('reviews')
          .exec(
            function(err, location){
              if(err){
                  sendJsonResponse(res, 400, err );
                }
                  else{
                    addReview(req, res, location);
                  }
            }//end of function
          )//end of exec
    }//end of if  locationid
    else{
      sendJsonResponse(res, 400, {"message":"Not found location id"});
    }
};//end of reviewsCreate


var addReview = function(req, res, location){
  
  if(!location){
    sendJsonResponse(res, 400, {"message":"location not found"});
  }
  else{
      location.reviews.push({
      author: String(req.body.author),
      rating : Number(req.body.rating),
      reviewText : String(req.body.reviewText)
    });

    location.save(function(err, location){
      var thisReview;
      if(err){
        console.log(err);
        sendJsonResponse(res,400, err);
      } 
      else{
        updateAverageRating(location._id);
        thisReview = location.reviews[location.reviews.length-1];
        sendJsonResponse(res, 200, thisReview);
      }
    });//end of callback function
  }//end of else
};//end of addReview


var updateAverageRating = function(locationid){
  console.log("Update rating average for", locationid);
  Loc
      .findById(locationid)
      .select('reviews')
      .exec(
        function(err, location){
          if(!err){
            doSetAverageRating(location);
          }
      })//end of exec
}//end of updateAverageRating


var doSetAverageRating = function(location){
  var i;
  var reviewCount;
  var ratingAverage;
  var ratingTotal;

  //console.log(location.reviews);
  
  if(location.reviews && location.reviews.length>0){
    
    reviewCount = location.reviews.length;
    ratingTotal = 0;

    for(i = 0; i < reviewCount; i++){
        ratingTotal = ratingTotal + location.reviews[i].rating;
    }

    ratingAverage = parseInt(ratingTotal/reviewCount, 10);
    location.rating = ratingAverage;
    location.save(function(err){
    if(err){
        console.log(err);
    } 
    else{
        console.log("Average rating is", ratingAverage);
    }
    });
  }
};// end of doSetAverage

/*module.exports.reviewsReadOne = function(req, res){
  if(req.params && req.params.locationid && req.params.reviewid){
    Loc
        .findById(req.params.locationid)
        .select('name reviews')
        .exec(
          function(err, location){
            var response, review;
            if(!location){
              sendJsonResponse(res, 404, {"Message":"locationid not found"});
              return;
            }
            else if(err){
              sendJsonResponse(res, 404, err);
              return;
            }
            if(location.reviews && location.reviews.length > 0){
              review = location.reviews.id(req.params.reviewid);
                            //if(!review){
                              //sendJsonResponse(res, 404, {"Message":"reviewid not found"});
                            //}
                            //else{
                              response = {
                                location:{
                                    name: location.name,
                                  id: req.params.locationid
                                },
                                review: review
                              };
                              sendJsonResponse(res, 200, response);
                            //}
              }
            else{
              sendJsonResponse(res, 404, {"Message":"No reviews found"});
            }
        });
  }
  else{
    sendJsonResponse(res, 404, {"Message":"Not foud, locationid and reviewid are both required"});
  }
   
};*/

module.exports.reviewsReadOne = function(req, res) {
  console.log("Getting single review");
  if (req.params && req.params.locationid && req.params.reviewid) {
    Loc
      .findById(req.params.locationid)
      .select('name reviews')
      .exec(
        function(err, location) {
          console.log(location);
          var response, review;
          if (!location) {
            sendJsonResponse(res, 404, {
              "message": "locationid not found"
            });
            return;
          } else if (err) {
            sendJsonResponse(res, 400, err);
            return;
          }
          if (location.reviews && location.reviews.length > 0) {
            review = location.reviews.id(req.params.reviewid);
            if (!review) {
              sendJsonResponse(res, 404, {
                "message": "reviewid not found"
              });
            } else {
              response = {
                location: {
                  name: location.name,
                  id: req.params.locationid
                },
                review: review
              };
              sendJsonResponse(res, 200, response);
            }
          } else {
            sendJsonResponse(res, 404, {
              "message": "No reviews found"
            });
          }
        }
    );
  } else {
    sendJsonResponse(res, 404, {
      "message": "Not found, locationid and reviewid are both required"
    });
  }
};

module.exports.reviewsUpdateOne = function(req, res){
  if(!req.params.locationid || !req.params.reviewid){
    sendJsonResponse(req, 404, {"message":"Not found, need both locationid"});
    return;
  }
  Loc
      .findById(req.params.locationid)
      .select('reviews')
      .exec(function(err, location){
        var thisReview;
        if(!location){
          sendJsonResponse(res, 404, {"message":"location not found"});
          return;
        }else if(err){
          sendJsonResponse(res, 400, err);
          return;
        }
        if(location.reviews.length>0 && location.reviews){
          thisReview = location.reviews.id(req.params.reviewid);
          if(!thisReview){
            sendJsonResponse(res, 404, {"message":"thisReview not found"});
          }
          else{
            thisReview.author = String(req.body.author);
            thisReview.rating = Number(req.body.rating);
            thisReview.reviewText = String(req.body.reviewText);
            location.save(function(err, location){
              if(err){
                sendJsonResponse(res, 400, err)
              } else{
                sendJsonResponse(res, 200, thisReview);
              }

            }); // end of location save 

          }
        }
        else{
          sendJsonResponse(res, 404, {"message":"no review to be updated"});
        }
      });//end of exec
};// end of reviewsUpdateOne 

module.exports.reviewsDeleteOne = function(req, res){
  if(!req.params.locationid || !req.params.reviewid){
    sendJsonResponse(res, 404, {"message":"location not found"});

    return;
  }
  Loc
      .findById(req.params.locationid)
      .select('reviews')
      .exec(function(err, location){
        if(!location){
          sendJsonResponse(res, 404, {"message":"location not found"});

        }else if(err){
          sendJsonResponse(res, 400, err);
          return;
        }

        if(location.reviews.length>0 && location.reviews){
          if(!location.reviews.id(req.params.reviewid)){
            sendJsonResponse(res, 404, {"message":"review id not found"});
          }else{
            location.reviews.id(req.params.reviewid).remove();
            location.save(function(err){
              if(err){
                sendJsonResponse(res, 400, err);
              }
              else{
                updateAverageRating(location._id);
                sendJsonResponse(res, 204, null);
              }
            });
          }
        }
        else{
          sendJsonResponse(res, 404, {"messsage":"no review to delete"});
        }
      });
};// end of reviewsDeleteOne


