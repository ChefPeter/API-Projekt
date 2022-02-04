function display_c7(){
    var refresh=1000; // Refresh rate in milli seconds
    mytime=setTimeout('display_ct7()',refresh);
}

/* function aufrufFahrplan(){
    mytime = setTimeout('einlesenFahrplan()', 10000);
} */

function aufrufWetter(){
    mytime = setTimeout('einlesenWetter()', 300000);
}

function einlesenFahrplan(){
    //console.log("Test");
    fetch("https://efa.sta.bz.it/apb/XML_DM_REQUEST?&locationServerActive=1&stateless=1&type_dm=any&name_dm=Brixen%20Brixen%20Dantestra%C3%9Fe&mode=direct&outputFormat=json")
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                aufrufFahrplan();
                //throw new Error('Something went wrong');
            }
        })
        .then(json => fahrplan(json));
}

function einlesenWetter(){
    fetch("https://api.openweathermap.org/data/2.5/weather?lat=46.717996&lon=11.651795&appid=0556bd130943fa16cb0b4a5c3b3f9931&mode=json&units=metric&lang=de")
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                aufrufWetter();
            }
        })
        .then(json => wetter(json));
}

function wetter(data){

    let bild = "./Wetter/" + data.weather[0].icon + ".png";
    let hintergrund = "url(./Wetter/" + "h" + data.weather[0].icon + ".png)";

    console.log(hintergrund);

    document.getElementById("allgemein").src = bild;
    document.getElementsByClassName("wetter")[0].style.backgroundImage = hintergrund;
    
    document.getElementById("temp").innerHTML = "&nbsp;" + data.main.temp + "°C";
    document.getElementById("nieder").innerHTML = "&nbsp;" + data.main.humidity + "% Luftfeuchtigkeit";
    document.getElementById("wind").innerHTML = "&nbsp;" + data.wind.speed + "m/s";

    aufrufWetter();
}

function fahrplan(data){

    let linieId = "";
    let zielId = "";
    let abfahrtId = "";
    let countdown = "";
    let minu = 0;
    let stunde = 0;
    let x = new Date();

    for(let i=0; i<14; i++){
        //console.log(data.departureList[i].servingLine.direction);
        linieId = "linie" + i;
        zielId = "ziel" + i;
        abfahrtId = "abfahrt" + i;
        countdown = "countdown" + i;
        stunde = data.departureList[i].dateTime.hour;
        minu = data.departureList[i].dateTime.minute;
        

        document.getElementById(linieId).innerHTML = data.departureList[i].servingLine.number;
        document.getElementById(zielId).innerHTML = data.departureList[i].servingLine.direction;
        
        if (minu<10) document.getElementById(abfahrtId).innerHTML = stunde + ":0" + minu;
        else document.getElementById(abfahrtId).innerHTML = stunde + ":" + minu;

        if (x.getHours() > stunde) stunde = parseInt(stunde) + 24;
        //console.log(stunde);
        stunde = stunde - x.getHours();
        minu = minu - x.getMinutes() + stunde * 60;
        
        stunde = Math.floor(minu/60);
        minu = minu - (stunde * 60);

        if (stunde == 0) document.getElementById(countdown).innerHTML = "in " + minu + " min";
        else document.getElementById(countdown).innerHTML = "in " + stunde + " h und " + minu + " min";
    }
    //aufrufFahrplan();
    //einlesenXml(document);
}

function display_ct7(){ //Findet die derzeitige Uhrzeit und das Aktuelle Datum
    var x = new Date()
    var ampm = x.getHours( ) >= 12 ? '' : '';
    hours = x.getHours();
    hours = hours.toString().length==1? 0+hours.toString() : hours;
    var minutes = x.getMinutes().toString()
    minutes = minutes.length == 1 ? 0+minutes : minutes;
    var seconds = x.getSeconds().toString()
    seconds = seconds.length == 1 ? 0+seconds : seconds;
    var month = (x.getMonth() +1).toString();
    month = month.length == 1 ? 0+month : month;
    var dt = x.getDate().toString();
    dt = dt.length == 1 ? 0+dt : dt;
    var x1= dt + "/" + month + "/" + x.getFullYear(); 
    x1 = x1 + " - " +  hours + ":" +  minutes + ":" +  seconds + " " + ampm;
    document.getElementById('zeit').innerHTML = x1;
    display_c7();

    //console.log(x.getSeconds());
    if (x.getSeconds()==0) einlesenFahrplan();
}

function einlesenXml(){

    var xmlDoc;
    if(typeof window.DOMParser != "undefined") {
        xmlhttp=new XMLHttpRequest();
        xmlhttp.open("GET","https://efa.sta.bz.it/apb/XML_DM_REQUEST?&locationServerActive=1&stateless=1&type_dm=any&name_dm=Brixen%20Brixen%20Dantestra%C3%9Fe&mode=direct",false);
        if (xmlhttp.overrideMimeType){
            xmlhttp.overrideMimeType('text/xml');
        }
        xmlhttp.send();
        xmlDoc=xmlhttp.responseXML;
        //console.log(xmlDoc);
    }

    var tagObj=xmlDoc.getElementsByTagName("infoLink");
    document.getElementById("informationstext").innerHTML = "";

    for(let i=0; i<tagObj.length; i++){
        document.getElementById("informationstext").innerHTML += "<h3>" + tagObj[i].getElementsByTagName("infoLinkText")[0].childNodes[0].nodeValue + "</h3>";
        document.getElementById("informationstext").innerHTML += tagObj[i].getElementsByTagName("content")[0].childNodes[0].nodeValue.replace(/<p>&nbsp;<\/p>/g, "") + "<br>";
        
        /* console.log(tagObj[i].getElementsByTagName("infoLinkText")[0].childNodes[0].nodeValue);
        console.log(tagObj[i].getElementsByTagName("content")[0].childNodes[0].nodeValue); */
    }
    

}
console.log(document);

einlesenXml();
einlesenWetter();
einlesenFahrplan();
display_c7();