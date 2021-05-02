/********************** budgetController ******************/

var budgetController = (function(){
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;

    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }

    };
    Expense.prototype.getPersantage = function(){
        return this.percentage;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;

        });
        data.totals[type] = sum;

    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            //[1 2 3 4 5], next ID = 6
            //[1 2 4 6 8], next ID = 9
            // ID = last ID + 1
            
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Push it into our data structure
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem;
        },
        calculateBudget: function(){
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses

            data.budget = data.totals.inc - data.totals.exp ;

            // calculate the percentage of income that we spent
            if(data.totals.inc > 0){            
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;

            }

        },

        calculatePercentages: function(){
            
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);


            });

        },
        getPersantages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPersantage();

            });
            return allPerc;

        },
        DeleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if (index !== -1){
                data.allItems[type].splice(index,1);
            } 

        },

        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        testing: function(){
            console.log(data);
        }
    };


})();


/**********************  UIController ********************/

var UIController =(function(){
    var DOMstrings = {
        inputType: '.add__type',
        description: '.add__description',
        value: '.add__value',
        add: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expensesLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        expensesPercentageLabel:'.item__percentage',
        dateLabel:'.budget__title--month'

    };

    var nodeListForEach = function(list, callback){
        for (var i = 0; i < list.length; i++){
            callback(list[i], i);
        }

    };


    return{
        getInput: function(){
            return{
            type: document.querySelector(DOMstrings.inputType).value, // type will be 'inc' or 'exp'
            description: document.querySelector(DOMstrings.description).value, // desctiption
            value: parseFloat(document.querySelector(DOMstrings.value).value) // the vlaue
            };

        },

        addListItem: function(obj, type){
            var html, newHtml, element;

            // Create HTML with place holder text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // Replace the placeholder text
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',this.formatNumber(obj.value, type));

            
            // Insert HTML into the placeholder
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);


        },
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.description + ',' + DOMstrings.value);
            fieldsArr = Array.prototype.slice.call(fields); // to converte a list to an array
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
                
            });
            fieldsArr[0].focus(); // To put the curosor back to the first field


        },
        displayBadget: function(obj){
            obj.budget > 0 ? type = 'inc': type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = this.formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = this.formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = this.formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '--';

            }
           
        },


        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';

                }else{
                    current.textContent ='---';
                }

            });


        },
        formatNumber: function(num, type){
            var numSplit, int, dec;

            // + or - before the number
            // exactly 2 decimal points 
            // comma separating the thousands

            num = Math.abs(num);
            num = num.toFixed(2);
            numSplit = num.split('.');
            int = numSplit[0];
            if(int.length > 3){
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);// input 2344, out 2,344

            }
            dec = numSplit[1];
            
            return (type === 'exp' ? '-': '+')  + ' ' + int + '.' + dec;

        },
        
        displayMonth: function(){
            var now , year, month;//, months;
           // months = ['JAN', 'FEB', 'Mar', 'Abril]
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth()+1;
            document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' + year;

        },
        changedType:function(){
            var fields = document.querySelectorAll(
              DOMstrings.inputType + ',' +
              DOMstrings.description + ',' +
              DOMstrings.value);
              nodeListForEach(fields, function(cur){
                  cur.classList.toggle('red-focus');
              });
              document.querySelector(DOMstrings.add).classList.toggle('red');
        },
        getDOMstrings: function(){
            return DOMstrings;
        }

    };

    
})();

/**********************  The app controller *************************/

var controller =(function(budgetCtrl, UIctr){

    var setupEventListeners = function(){
        var DOM = UIctr.getDOMstrings();
        document.querySelector(DOM.add).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress',function(event){
        if (event.keyCode === 13 || event.which === 13){
            ctrlAddItem();
        }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener('change', UIctr.changedType);




    };

    var updateBudget = function(){
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UIctr.displayBadget(budget);
        
    };

    var updatePercentages = function(){
        // 1. calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPersantages();

        // 3.UPdate the UI with the new percentages
        UIctr.displayPercentages(percentages);


    };

    var ctrlAddItem = function(){
        var input, newItem;
        // 1. Cet the filed input data
        
        input = UIctr.getInput();
        //console.log(input);
        if(input.description !=="" && !isNaN(input.value)  && input.value > 0){      

        // 2. Add the itme to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        // 3. add item to the UI
        UIctr.addListItem(newItem, input.type);
        // 4. clear the fields 
        UIctr.clearFields();

        // 5. Calculate the budget and update Badget

        updateBudget();
        // 6. Calculate and update percentages
        updatePercentages();

        }
    };

    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            // 1. Delete the item from the data structure
            budgetCtrl.DeleteItem(type, ID);

            // 2. Delete the item the the UI
            UIctr.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();
        }

    };

    return{
        init: function(){
            console.log('Appliction has been started !');
            UIctr.displayMonth();
            UIctr.displayBadget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            
            
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();



