function TextParser (text, type){
    let domParser = new DOMParser();
    return domParser.parseFromString(text, type);
}

function LoadHTMLText (path, act)
{
    let xmlHttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    //let element = document.documentElement;

    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        {
            act (xmlHttp.responseText);
        }
    };

    start = new Date().getTime();

    xmlHttp.open("GET", path, true); // true for asynchronous
    xmlHttp.send(null);
}

function LoadHTML (path, act)
{
    LoadHTMLText(path, x => 
    {
        let doc = TextParser(x, "text/html");
        let element = doc.body.children[0];
        
        console.log(element);

        act(element);
    });
}

function LoadXML (path, act)
{
    let xmlHttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    //let element = document.documentElement;

    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        {
            act (xmlHttp.responseXML);
        }
    };

    start = new Date().getTime();

    xmlHttp.open("GET", path, true); // true for asynchronous
    xmlHttp.send(null);
}

function LoadJSON(path, callback) {
    var xObj = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.JSON");
    xObj.overrideMimeType("application/json");
    xObj.open('GET', path, true);
    // 1. replace './data.json' with the local path of your file
    xObj.onreadystatechange = function() {
        if (xObj.readyState === 4 && xObj.status === 200) {
            // 2. call your callback function
            callback(JSON.parse(xObj.responseText));
        }
    };
    xObj.send(null);
}
