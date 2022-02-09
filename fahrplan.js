let textVariable = 0;
let tagObj;

function display_c7(){
    var refresh=1000; // Refresh rate in milli seconds
    mytime=setTimeout('display_ct7()',refresh);
}

/* function aufrufFahrplan(){
    mytime = setTimeout('einlesenFahrplan()', 10000);
} */

function aufrufWetter(){
    mytime = setTimeout('einlesenWetter()', 150000);
}

function aufrufTemp(){
    mytime = setTimeout('einlesenTemperatur()', 50000);
}

function aufrufText(){
    mytime = setTimeout('erneuereText()', 5000);
}

// Liest das JSON-File des Fahplans ein und übergibt es der Funktion aufrufFahrplan()
function einlesenFahrplan(){
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

function einlesenTemperatur(){
    fetch("http://daten.buergernetz.bz.it/services/weather/station?categoryId=1&lang=de&format=json")
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            aufrufTemp();
        }
    })
    .then(json => temperatur(json));
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

function temperatur(data){
    let brixen;

    data.rows.map((e) => {
        if(e["name"] === "Brixen - Vahrn")
            brixen = e;
    });

    document.getElementById("temp").innerHTML = "&nbsp;" + brixen.t + "°C";

    aufrufWetter();
}

function wetter(data){

    let bild = "./Wetter/" + data.weather[0].icon + ".png";
    let hintergrund = "url(./Wetter/" + "h" + data.weather[0].icon + ".png)";

    document.getElementById("allgemein").src = bild;
    document.getElementsByClassName("wetter")[0].style.backgroundImage = hintergrund;
    
    document.getElementById("nieder").innerHTML = "&nbsp;" + data.main.humidity + "% Luftfeuchtigkeit";
    document.getElementById("wind").innerHTML = "&nbsp;" + data.wind.speed + "m/s";
    document.getElementById("wetterart").innerHTML = data.weather[0].description;

    document.getElementById("allgemein1").src = bild;
    document.getElementsByClassName("wetterMg")[0].style.backgroundImage = hintergrund;
    
    document.getElementById("nieder1").innerHTML = "&nbsp;" + data.main.humidity + "% Luftfeuchtigkeit";
    document.getElementById("wind1").innerHTML = "&nbsp;" + data.wind.speed + "m/s";
    document.getElementById("wetterart1").innerHTML = data.weather[0].description;

    aufrufWetter();
}

// Berechnet und gibt den Fahrplan aus
function fahrplan(data){

    let linieId = "";
    let zielId = "";
    let abfahrtId = "";
    let countdown = "";
    let richtungId = "";
    let minu = 0;
    let stunde = 0;

    for(let i=0; i<14; i++){
        // Den Linien IDs zuweisen
        linieId = "linie" + i;
        zielId = "ziel" + i;
        abfahrtId = "abfahrt" + i;
        richtungId = "richtung" + i;
        countdown = "countdown" + i;
        stunde = data.departureList[i].dateTime.hour;
        minu = data.departureList[i].dateTime.minute;
        
        // Linienname und Nummer ausgeben
        document.getElementById(linieId).innerHTML = data.departureList[i].servingLine.number;
        document.getElementById(zielId).innerHTML = data.departureList[i].servingLine.direction;

        console.log(data.departureList[i].servingLine.liErgRiProj.direction)
        
        // Richtung herausfinden
        if (data.departureList[i].x == "702534") document.getElementById(richtungId).innerHTML = "Nord";
        else if (data.departureList[i].x == "702523") document.getElementById(richtungId).innerHTML = "Süd";
        
        // Abfahrtszeit ausgeben
        if (minu<10) document.getElementById(abfahrtId).innerHTML = stunde + ":0" + minu;
        else document.getElementById(abfahrtId).innerHTML = stunde + ":" + minu;

        // Countdown berechnen
        minu = data.departureList[i].countdown;
        stunde = Math.floor(minu/60);
        minu = minu - (stunde * 60);

        // Countdown ausgeben
        if (stunde == 0) document.getElementById(countdown).innerHTML = "in " + minu + " min";
        else document.getElementById(countdown).innerHTML = "in " + stunde + " h und " + minu + " min";
    }

    let brixen = data.rows.filter(e => e.name == "Brixen - Vahrn")[0];
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

    tagObj=xmlDoc.getElementsByTagName("infoLink");
    document.getElementById("informationstext").innerHTML = "";
    
    erneuereText();
}

function erneuereText(){
    document.getElementById("informationstext").innerHTML = "";
    document.getElementById("informationstext").innerHTML += "<h4 style=\"font-weight: bold;\">" + tagObj[textVariable].getElementsByTagName("infoLinkText")[0].childNodes[0].nodeValue + "</h4>";
    document.getElementById("informationstext").innerHTML += tagObj[textVariable].getElementsByTagName("content")[0].childNodes[0].nodeValue.replace(/<p>&nbsp;<\/p>/g, "");

    textVariable++;

    if (tagObj.length == textVariable) textVariable=0;

    aufrufText();
}

einlesenXml();
einlesenWetter();
einlesenFahrplan();
einlesenTemperatur();
display_c7();