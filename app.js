
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date=require(__dirname+"/date.js");


const itoms=[];
const workList=[];

const app = express();

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://ashutosh:8381882097@cluster0-2gxxt.mongodb.net/test?retryWrites=true&w=majority", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const listSchema = {
  name: String,
  item: [itemsSchema]
};

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List",listSchema);

const item1 = new Item ({
  name: "Buy food"
});

const item2 = new Item ({
  name: "Go gym"
});

const item3 = new Item ({
  name: "Go market"
});

const defaultItems = [item1, item2 , item3];


app.get("/",function(req,res){
  const day=date.getDate();

  Item.find({}, function(err, foundItems){

    if(foundItems.length===0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfull inserted");
        }
      });
      res.redirect("/");
    }else{
    res.render("list",{pageTitle: day,itoms:foundItems});
  }
  });


});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);


  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list1 = new List({
          name:customListName,
          item:defaultItems
        });
         list1.save();
        res.redirect("/"+ customListName)
      }else{
        res.render("list",{pageTitle:foundList.name,itoms:foundList.item});
      }
    }
  });




});


app.post("/",function(req,res){

  const itemNew= req.body.itom;
  const listTitel = req.body.list;

    const item = new Item({
      name: itemNew
        });

        List.findOne({name: listTitel}, function(err, foundList){
          if(!err){
            if(!foundList){
              item.save();
              res.redirect("/");
            }else{
              foundList.item.push(item);
              foundList.save();
              res.redirect("/" + listTitel);
            }
          }
        });


});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName==date.getDate()){
  Item.findByIdAndRemove(checkedItemId,function(err){
   if(err){
    console.log(err);
  }else{
    console.log("Successfull deleted");
  }
});

res.redirect("/");
}else{
  List.findOneAndUpdate({name: listName}, {$pull: {item: {_id: checkedItemId}}},function(err,foundlist){
    if(!err){
      res.redirect("/"+ listName);
    }
  });
}
});

let port = process.env.PORT;
if(port== null || port==""){
  port = 3000;
}

app.listen(port,function(){
  console.log("Server started ");
});
