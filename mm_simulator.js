

// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
// **********  BALANCE CONTROLLER ********************************************
// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

var balanceController = (function () {

    var data = {
        main_level: {
            contracts: 0,
            trades: 0,
            commissions: 0
        },
        arrays: {
            targets: [],
            win_percentages: [],
            wins_count: [],
            losses_count: [],
            //gross profits and losses per PT
            profits: [],
            losses: []
        },
        stopLoss: 0,
        grossProfit: 0,
        grossLoss: 0,
        profitTotal: 0,
        lossTotal: 0,
        balanceTotal: 0
    };

    return {

        updateData: function(con, tr, comm, sl, trg, win_per) {
            data.main_level.contracts = con;
            data.main_level.trades = tr;
            data.main_level.commissions = comm;
            data.arrays.targets = trg;
            data.arrays.win_percentages = win_per;
            data.stopLoss = sl;
        },

        calcPL: function() {
            var profit = 0, loss = 0, win_trades = [], loss_trades = [], profit_commission, loss_commission, trade_rounded;
            //targets = [7, 15,20]
            data.arrays.targets.forEach((el, i) => {

                //Cutting off the decimal part of the number of win trades
                trade_rounded = data.main_level.trades * data.arrays.win_percentages[i];
                trade_rounded.toFixed(0);

                win_trades.push(parseInt(trade_rounded));
                loss_trades.push(data.main_level.trades - win_trades[i]);

                //calculating profit and loss per individual PT
                data.arrays.profits.push(win_trades[i] * el);
                data.arrays.losses.push(loss_trades[i] * data.stopLoss);

                //adding up total profits and losses
                profit = profit + (el * win_trades[i]);
                loss = loss + (data.stopLoss * loss_trades[i]);
            });
            //Gross profit and loss - without commissions
            data.grossProfit = profit;
            data.grossLoss = loss;

            //Number of win and loss trades per Profit Target
            data.arrays.wins_count = win_trades;
            data.arrays.losses_count = loss_trades;

            //Calculatig Commissions
            profit_commission = (data.main_level.trades * (data.main_level.commissions / 2)) * data.main_level.contracts;
            loss_commission = (data.main_level.trades * (data.main_level.commissions / 2)) * data.main_level.contracts;

            //Net total profit and loss
            data.profitTotal = profit - profit_commission;
            data.lossTotal = loss + loss_commission;
            data.balanceTotal = profit - loss;
        },

        clearData: function() {
            data.main_level.contracts = 0;
            data.main_level.trades = 0;
            data.main_level.commissions = 0;

            data.arrays.targets = [];
            data.arrays.win_percentages = [];
            data.arrays.wins_count = [];
            data.arrays.losses_count = [];
            data.arrays.profits = [];
            data.arrays.losses = [];

            data.stopLoss = 0;
            data.grossProfit = 0;
            data.grossLoss = 0;
            data.profitTotal = 0;
            data.lossTotal = 0;
            data.balanceTotal = 0;
        },

        getData: function() {
            return data;
        },

        data_log: function() {
            console.log(data);
        }
    };

})();

// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
// **********  UI CONTROLLER ********************************************
// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

var uiController = (function () {

    var dom_strings = {
        bottomPT: ".bottom__pt",
        bottomWinP: ".bottom__win_percentage",
        buttonDelPT: ".item__delete--btn",
        addPTbutton: ".add__btn",
        addPTContainer: ".add_pt_container",
        addWinPTContainer: ".add_win_pt_container",
        //main values
        contracts: ".contract",
        trades: ".trade",
        commissions: ".commission",
        mainInputGroup: ".add__contracts",
        //************************
        runCalcButton: ".btn-run-calc",
        resetButton: ".reset",
        ptItem: ".add__pt",
        winPerItem: ".add__win_percentage",
        stopLoss: ".stop-loss",
        row_stats: ".row",
        //main balance
        profitTotal: ".balance__income--value",
        lossTotal: ".balance__expenses--value",
        balanceTotal: ".balance__value",
        //statistics
        stats: ".statistics"
    };

    return {

        getMainInput: function() {
            return {
                contracts: parseInt(document.querySelector(dom_strings.contracts).value),
                trades: parseInt(document.querySelector(dom_strings.trades).value),
                comm: parseFloat(document.querySelector(dom_strings.commissions).value),
            };
        },

        getMainInputArray: function() {
            var main_values = [], main_fields;
            main_fields = document.querySelectorAll(dom_strings.mainInputGroup);

            Array.from(main_fields).forEach(el => main_values.push(parseFloat(el.value)));

            return main_values;

        },

        getPTinput: function() {
            var pt_values = [], fieldsPT;
            fieldsPT = document.querySelectorAll(dom_strings.ptItem);

            Array.from(fieldsPT).forEach(el => pt_values.push(parseFloat(el.value)));

            return pt_values;
        },

        getWinInput: function() {
            var win_values = [], fieldWin;
            fieldWin = document.querySelectorAll(dom_strings.winPerItem);

            Array.from(fieldWin).forEach(el => win_values.push(parseFloat(el.value/100)));

            return win_values;
        },

        getStopLoss: function() {
            var stLoss = document.querySelector(dom_strings.stopLoss).value;
            return parseFloat(stLoss);
        },

        addPTitem: function(numPT) {
            var html, newHtml, htmlPT, element, letter, buttonString;
            buttonString = '<button class="add__btn"><i class="ion-ios-checkmark-outline"></i></button>';
            element = dom_strings.bottomPT;

            htmlPT = '<input id="pt_%" type="number" class="add__pt" placeholder="PT%">'

            for (var i = 1; i <= numPT; i++) {
                newHtml = newHtml + htmlPT.replace(/%/g, i); //global match flag /some_string/g
            };

            html = '<div class="add add_pt_container"><div class="add__container"><h2>Enter the value in desired Currency:</h2>' + newHtml.slice(9) + '<input type="number" class="add__value stop-loss" placeholder="Stop Loss/Contract"></div></div>';

            document.querySelector(element).insertAdjacentHTML("beforeend", html);
        },

        deletePTitem: function() {
            var el;
            el = document.querySelector(dom_strings.addPTContainer);
            el.parentNode.removeChild(el);
        },

        addWinItem: function(numPT) {
            var html, newHtml, htmlWin, element, buttonString;
            element = dom_strings.bottomWinP;
            buttonString = '<button class="add__btn"><i class="ion-ios-checkmark-outline"></i></button>';
            htmlWin = '<input id="win_#" type="number" class="add__win_percentage" placeholder="Win%PT#">'

            for (var i = 1; i <= numPT; i++) {
                newHtml = newHtml + htmlWin.replace(/#/g, i);
            };

            html = '<div class="add add_win_pt_container"><div class="add__container"><h2>Enter the Win% for individual Profit Targets:</h2>' + newHtml.slice(9) + '</div></div>';


            document.querySelector(element).insertAdjacentHTML("beforeend", html);
        },

        deleteWinItem: function() {
            var el;
            el = document.querySelector(dom_strings.addWinPTContainer);
            el.parentNode.removeChild(el);
        },

        deleteStats: function() {
            var field_row;
            field_row = document.querySelectorAll(dom_strings.row_stats);

            Array.from(field_row).forEach(el => el.parentNode.removeChild(el));
        },

        clearInputs: function() {
            var fields;

            fields = document.querySelectorAll(dom_strings.contracts + ", " + dom_strings.trades + ", " + dom_strings.commissions);

            Array.from(fields).forEach(current => current.value = "");

            //going back to the Contracts field in the UI
            fields[0].focus();
        },

        displayMainBalance: function(pr, ls) {
            var sign;

            document.querySelector(dom_strings.profitTotal).textContent = pr.toFixed(2);
            document.querySelector(dom_strings.lossTotal).textContent = ls.toFixed(2);

            pr - ls < 0 ? sign = "" : sign = "+";

            document.querySelector(dom_strings.balanceTotal).textContent = sign + " " + (pr - ls).toFixed(2);
        },


        displayStats: function(numPT, targets, win_percs ,profits, losses, comm, trades, sl, wins) {
            var element, html, newHTML, htmlMainInfoTop, htmlMainInfoData, htmlTop, htmlStats;

            element = document.querySelector(dom_strings.stats);

            htmlMainInfo = '<div class="row"><div class="col-sm"></div><div class="col-sm">Trades</div><div class="col-sm">StopLoss</div><div class="col-sm">Commission per Contract</div><div class="col-sm"></div></div>';

            htmlMainInfoData = '<div class="row"><div class="col-sm"></div><div class="col-sm">&Trades&</div><div class="col-sm">&StopLoss&</div><div class="col-sm">&Commission per Contract&</div><div class="col-sm"></div></div>';
            htmlMainInfoData = htmlMainInfoData.replace("&Trades&", trades);
            htmlMainInfoData = htmlMainInfoData.replace("&StopLoss&", sl.toFixed(2));
            htmlMainInfoData = htmlMainInfoData.replace("&Commission per Contract&", comm);



            htmlTop = '<div class="row row-top-desc"><div class="col-sm"></div><div class="col-sm">Value</div><div class="col-sm">Win%</div><div class="col-sm">WinTrades</div><div class="col-sm">Gross Profit</div><div class="col-sm">Gross Loss</div><div class="col-sm">Commission</div></div>';
            htmlStats = '<div class="row"><div class="col-sm">PT&</div><div class="col-sm">&pt_value&</div><div class="col-sm">&Win%&</div><div class="col-sm">&WinTrades&</div><div class="col-sm">&Profit&</div><div class="col-sm">&Loss&</div><div class="col-sm">&Commission&</div></div>';



            for (var i = 0; i < numPT; i++) {
                html = htmlStats.replace("&", i + 1);
                html = html.replace("&pt_value&", targets[i].toFixed(2));
                html = html.replace("&Win%&", (win_percs[i] * 100).toFixed(2) + "%");
                html = html.replace("&WinTrades&", wins[i].toFixed(2));
                html = html.replace("&Profit&", profits[i].toFixed(2));
                html = html.replace("&Loss&", losses[i].toFixed(2));
                html = html.replace("&Commission&", (comm * trades).toFixed(2));
                newHTML = newHTML + html;
            };

            newHTML = htmlMainInfo + htmlMainInfoData + "<hr>" + htmlTop + newHTML;

            newHTML = newHTML.replace("undefined", "");

            document.querySelector(dom_strings.stats).insertAdjacentHTML('beforeend', newHTML);

        },

        checkPTContainer: function() {
            var pt_container = document.querySelector(dom_strings.bottomPT).childElementCount;
            return pt_container;
        },

        checkWinContainer: function() {
            var win_container = document.querySelector(dom_strings.bottomWinP).childElementCount;
            return win_container;
        },

        checkStatsContainer: function() {
            var st = document.querySelector(dom_strings.stats).childElementCount;
            return st;
        },

        get_dom_strings: function() {
            return dom_strings;
        }
    };

})();


// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
// **********  GLOBAL APP CONTROLLER ********************************************
// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
var controller = (function (balCtrl, uiCtrl){

    var domStrings = uiCtrl.get_dom_strings();

    function setupListeners() {
        document.querySelector(domStrings.addPTbutton).addEventListener('click', ctrlAddPTitem);
        document.querySelector(domStrings.buttonDelPT).addEventListener('click', ctrlDeletePTitem);
        document.querySelector(domStrings.addPTbutton).addEventListener('click', ctrlAddWinPTitem);
        document.querySelector(domStrings.buttonDelPT).addEventListener('click', ctrlDelWinPTitem);
        document.querySelector(domStrings.runCalcButton).addEventListener('click', runSimulator);
        document.querySelector(domStrings.resetButton).addEventListener('click', resetCalc);
    };


    //************** CTRL Adding and Deleting Items
    //********************************************************

    // add PT line after user enters contracts, trades etc and clicks on the button
    function ctrlAddPTitem() {
        var user_input, pt;

        //Get Input Values as Array
        user_array_input = uiCtrl.getMainInputArray();

        //Check if all fields are filled
        var num_pt = checkItemContent(user_array_input); //returns "no" if items are numbers or > 0

        //Check if PT container already present
        pt = uiCtrl.checkPTContainer();

        //Add PT block based on Contracts inserted
        if (pt < 1 && num_pt === "no") {
            //Get Input Values
            var user_input = uiCtrl.getMainInput();

            uiCtrl.addPTitem(user_input.contracts);

            //update data structure in balanceController
            balCtrl.updateData(user_input.contracts, user_input.trades, user_input.comm, stop_loss=0, trg = [], win_per = []);

        }

    }

    function ctrlDeletePTitem() {
        var pt = uiCtrl.checkPTContainer();
        if (pt > 0) {
            uiCtrl.deletePTitem();
        };
    }

    function ctrlAddWinPTitem() {
        var user_input, win;

        //Get Input Values as Array
        user_array_input = uiCtrl.getMainInputArray();

        //Check if all fields are filled
        var num_win = checkItemContent(user_array_input); //returns "no" if items are numbers or > 0

        //Check if Win container already present
        win = uiCtrl.checkWinContainer();

        //Add PT block based on Contracts inserted and Win block present or not
        if (win < 1 && num_win === "no") {
            user_input = uiCtrl.getMainInput();

            uiCtrl.addWinItem(user_input.contracts);

            //Clear inputs so user cannot add another block
            uiCtrl.clearInputs();
        }
    }

    function ctrlDelWinPTitem() {
        var win = uiCtrl.checkWinContainer();
        if (win > 0) {
            uiCtrl.deleteWinItem();
        };
    }

    //************* RUN SIM *******************
    function runSimulator() {

        // Run calc only if PT and Win blocks are present and all fields are filled
        var pt, win, st, pt_input, win_input, sl, all_fields, num_nan, num;
        pt = uiCtrl.checkWinContainer();
        win = uiCtrl.checkWinContainer();
        st = uiCtrl.checkStatsContainer();

        pt_input = uiCtrl.getPTinput();
        win_input = uiCtrl.getWinInput();

        //call getStopLoss only if PT block is present otherwise it throws an error, this func returns a value unlike
        //functions getPTinput and getWinInput which return an array like object
        if (pt > 0) {
            sl = uiCtrl.getStopLoss();
        }


        all_fields = [];

        for (var i = 0; i < pt_input.length; i++) {
            all_fields.push(pt_input[i]);
            all_fields.push(win_input[i]);
        };
        all_fields.push(sl);

        //
        var num_item2 = checkItemContent(all_fields);

        //Runs only if PT and WIN blocks are present, data filled are either a number or greater than Zero and Stats block is not present yet
        if (pt > 0 && win > 0 && num_item2 === "no" && st < 1) {

            var user_input = balCtrl.getData(); //sourcing it from data that were updated by clicking addPT item button
            balCtrl.updateData(user_input.main_level.contracts, user_input.main_level.trades, user_input.main_level.commissions, sl, pt_input, win_input);
            balCtrl.calcPL(); //updates data structure with data other than updateData() is responsible for
            var balance_data = balCtrl.getData();
            uiCtrl.displayMainBalance(balance_data.profitTotal, balance_data.lossTotal);
            uiCtrl.deletePTitem();
            uiCtrl.deleteWinItem();
            uiCtrl.displayStats(balance_data.main_level.contracts, balance_data.arrays.targets, balance_data.arrays.win_percentages, balance_data.arrays.profits, balance_data.arrays.losses, balance_data.main_level.commissions, balance_data.main_level.trades, balance_data.stopLoss, balance_data.arrays.wins_count);
        }
    }

    function resetCalc() {
        var pt, win, st;
        pt = uiCtrl.checkWinContainer();
        win = uiCtrl.checkWinContainer();
        st = uiCtrl.checkStatsContainer();

        if (st > 0) {
            uiCtrl.clearInputs();
            uiCtrl.displayMainBalance(0, 0);
            uiCtrl.deleteStats();
            //window.location.reload();
            balCtrl.clearData();
        }
        else if (pt > 0 && win > 0) {
            uiCtrl.clearInputs();
            uiCtrl.displayMainBalance(0, 0);
            uiCtrl.deletePTitem();
            uiCtrl.deleteWinItem();
            balCtrl.clearData();
        }
    }

    function checkItemContent(arr) {
        var num_nan;

        for (const el of arr) {
            if (isNaN(el) || el === 0) {
                num_nan = "yes";
                break;
            }
            else {
                num_nan = 'no';
            }
        }
        return num_nan;
    }

    return {
        init: function() {
            console.log("The App has started!");
            setupListeners();
            uiCtrl.displayMainBalance(0, 0);
        },

        testing: function() {
            console.log(user_input);
        }
    }
})(balanceController, uiController);

controller.init();
