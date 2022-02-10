// Für den Informationstext
let zaehlVariable = -1;
let textVariable = 0;
let tagObj;

// Ruft die Funktion display_ct7() alle Sekunden auf
function display_c7(){
    var refresh=1000; // Refresh rate in milli sekunden
    mytime=setTimeout('display_ct7()',refresh);
}

// Ruft die Funktion einlesenWetter() alle 12 min auf
function aufrufWetter(){
    mytime = setTimeout('einlesenWetter()', 120000);
}

// Ruft die Funktion einlesenTemperatur() alle 5 min auf
function aufrufTemp(){
    mytime = setTimeout('einlesenTemperatur()', 50000);
}

// Ruft die Funktion erneuereText() alle 15 sec auf
function aufrufText(){
    if (zaehlVariable == -1){
        zaehlVariable = 1;
        erneuereText();
    }
    else if (zaehlVariable%240 == 0){
        zaehlVariable = 1;
        einlesenXml();
        
    }
    else mytime = setTimeout('erneuereText()', 15000);
    zaehlVariable++;
}

// Liest das JSON-File des Fahplans ein und übergibt es der Funktion aufrufFahrplan()
function einlesenFahrplan(){
    fetch("https://efa.sta.bz.it/apb/XML_DM_REQUEST?&locationServerActive=1&stateless=1&type_dm=any&name_dm=Brixen%20Brixen%20Dantestra%C3%9Fe&mode=direct&outputFormat=json")
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                aufrufFahrplan();
            }
        })
        .then(json => fahrplan(json));
}

//Liest JASON-File von Opden Data Südtirol ein für die aktuelle Temperatur
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

//Liest das JASON-File von Open Wather ein für alle Wetterinformationen und Wettervorhersagen bis auf Temperatur
function einlesenWetter(){
    fetch("https://api.openweathermap.org/data/2.5/forecast?id=6535887&appid=dc704448494ba8187b5e3cf65aafac7f&cnt=40&units=metric&lang=de")
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                aufrufWetter();
            }
        })
        .then(json => wetter(json));
}

//Aktuelle Temperatur wird von JASON-File ausgelesen und in das HTML dokument geschrieben
function temperatur(data){
    let brixen;
    //Von Jason File wird nur der Teil von Brixen herausgesucht
    data.rows.map((e) => {
        if(e["name"] === "Brixen - Vahrn")
            brixen = e;
    });

    document.getElementById("temp").innerHTML = "&nbsp;" + brixen.t + "°C";

    aufrufWetter();
}

//Liest alle Wetterdeteils bis auf temperatur vom JASON FILE aus und schreibt diese in das HTML Dokument
function wetter(jsonData){ 
    
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate()+1);
    const string = tomorrow.toISOString().split('T')[0] + " 12:00:00";
    let data = jsonData.list[0];
    let dataMg = jsonData.list.find(e => e.dt_txt == string);

    let bild = "./Wetter/" + data.weather[0].icon + ".png";
    let hintergrund = "url(./Wetter/" + "h" + data.weather[0].icon + ".png)";

    document.getElementById("allgemein").src = bild;
    document.getElementsByClassName("wetter")[0].style.backgroundImage = hintergrund;
    
    document.getElementById("nieder").innerHTML = "&nbsp;" + data.main.humidity + "% Luftfeuchtigkeit";
    document.getElementById("wind").innerHTML = "&nbsp;" + data.wind.speed + "m/s";
    document.getElementById("wetterart").innerHTML = data.weather[0].description;

    let minTemp = 100.00;
    let maxTemp =-100.00;
    let windGesch = 0.00;
    let bilder = [];

    //Es werden die durchschnittlichen temperaturen und windgeschwindigkeiten für den nächsten Tag herausgefunden
    for (let i=0; i<16; i++){
        if (jsonData.list[i].dt_txt[9] == string[9]){
            if (jsonData.list[i].main.temp_min < minTemp) minTemp = jsonData.list[i].main.temp_min;
            if (jsonData.list[i].main.temp_max > maxTemp) maxTemp = jsonData.list[i].main.temp_max;
            windGesch += jsonData.list[i].wind.speed;
            bilder.push(jsonData.list[i].weather[0].icon);
        } 
    }

    windGesch = Math.round(windGesch/bilder.length* 100) /100;

    bilder.sort();
    bilder.reverse();

    let vorheriges = bilder[0];
    bilder.push()
    let hoechstes = 0;
    let aktuell = 1;
    let bild1 = "";

    for (let i=1; i<bilder.length; i++){
        if (bilder[i] == vorheriges) aktuell++;
        else if (aktuell <= hoechstes) aktuell = 1;
        else {
            bild1 = bilder[i-1];
            hoechstes = aktuell;
            aktuell = 1;
        }
        vorheriges = bilder[i];
    }

    //Daten für das Wetter von morgen werden in das HTML-Dokument geschrieben
    document.getElementById("tempMg").innerHTML = "&nbsp;" + "Min: " + minTemp + "°C";
    document.getElementById("niederMg").innerHTML = "&nbsp;" + "Max: " + maxTemp + "°C";

    let bildMg = "./Wetter/" + bild1 + ".png";
    let hintergrundMg = "url(./Wetter/" + "h" + bild1 + ".png)";

    document.getElementById("allgemeinMg").src = bildMg;
    document.getElementsByClassName("wetterMg")[0].style.backgroundImage = hintergrundMg;
    document.getElementById("wetterartMg").innerHTML = "";
    document.getElementById("windMg").innerHTML = "&nbsp;" + windGesch + "m/s";
    

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
        if (stunde == 0 && minu == 0) document.getElementById(countdown).innerHTML = "jetzt";
        else if (stunde == 0) document.getElementById(countdown).innerHTML = "in " + minu + " min";
        else document.getElementById(countdown).innerHTML = "in " + stunde + " h und " + minu + " min";
    }

}

//Findet die derzeitige Uhrzeit und das aktuelle Datum in gewohnten Format
function display_ct7(){ 
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
    var x1 = dt + "/" + month + "/" + x.getFullYear(); 
    x1 = x1 + " - " +  hours + ":" +  minutes + ":" +  seconds + " " + ampm;
    document.getElementById('zeit').innerHTML = x1;
    display_c7();

    if (x.getSeconds()==0) einlesenFahrplan();
}

//XML-Dokument, welches die Aktuellen Meldungen enthält wird ausgelesen
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
    }

    tagObj=xmlDoc.getElementsByTagName("infoLink");
    
    aufrufText();
}

function erneuereText(){
    document.getElementById("informationstext").innerHTML = "";
    document.getElementById("informationstext").innerHTML += "<h4 style=\"font-weight: bold;\">" + tagObj[textVariable].getElementsByTagName("infoLinkText")[0].childNodes[0].nodeValue + "</h4>";
    document.getElementById("informationstext").innerHTML += tagObj[textVariable].getElementsByTagName("content")[0].childNodes[0].nodeValue.replace(/<p>&nbsp;<\/p>/g, "");

    textVariable++;

    if (tagObj.length == textVariable) textVariable=0;

    aufrufText();
}

//Hier werden alle benötigten Funktionen aufgerufen
einlesenXml();
einlesenWetter();
einlesenFahrplan();
einlesenTemperatur();
display_c7();