function display_c7(){
    var refresh=1000; // Refresh rate in milli seconds
    mytime=setTimeout('display_ct7()',refresh);
}

/* function aufrufFahrplan(){
    mytime = setTimeout('einlesenFahrplan()', 10000);
} */

function aufrufWetter(){
    mytime = setTimeout('einlesenWetter()', 10000);
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
    let tempId = "";
    let niederId = "";
    let windId = "";

    console.log(data);

    tempId = "temp";
    niederId = "nieder";
    windId = "wind";
    
    document.getElementById(tempId).innerHTML = "&nbsp;" + brixen.t + "°C";
    document.getElementById(niederId).innerHTML = "&nbsp;" + brixen.n + "ml Niederschlag";
    document.getElementById(windId).innerHTML = "&nbsp;" + brixen.p;

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

        if (x.getHours() > stunde) stunde + 24;
        stunde = stunde - x.getHours();
        minu = minu - x.getMinutes() + stunde * 60;
        console.log(minu);
        stunde = Math.floor(minu/60);
        minu = minu - (stunde * 60);

        if (stunde == 0) document.getElementById(countdown).innerHTML = "in " + minu + " min";
        else document.getElementById(countdown).innerHTML = "in " + stunde + " h und " + minu + " min";
    }
    //aufrufFahrplan();
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

einlesenWetter();
einlesenFahrplan();
display_c7();