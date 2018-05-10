var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "Bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log('Connected as id' + connection.threadId);
    introduction();
});



function introduction() {
    console.log("Welcome to Bamazon.");
    inquirer.prompt([{
        type: "confirm",
        name: "viewinventory",
        message: "Would you like to view our inventory?",
        default: true
    }]).then(function (user) {
       // console.log(user);
        if (user.viewinventory === true) {
            displayInventory();
            purchaseItem();
        }
        else {
            console.log("Thank you for visiting Bamazon.");
        }
    });
}
function tableSetup(res) {
    var table = new Table({
        head: ['Item ID', 'Product Name', 'Department', 'Price', 'Quantity']
        , colWidths: [10, 35, 30, 8, 8]
    });
    for (var i = 0; i < res.length; i++) {
        table.push([res[i].itemID, res[i].product_name, res[i].department_name, res[i].item_cost, res[i].stock_quantity]);
    }
    console.log(table.toString());
}

var displayInventory = function () {



    var query = "Select * FROM products";
    connection.query(query, function (err, res) {

        if (err) throw err;

        for (var i = 0; i < res.length; i++) {
            console.log("Product ID: " + res[i].item_id + " || Product Name: " +
                res[i].product_name + " || Price: " + res[i].price);
        };
    });
};




function purchaseItem() {
    inquirer.prompt([{
        type: "confirm",
        name: "chooseItem",
        message: "Do you want to purchase an item?",
        default: true
    }]).then(function (user) {
        if (user.chooseItem === true) {
            chooseItem();
        } else {
            console.log("Thank you for visiting!");
        }
    });
};


function chooseItem() {
    inquirer.prompt([{

        type: "input",
        name: "descripID",
        message: "What is the ID number of the item you wish to purchase?",
    },
    {
        type: "input",
        name: "numOfUnits",
        message: "How many units of this item would you like to purchase?",

    }
    ]).then(function (choices) {
        connection.query("SELECT * FROM products WHERE item_id=?", choices.descripID, function (err, res) {
            for (var i = 0; i < res.length; i++) {
                if (choices.numOfUnits > res[i].stock_quantity) {
                    console.log("We do not have the specified quantity to fullfil your request");
                    chooseItem();
                } else {
                    console.log("Let's review your order");
                    console.log("-----------------------");
                    console.log("You have chosen to purchase " + choices.numOfUnits + " of " + res[i].product_name);
                    console.log("Your total for this order: $" + parseFloat(choices.numOfUnits * res[i].price));
                    var updatedStock = res[i].stock_quantity - parseInt(choices.numOfUnits);
                    
                    // connection.query("UPDATE products SET stock_quantity = updatedStock WHERE item_id =?") 
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                          {
                           stock_quantity: updatedStock
                          },

                          {
                              item_id: choices.descripID // for some reason would not run without this
                          },
                          
                        ],

                    )};
            };

        })
    })
}

