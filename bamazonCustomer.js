var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) {
        console.error("error connecting: " + err.stack);
    } else {
        console.log("connection successful!");
        AllProducts();
    }

});


function question() {
    inquirer
        .prompt({
            name: "ID",
            type: "input",
            message: "Please enter Item ID? [9999 to exit]"
        })
        .then(function(answer) {
          if (answer.ID === '9999') {
            console.log("Thank you for shopping with us.....")
            process.exit(0);
          }
          else {
            var query = "SELECT * FROM products WHERE ?";
            // connection.query(query, { item_id: answer.ID }, function(err, res) {
            connection.query(query, { item_id: answer.ID },function(err, res) {
              if (res.length == 0){
                console.log("Not Found, sorry")
                AllProducts()
              }
                for (var i = 0; i < res.length; i++) {
                    console.table(res);
                }
                askQty(answer.ID);
            });
          }
        });
}

function askQty(itemID) {
    inquirer
        .prompt({
            name: "qty",
            type: "input",
            message: "What is the quantity you want? [0 to exit]"
        })
        .then(function(answer) {
            if (answer.qty == 0){
              AllProducts();
            }
              else {
              var query = "SELECT * FROM products WHERE ?";
              connection.query(query, { item_id: itemID }, function(err, res) {
                  console.table(res);
                  // CHECK console.table(res); 
                  if (parseInt(answer.qty) > parseInt(res[0].stock_quantity)) {
                      console.log("\n We dont carry the quantity you requested, We can only provide " + res[0].stock_quantity + " - " + res[0].product_name + ".")
                    AllProducts();
                  } else if (answer.qty < res[0].stock_quantity) {
                    console.log("Your total order for "+ answer.qty + " " + res[0].product_name )
                    console.log("\n US$ " + answer.qty * res[0].price + " Plus Shipping and handling .")
                    console.log("\n Thank you for your order")
                    ConfirmOrder(itemID, answer.qty)
                  }
              });
            }
        });
};


function ConfirmOrder(itemID, qty) {
    var query = "UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?"
    connection.query(query, [qty, itemID], function(err, res) {
            // Let the user know the purchase was successful, re-run loadProducts
            console.log("\nOrder confirmed. Thank you")
            //console.log(res);
            AllProducts();
            
        }
    );
}
//     console.log(" wait for order confirmation")

// }

function AllProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        console.table(res);
        question();
    });
}