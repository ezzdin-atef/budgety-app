var budgetController = (function () {

    var Expence = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expence.prototype.calcPercentage = function (totalIcome) {
        if (totalIcome > 0) {
            this.percentage = Math.round((this.value / totalIcome) * 100);
        } else {
            this.percentage = -1;
        }
    }
    Expence.prototype.getPercentage = function() {
        return this.percentage;
    }
    

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }



    var data = {
        allItem: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budegt: 0,
        percentage: -1
    }
    var claculateTotal = function (type) {
        var sum = 0;
        data.allItem[type].forEach(element=> sum += element.value);
        data.totals[type] = sum;
    }
    return {
        addItmem: function (type, des, val) {
            var newItem, ID;

            
            if (data.allItem[type].length > 0) {
                ID = data.allItem[type][data.allItem[type].length -1].id + 1;
            } else {
                ID = 0;
            }
            if (type === 'exp') {
                newItem = new Expence(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            data.allItem[type].push(newItem);
            return newItem;
        },
        deleteItem: function (type, id) {
            var ids, index;
            ids = data.allItem[type].map(function(cur) {
                return cur.id;
            });
            index = ids.indexOf(parseInt(id));
            if (index !== -1) {
                data.allItem[type].splice(index, 1);
            }
        },
        calculateTheBudget: function (){
            claculateTotal('exp');
            claculateTotal('inc');
            data.budegt = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },
        calcPercentages: function () {
            data.allItem.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function () {
            var allPer = data.allItem.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPer;
        },
        getBudgetData: function () {
            return {
                dataBudget: data.budegt,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp
            }
        },
        testing: function () {
            console.log(data);
        }
    }

})();

var UIController = (function () {

    var formatNumber = function (num) {
        num = num.toFixed(2);
        var split = num.split('.');
        split[0] = parseInt(split[0]).toLocaleString();
        return split[0] + '.' + split[1];
    }
    var nodeListForEach = function (list, callback) {
        for (var i=0;i<list.length;i++) {
            callback(list[i], i);
        }
    }
    return {
        getInput: function () {
            return {
                type: document.querySelector('.add__type').value,
                description: document.querySelector('.add__description').value,
                value: parseFloat(document.querySelector('.add__value').value)
            }
        },
        addListItem: function (obj, type) {
            var html, newhtml, element;
            if (type === 'inc') {
                element = '.income__list';
                html = `<div class="item clearfix" id="inc-${obj.id}"><div class="item__description">${obj.description}</div><div class="right clearfix"><div class="item__value">+ ${formatNumber(obj.value)}</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            } else if (type === 'exp') {
                element = '.expenses__list';
                html = `<div class="item clearfix" id="exp-${obj.id}"><div class="item__description">${obj.description}</div><div class="right clearfix"><div class="item__value">- ${formatNumber(obj.value)}</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            }
            /*  issue hasn't solved :(
            newhtml = html.replace('%id%', obj.id);
            newhtml = html.replace('%d%', obj.description);     // there is problem in this replace
            newhtml = html.replace('%value%', obj.value);
            */
            document.querySelector(element).insertAdjacentHTML('beforeend', html);

        },
        removeListItem: function (selectedId) {
            var el = document.getElementById(selectedId);
            el.parentNode.removeChild(el);
        },
        clearInputFields: function (){
            var fields, fieldsArr;
            fields = document.querySelectorAll('.add__description, .add__value');
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(element => {
                element.value = "";
            });

            fieldsArr[0].focus();
        },
        displayPercentage: function (percentages) {

            var fields = document.querySelectorAll('.item__percentage');

            nodeListForEach(fields, function (currnet, index) {
                if (percentages[index] > 0) {
                    currnet.textContent = percentages[index] + "%";
                } else {
                    currnet.textContent = "---";
                }
            });

        },
        displayDate: function () {
            var now, year, month, months;
            now = new Date();
            year = now.getFullYear();
            months = ["January", "February", "March", "April", "May", "June", "June", "August", "September", "October", "November", "December"];
            month = months[now.getMonth()];
            document.querySelector('.budget__title--month').textContent = month + " " + year;
        },
        changeType: function () {
            var inputs = document.querySelectorAll('.add__type, .add__description, .add__value');
            console.log(inputs);
            nodeListForEach(inputs, function (cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector('.add__btn').classList.toggle('red');
        },
        displayBudget: function (obj) {
            if (obj.dataBudget >= 0) {
                document.querySelector('.budget__value').textContent = "+ " + formatNumber(obj.dataBudget);
            } else {
                document.querySelector('.budget__value').textContent = '- ' + Math.abs(formatNumber(obj.dataBudget));
            } 
            
            document.querySelector('.budget__income--value').textContent = "+ " + formatNumber(obj.totalInc);
            document.querySelector('.budget__expenses--value').textContent = "- " + formatNumber(obj.totalExp);
            
            if (obj.percentage > 0) {
                document.querySelector('.budget__expenses--percentage').textContent = obj.percentage + "%";
            } else {
                document.querySelector('.budget__expenses--percentage').textContent = "---";
            }
        }
    }

})();


var controller = (function (budgetCtrl, UICtrl) {
    var setupEventListener = function () {
        document.querySelector('.add__btn').addEventListener('click', addItemBtn);

        document.addEventListener('keypress', function (e) {
            if (e.keyCode === 13 || e.which === 13) addItemBtn();
        });
        document.querySelector('.container').addEventListener('click', deleteItemBtn);

        document.querySelector('.add__type').addEventListener('change', UICtrl.changeType);
    }

    var updatePercentage = function () {
        budgetCtrl.calcPercentages();
        var percentages = budgetCtrl.getPercentages();
        UICtrl.displayPercentage(percentages);
    }


    var updateBudget = function () {
        budgetCtrl.calculateTheBudget();
        var Budget = budgetCtrl.getBudgetData();
        UICtrl.displayBudget(Budget);
    }

    var addItemBtn = function () {
        var values = UICtrl.getInput();
        if (values.description !== "" && values.value > 0) {
            var newItem = budgetCtrl.addItmem(values.type, values.description, values.value);
            UICtrl.addListItem(newItem, values.type);
            UICtrl.clearInputFields();
    
            updateBudget();

            updatePercentage();
        } else {
            alert("Enter Valid Inputs, Please :)");
        }
        
    }

    var deleteItemBtn = function (event) {
        var idAttr, split, type, id;
        idAttr = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (idAttr) {
            split = idAttr.split('-');
            type = split[0];
            id = split[1];
            budgetCtrl.deleteItem(type, id);
            UICtrl.removeListItem(idAttr);
            updateBudget();
            updatePercentage();
        }
    }

    return {
        init: function () {
            console.log("The Application has started ^_^");
            UICtrl.displayDate();
            UICtrl.displayBudget({
                dataBudget: 0,
                percentage: 0,
                totalInc: 0,
                totalExp: 0
            });
            setupEventListener();
        }
    }

})(budgetController, UIController);

controller.init();