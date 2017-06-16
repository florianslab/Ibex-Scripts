/*
GetItemFrom(
    data,
    {
        Controller: function(x){ return x["Column"]; }, // or "Column"
        Name: function(x){ return x["Column"] }, // or "Column"
        Where: function(x){
            return (x["Column"]=="valeur");
        },
        Options:{
            option1: function(x){ return "Column"; }, // or "Column"
            option2: function(x){ return "Column"; } // or "Column"
        }
    })


var a = GetItemFrom(
    data,
    {
        Controller: function(x){return "AudioCoveredBox";},
        Name: function(x){return "test";},
        ItemGroup: ["item","group"],
        Options:{
            covered: "CoveredPicture"
        }
    });
*/

function GetItemFrom(Data, Scheme) {
    if (Data.length < 2) throw "Data must be an array of length > 1"
    var colnames = Data[0];
    var Controller=Scheme.Controller, 
        Name=Scheme.Name,
        Where=Scheme.Where,
        ItemGroup = Scheme.ItemGroup,
        Options=Scheme.Options;
    // Checks
    if (Array.isArray(ItemGroup)) {
        if (typeof ItemGroup[0] != "string" || typeof ItemGroup[1] != "string")
            throw "ItemGroup must be an array of strings";
        if ((colnames.indexOf(ItemGroup[0], 0) < 0) ||
                (colnames.indexOf(ItemGroup[1], 0) < 0))
            throw "The members of ItemGroup must be columns of Data";
    }
    if (Controller===undefined) throw "Must define a controller name";
    if (Name===undefined) throw "Must define a name for the items";
    if (typeof Controller == "string")
        (function (a) { Controller = function(x) { return x[a]; }; }(Name));
    if (typeof Controller != "function") throw "Controller must be a string or a function";
    if (typeof Name=="string")
        (function (a) { Name = function(x) { return x[a]; }; }(Name));
    if (typeof Name != "function") throw "Name must be a string or a function";
    if (Where!=undefined&&typeof Where != "function") throw "Where must be a function";
    for (i in Options){
        if (typeof Options[i] == "string")
            (function (a) { Options[i] = function(x) { return x[a]; }; }(Options[i]));
        if (typeof Options[i] != "function") throw "Option '"+i+"'' must be a string or a function";
    }
    // Building the items
    var items = [];
    var groups = {};
    // Going through Data
    for (i in Data){
        if (i == 0) continue; // ignore the first line (colnames)
        var row = {};
        for (n in Data[i]) { row[colnames[n]] = Data[i][n]; }
        if (Where!=undefined&&!Where(row)) continue;
        var params = {};
        for (n in Options) { params[n] = Options[n](row); }
        // Handling Group
        //  
        //  groups = {
        //      item1: {
        //          group1: {
        //              Name: "name",
        //              Controller: "controller",
        //              Options: params
        //          },  
        //          group2:  {
        //              Name: "name",
        //              Controller: "controller",
        //              Options: params
        //          }
        //      },
        //      item2: {
        //          group1:  {
        //              Name: "name",
        //              Controller: "controller",
        //              Options: params
        //          },
        //          group2:  {
        //              Name: "name",
        //              Controller: "controller",
        //              Options: params
        //          }
        //      }
        //  }
        if (Array.isArray(ItemGroup)) {
            if (!groups.hasOwnProperty(row[ItemGroup[0]])) groups[row[ItemGroup[0]]] = {};
            groups[row[ItemGroup[0]]][row[ItemGroup[1]]] = {
                Name: Name(row),
                Controller: Controller(row),
                Options: params
            };
        }
        else items.push([Name(row),Controller(row),params]);
    }
    if (Array.isArray(ItemGroup)) {
        var groupList = Object.keys(groups[Object.keys(groups)[0]]);
        for (item in groups) {
            for (group in groupList) {
                if (!groups[item].hasOwnProperty(groupList[group])) throw "All items must have the same groups";
                var row = groups[item][groupList[group]];
                items.push([[row.Name, item], row.Controller, row.Options]);
            }
            groupList.unshift(groupList.pop());
        }

    }
    return items;
}