import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

const TABS = ["Przegląd","Mapa","Miejsca","Plan dnia","Budżet","Pakowanie","Notatki","Tłumacz","SOS","Galeria"];
const ICONS = {"Przegląd":"📋","Mapa":"🗺️","Miejsca":"📍","Plan dnia":"🗓️","Budżet":"💰","Pakowanie":"🎒","Notatki":"📝","Tłumacz":"🌍","SOS":"🆘","Galeria":"📸"};
const CURRENCIES = ["PLN","EUR","USD","GBP","CZK","CHF","SEK","NOK","DKK","HUF","TRY","JPY","THB"];
const CATEGORIES = ["Transport","Nocleg","Jedzenie","Atrakcje","Zakupy","Inne"];
const CAT_ICONS = {Transport:"✈️",Nocleg:"🏨",Jedzenie:"🍽️",Atrakcje:"🎭",Zakupy:"🛍️",Inne:"📦"};
const CAT_COLORS = {Transport:"#4A90D9",Nocleg:"#8B5CF6",Jedzenie:"#F59E0B",Atrakcje:"#EC4899",Zakupy:"#10B981",Inne:"#6B7280"};
const PRI_COLORS = {high:"#C4362B",medium:"#C08733",low:"#4E8B63"};
const WMO_ICONS = {0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",48:"🌫️",51:"🌦️",53:"🌧️",55:"🌧️",61:"🌧️",63:"🌧️",65:"🌧️",71:"🌨️",73:"🌨️",75:"❄️",80:"🌦️",81:"🌧️",82:"⛈️",95:"⛈️"};
const WMO_TEXT = {0:"Słonecznie",1:"Lekkie chmury",2:"Częściowe zachmurzenie",3:"Pochmurno",45:"Mgła",51:"Mżawka",61:"Lekki deszcz",63:"Deszcz",65:"Silny deszcz",71:"Lekki śnieg",73:"Śnieg",75:"Silny śnieg",80:"Przelotny deszcz",82:"Ulewa",95:"Burza"};
const PACK_TEMPLATES = {
  "Dokumenty":["Paszport / dowód","Bilety lotnicze","Ubezpieczenie","Kopie dokumentów","Gotówka / karty","Prawo jazdy"],
  "Ubrania":["Koszulki","Spodnie","Bielizna","Skarpetki","Kurtka","Piżama","Buty wygodne"],
  "Higiena":["Szczoteczka do zębów","Pasta","Szampon","Żel pod prysznic","Dezodorant","Krem z filtrem","Leki osobiste"],
  "Elektronika":["Telefon + ładowarka","Powerbank","Adapter do gniazdka","Słuchawki","Aparat foto"],
  "Apteczka":["Plastry","Środki przeciwbólowe","Leki na żołądek","Środki na komary"],
  "Inne":["Okulary przeciwsłoneczne","Parasol","Książka / czytnik","Przekąski na drogę"]
};
const ACTIVITY_SUGGESTIONS = {
  "Rano (6-10)":["🌅 Wschód słońca","☕ Śniadanie w kawiarni","🏃 Poranny jogging","📸 Sesja zdjęciowa","🐟 Wizyta na targu"],
  "Przedpołudnie (10-13)":["🏛️ Zwiedzanie muzeum","🚶 Spacer po starówce","⛪ Kościół/katedra","🏰 Zamek","🌊 Plaża","🚴 Wycieczka rowerowa","🏔️ Szlak górski"],
  "Popołudnie (13-17)":["🍽️ Obiad w restauracji","🛍️ Zakupy/pamiątki","🏖️ Odpoczynek na plaży","🚣 Rejs statkiem","🌿 Park","🍷 Degustacja wina","📍 Punkt widokowy"],
  "Wieczór (17-21)":["🌇 Zachód słońca","🍕 Kolacja","🎭 Teatr / koncert","🍺 Pub / bar","🌃 Spacer nocny","💃 Życie nocne","🛀 Spa / relaks"]
};

const PHRASES = {
  "Podstawowe":{"Cześć":["Hello","Hallo","Bonjour","Hola","Ciao"],"Dziękuję":["Thank you","Danke","Merci","Gracias","Grazie"],"Przepraszam":["Sorry","Entschuldigung","Pardon","Perdón","Scusi"],"Tak / Nie":["Yes / No","Ja / Nein","Oui / Non","Sí / No","Sì / No"],"Nie rozumiem":["I don't understand","Ich verstehe nicht","Je ne comprends pas","No entiendo","Non capisco"],"Ile to kosztuje?":["How much?","Wie viel kostet das?","Combien ça coûte?","¿Cuánto cuesta?","Quanto costa?"],"Gdzie jest...?":["Where is...?","Wo ist...?","Où est...?","¿Dónde está...?","Dove è...?"],"Pomocy!":["Help!","Hilfe!","Au secours!","¡Ayuda!","Aiuto!"],"Mówisz po polsku?":["Do you speak Polish?","Sprechen Sie Polnisch?","Parlez-vous polonais?","¿Habla polaco?","Parla polacco?"],"Proszę":["Please","Bitte","S'il vous plaît","Por favor","Per favore"],"Dzień dobry":["Good morning","Guten Morgen","Bonjour","Buenos días","Buongiorno"],"Dobranoc":["Good night","Gute Nacht","Bonne nuit","Buenas noches","Buonanotte"]},
  "Hotel":{"Mam rezerwację":["I have a reservation","Ich habe eine Reservierung","J'ai une réservation","Tengo una reserva","Ho una prenotazione"],"Pokój jednoosobowy":["Single room","Einzelzimmer","Chambre simple","Habitación individual","Camera singola"],"Pokój dwuosobowy":["Double room","Doppelzimmer","Chambre double","Habitación doble","Camera doppia"],"Klucz do pokoju":["Room key","Zimmerschlüssel","Clé de chambre","Llave de habitación","Chiave della camera"],"Czy jest WiFi?":["Is there WiFi?","Gibt es WLAN?","Y a-t-il du WiFi?","¿Hay WiFi?","C'è il WiFi?"],"O której wymeldowanie?":["Checkout time?","Wann ist Check-out?","L'heure du check-out?","¿Hora de check-out?","A che ora il check-out?"],"Klimatyzacja nie działa":["AC is not working","Klimaanlage funktioniert nicht","La clim ne marche pas","El aire acondicionado no funciona","L'aria condizionata non funziona"],"Ręczniki proszę":["Towels please","Handtücher bitte","Des serviettes s'il vous plaît","Toallas por favor","Asciugamani per favore"]},
  "Restauracja":{"Stolik dla 2 osób":["Table for 2","Tisch für 2","Table pour 2","Mesa para 2","Tavolo per 2"],"Menu proszę":["Menu please","Die Karte bitte","Le menu s'il vous plaît","La carta por favor","Il menù per favore"],"Rachunek proszę":["Bill please","Die Rechnung bitte","L'addition s'il vous plaît","La cuenta por favor","Il conto per favore"],"Woda":["Water","Wasser","Eau","Agua","Acqua"],"Kawa":["Coffee","Kaffee","Café","Café","Caffè"],"Piwo":["Beer","Bier","Bière","Cerveza","Birra"],"Pyszne!":["Delicious!","Lecker!","Délicieux!","¡Delicioso!","Delizioso!"],"Jestem wegetarianinem":["I'm vegetarian","Ich bin Vegetarier","Je suis végétarien","Soy vegetariano","Sono vegetariano"],"Mam alergię na...":["I'm allergic to...","Ich bin allergisch gegen...","Je suis allergique à...","Soy alérgico a...","Sono allergico a..."],"Bez glutenu":["Gluten free","Glutenfrei","Sans gluten","Sin gluten","Senza glutine"]},
  "Transport":{"Bilet":["Ticket","Fahrkarte","Billet","Billete","Biglietto"],"Dworzec":["Station","Bahnhof","Gare","Estación","Stazione"],"Lotnisko":["Airport","Flughafen","Aéroport","Aeropuerto","Aeroporto"],"Taxi":["Taxi","Taxi","Taxi","Taxi","Taxi"],"W lewo / W prawo":["Left / Right","Links / Rechts","Gauche / Droite","Izquierda / Derecha","Sinistra / Destra"],"Prosto":["Straight","Geradeaus","Tout droit","Recto","Dritto"],"Przystanek":["Stop","Haltestelle","Arrêt","Parada","Fermata"],"Bilet powrotny":["Return ticket","Rückfahrkarte","Aller-retour","Billete de ida y vuelta","Biglietto andata e ritorno"],"O której odjeżdża...?":["What time does... leave?","Wann fährt... ab?","À quelle heure part...?","¿A qué hora sale...?","A che ora parte...?"],"Ile trwa podróż?":["How long is the journey?","Wie lange dauert die Fahrt?","Combien de temps dure le trajet?","¿Cuánto dura el viaje?","Quanto dura il viaggio?"]},
  "Zakupy":{"Czy mogę przymierzyć?":["Can I try it on?","Kann ich das anprobieren?","Puis-je l'essayer?","¿Puedo probármelo?","Posso provarlo?"],"Za duże / Za małe":["Too big / Too small","Zu groß / Zu klein","Trop grand / Trop petit","Muy grande / Muy pequeño","Troppo grande / Troppo piccolo"],"Czy jest zniżka?":["Is there a discount?","Gibt es einen Rabatt?","Y a-t-il une réduction?","¿Hay descuento?","C'è uno sconto?"],"Karta / Gotówka":["Card / Cash","Karte / Bargeld","Carte / Espèces","Tarjeta / Efectivo","Carta / Contanti"],"Paragon proszę":["Receipt please","Quittung bitte","Le ticket s'il vous plaît","El recibo por favor","Lo scontrino per favore"],"Który sklep polecacie?":["Which shop do you recommend?","Welches Geschäft empfehlen Sie?","Quel magasin recommandez-vous?","¿Qué tienda recomienda?","Quale negozio consiglia?"]},
  "Nagłe wypadki":{"Potrzebuję lekarza":["I need a doctor","Ich brauche einen Arzt","J'ai besoin d'un médecin","Necesito un médico","Ho bisogno di un medico"],"Boli mnie...":["It hurts...","Es tut weh...","J'ai mal...","Me duele...","Mi fa male..."],"Apteka":["Pharmacy","Apotheke","Pharmacie","Farmacia","Farmacia"],"Szpital":["Hospital","Krankenhaus","Hôpital","Hospital","Ospedale"],"Policja":["Police","Polizei","Police","Policía","Polizia"],"Zgubiłem się":["I'm lost","Ich habe mich verlaufen","Je suis perdu","Estoy perdido","Mi sono perso"],"Ukradli mi...":["I've been robbed","Man hat mich bestohlen","On m'a volé","Me han robado","Sono stato derubato"],"Zgubiłem paszport":["I lost my passport","Ich habe meinen Pass verloren","J'ai perdu mon passeport","He perdido mi pasaporte","Ho perso il passaporto"],"Proszę zadzwonić na pogotowie":["Please call an ambulance","Bitte rufen Sie einen Krankenwagen","Appelez une ambulance","Llame una ambulancia","Chiami un'ambulanza"]},
  "Zwiedzanie":{"Ile kosztuje bilet?":["How much is the ticket?","Was kostet der Eintritt?","Combien coûte le billet?","¿Cuánto cuesta la entrada?","Quanto costa il biglietto?"],"Czy są zniżki studenckie?":["Student discounts?","Studentenrabatt?","Réduction étudiante?","¿Descuento para estudiantes?","Sconto studenti?"],"O której zamykacie?":["What time do you close?","Wann schließen Sie?","À quelle heure fermez-vous?","¿A qué hora cierran?","A che ora chiudete?"],"Czy można fotografować?":["Can I take photos?","Darf man fotografieren?","Puis-je prendre des photos?","¿Se pueden hacer fotos?","Posso fare foto?"],"Gdzie jest wyjście?":["Where is the exit?","Wo ist der Ausgang?","Où est la sortie?","¿Dónde está la salida?","Dov'è l'uscita?"],"Audioprzewodnik proszę":["Audio guide please","Audioguide bitte","Audioguide s'il vous plaît","Audioguía por favor","Audioguida per favore"]}
};
const LANG_FLAGS=["🇬🇧","🇩🇪","🇫🇷","🇪🇸","🇮🇹"];
const LANG_CODES=["en-GB","de-DE","fr-FR","es-ES","it-IT"];
const LANG_NAMES=["ang.","niem.","fr.","hiszp.","wł."];
const EMERGENCY_DATA = {
  "Niemcy":{tel:"112",police:"110",amb:"🇩🇪 Ambasada RP: Berlin, Lassenstr. 19-21, +49 30 22313-0",tips:["Ubezpieczenie EKUZ ważne","Apteki (Apotheke) zamykają wcześnie","Numer 116 117 — lekarz dyżurny"]},
  "Francja":{tel:"15 (SAMU) / 112",police:"17",amb:"🇫🇷 Ambasada RP: Paryż, 1 rue de Talleyrand, +33 1 43 17 34 00",tips:["EKUZ honorowane","Apteki z zielonym krzyżem","SOS Médecins — wizyty domowe"]},
  "Włochy":{tel:"118 / 112",police:"113",amb:"🇮🇹 Ambasada RP: Rzym, Via P.P. Rubens 20, +39 06 36204200",tips:["Pronto Soccorso = Izba przyjęć","Guardia Medica — lekarz nocny","Carabinieri (112) = policja wojskowa"]},
  "Hiszpania":{tel:"112",police:"091 / 112",amb:"🇪🇸 Ambasada RP: Madryt, C/ Guisando 23 bis, +34 91 373 60 05",tips:["EKUZ ważne","Centro de Salud — przychodnia","Farmacia z zielonym krzyżem"]},
  "Wielka Brytania":{tel:"999 / 112",police:"999",amb:"🇬🇧 Ambasada RP: Londyn, 47 Portland Pl, +44 20 7291 3520",tips:["NHS nie wymaga EKUZ (po Brexicie)","GP = lekarz pierwszego kontaktu","A&E = Izba przyjęć"]},
  "Czechy":{tel:"155 / 112",police:"158",amb:"🇨🇿 Ambasada RP: Praga, Valdštejnská 8, +420 257 099 500",tips:["EKUZ honorowane","Pohotovost = Pogotowie","Lékárna = Apteka"]},
  "Chorwacja":{tel:"194 / 112",police:"192",amb:"🇭🇷 Ambasada RP: Zagrzeb, Krležin Gvozd 3, +385 1 4899 444",tips:["EKUZ ważne","Hitna pomoć = Pogotowie","Ljekarna = Apteka"]},
  "Grecja":{tel:"166 / 112",police:"100",amb:"🇬🇷 Ambasada RP: Ateny, Chrissanthemon 22, +30 210 6797 700",tips:["EKUZ honorowane","Farmakeio = Apteka","EKAB (166) = Pogotowie"]},
  "Turcja":{tel:"112",police:"155",amb:"🇹🇷 Ambasada RP: Ankara, Atatürk Bulvarı 241, +90 312 457 20 18",tips:["Potrzebne ubezpieczenie prywatne","Eczane = Apteka","Acil = Nagły wypadek"]},
  "USA":{tel:"911",police:"911",amb:"🇺🇸 Ambasada RP: Waszyngton, 2640 16th St NW, +1 202 499 1700",tips:["Ubezpieczenie OBOWIĄZKOWE","ER = Izba przyjęć (droga!)","Urgent Care = tańsza alternatywa"]},
  "Tajlandia":{tel:"1669 / 112",police:"191",amb:"🇹🇭 Ambasada RP: Bangkok, 61/1-2 Soi Ruamruedee, +66 2 250 4275",tips:["Ubezpieczenie prywatne wymagane","Szpitale prywatne = wysoki standard","7-Eleven ma podstawowe leki"]}
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
const defaultTrip = () => ({id:uid(),name:"",destination:"",startDate:"",endDate:"",coverEmoji:"✈️",places:[],itinerary:[],expenses:[],notes:[],packing:[],currency:"PLN",destLat:null,destLng:null,destCC:""});
function saveTrips(t){try{localStorage.setItem("voyager-data",JSON.stringify(t));return true}catch(e){return false}}
function loadTrips(){try{const d=localStorage.getItem("voyager-data");return d?JSON.parse(d):[]}catch(e){return[]}}
function saveApiKey(k){try{localStorage.setItem("voyager-apikey",k)}catch(e){}}
function loadApiKey(){try{return localStorage.getItem("voyager-apikey")||""}catch(e){return""}}
function saveDark(v){try{localStorage.setItem("voyager-dark",v?"1":"0")}catch(e){}}
function loadDark(){try{return localStorage.getItem("voyager-dark")==="1"}catch(e){return false}}

const DarkCtx=createContext(false);

const compressImage=(file,maxDim=800,quality=0.6)=>new Promise((resolve)=>{const reader=new FileReader();reader.onload=(e)=>{const img=new Image();img.onload=()=>{const canvas=document.createElement("canvas");let w=img.width,h=img.height;if(w>maxDim||h>maxDim){if(w>h){h=(h/w)*maxDim;w=maxDim}else{w=(w/h)*maxDim;h=maxDim}}canvas.width=w;canvas.height=h;canvas.getContext("2d").drawImage(img,0,0,w,h);resolve(canvas.toDataURL("image/jpeg",quality))};img.src=e.target.result};reader.readAsDataURL(file)});

/* ═══ COUNTDOWN ═══ */
function Countdown({startDate,endDate}){const[now,setNow]=useState(new Date());useEffect(()=>{const t=setInterval(()=>setNow(new Date()),60000);return()=>clearInterval(t)},[]);if(!startDate)return null;const start=new Date(startDate+"T00:00:00");const end=endDate?new Date(endDate+"T23:59:59"):null;const diff=start-now;if(diff<=0&&end&&now<=end)return<div style={cdS.box}><div style={cdS.live}>Podróż w toku</div></div>;if(diff<=0)return null;const days=Math.floor(diff/864e5);const hours=Math.floor((diff%864e5)/36e5);return(<div style={cdS.box}><div style={{fontSize:10,letterSpacing:".18em",textTransform:"uppercase",opacity:.55,fontWeight:600}}>Do wyjazdu</div><div style={cdS.nums}><div style={cdS.unit}><span style={cdS.val}>{days}</span><span style={cdS.lbl}>dni</span></div><div style={cdS.unit}><span style={{...cdS.val,fontSize:24,opacity:.55}}>{hours}</span><span style={cdS.lbl}>godz.</span></div></div></div>)}
const cdS={box:{padding:"14px 0",marginBottom:4,borderBottom:"2px solid currentColor",display:"flex",alignItems:"baseline",gap:14},nums:{display:"flex",alignItems:"baseline",gap:10},unit:{display:"flex",alignItems:"baseline",gap:4},val:{fontSize:38,fontWeight:700,fontFamily:"'Fraunces',Georgia,serif",lineHeight:1,letterSpacing:"-.03em",fontVariantNumeric:"tabular-nums"},lbl:{fontSize:10,letterSpacing:".16em",textTransform:"uppercase",opacity:.6,fontWeight:600},live:{fontSize:11,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:"#8E1F16"}};

/* ═══ WEATHER ═══ */
function WeatherWidget({lat,lng,destination,onGeocode}){const dark=useContext(DarkCtx);const wS=dark?wSD:wSL;const[weather,setWeather]=useState(null);const[loading,setLoading]=useState(false);const[error,setError]=useState(null);const[geoLoading,setGeoLoading]=useState(false);const mounted=useRef(true);
const doGeocode=async()=>{if(!destination)return;setGeoLoading(true);try{const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(destination)}`,{headers:{"Accept-Language":"pl"}});const d=await r.json();if(d[0]&&onGeocode)onGeocode(+d[0].lat,+d[0].lon,d[0].address?.country_code||"")}catch{}setGeoLoading(false)};
useEffect(()=>{mounted.current=true;if(!lat||!lng)return;setLoading(true);setError(null);fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&current=temperature_2m,weathercode,relative_humidity_2m,wind_speed_10m&timezone=auto&forecast_days=7`).then(r=>r.json()).then(data=>{if(mounted.current){if(data.daily)setWeather(data);else setError("Brak danych")}}).catch(()=>{if(mounted.current)setError("Brak połączenia")}).finally(()=>{if(mounted.current)setLoading(false)});return()=>{mounted.current=false}},[lat,lng]);
if(!lat||!lng)return<div style={wS.box}><div style={wS.hdr}><span style={{fontSize:20}}>🌤️</span><span style={{fontWeight:700}}>Pogoda</span></div><div style={{padding:16,textAlign:"center"}}><p style={{color:"#8A837C",fontSize:13,marginBottom:12}}>Brak GPS dla celu</p>{destination&&<button onClick={doGeocode} disabled={geoLoading} style={{background:"#8E1F16",color:"#fff",border:"none",padding:"10px 20px",borderRadius:10,cursor:"pointer",fontWeight:600,fontSize:13}}>{geoLoading?"⏳":"📍 Znajdź: "+destination}</button>}</div></div>;
if(loading)return<div style={wS.box}><div style={wS.hdr}><span style={{fontSize:20}}>🌤️</span><span style={{fontWeight:700}}>Pogoda — {destination}</span></div><div style={{textAlign:"center",padding:"20px 0",color:"#8A837C"}}>⏳ Ładowanie...</div></div>;
if(error)return<div style={wS.box}><div style={wS.hdr}><span style={{fontSize:20}}>🌤️</span><span style={{fontWeight:700}}>Pogoda</span></div><p style={{color:"#8E1F16",fontSize:13,textAlign:"center",padding:"16px 0"}}>⚠️ {error}</p></div>;
if(!weather)return null;const cur=weather.current,d=weather.daily;const dn=["Nd","Pn","Wt","Śr","Cz","Pt","Sb"];
return(<div style={wS.box}><div style={wS.hdr}><span style={{fontSize:20}}>🌤️</span><span style={{fontWeight:700}}>Pogoda — {destination}</span></div><div style={{display:"flex",alignItems:"center",gap:16,padding:16}}><div style={{fontSize:48}}>{WMO_ICONS[cur.weathercode]||"🌡️"}</div><div><div style={{fontSize:36,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{Math.round(cur.temperature_2m)}°C</div><div style={{fontSize:14,color:dark?"#D8D3C9":"#2B2825"}}>{WMO_TEXT[cur.weathercode]||"—"}</div><div style={{fontSize:12,color:"#8A837C",marginTop:4}}>💧{cur.relative_humidity_2m}% 💨{Math.round(cur.wind_speed_10m)}km/h</div></div></div>
<div style={{display:"flex",overflowX:"auto",gap:4,padding:"4px 8px 12px"}}>{d.time.map((date,i)=>{const dt=new Date(date+"T12:00:00");return(<div key={i} style={{flex:"0 0 auto",width:64,textAlign:"center",padding:"8px 4px",borderRadius:10,background:dark?"#14120F":"#F4F2ED"}}><div style={{fontSize:11,fontWeight:700,color:"#8A837C",marginBottom:4}}>{i===0?"Dziś":dn[dt.getDay()]}</div><div style={{fontSize:22}}>{WMO_ICONS[d.weathercode[i]]||"🌡️"}</div><div style={{fontSize:13,fontWeight:700,marginTop:4}}>{Math.round(d.temperature_2m_max[i])}°</div><div style={{fontSize:11,color:"#8A837C"}}>{Math.round(d.temperature_2m_min[i])}°</div>{d.precipitation_sum[i]>0&&<div style={{fontSize:10,color:"#3b82f6",marginTop:2}}>💧{d.precipitation_sum[i].toFixed(1)}</div>}</div>)})}</div></div>)}
const wSL={box:{marginTop:26,borderTop:"1px solid #E2DFD9",paddingTop:14},hdr:{display:"flex",alignItems:"baseline",gap:8,marginBottom:10,fontFamily:"'Fraunces',Georgia,serif",fontSize:17,fontWeight:600,color:"#111111"}};
const wSD={box:{marginTop:26,borderTop:"1px solid #2C2823",paddingTop:14},hdr:{display:"flex",alignItems:"baseline",gap:8,marginBottom:10,fontFamily:"'Fraunces',Georgia,serif",fontSize:17,fontWeight:600,color:"#F2EFE9"}};

/* ═══ DESTINATION DISCOVERY ═══ */
function DestinationDiscovery({destination,lat,lng,onAddPlace}){const dark=useContext(DarkCtx);const[wiki,setWiki]=useState(null);const[pois,setPois]=useState([]);const[loading,setLoading]=useState(false);const[dtab,setDtab]=useState("info");
useEffect(()=>{if(!destination)return;setLoading(true);
fetch(`https://pl.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(destination)}`).then(r=>r.ok?r.json():null).then(d=>{if(d&&d.extract)setWiki(d);setLoading(false)}).catch(()=>{fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(destination)}`).then(r=>r.ok?r.json():null).then(d=>{if(d&&d.extract)setWiki(d);setLoading(false)}).catch(()=>setLoading(false))});
if(lat&&lng){fetch(`https://api.opentripmap.com/0.1/en/places/radius?radius=10000&lon=${lng}&lat=${lat}&kinds=interesting_places,museums,historic,natural,architecture&format=json&limit=12&apikey=5ae2e3f221c38a28845f05b6aeb0c3dfb6c68df20b0b8c4c12bf20d8`).then(r=>r.json()).then(data=>{if(Array.isArray(data))setPois(data.filter(p=>p.name&&p.name.trim()))}).catch(()=>{})}
},[destination,lat,lng]);
if(!destination)return null;
return(<div style={{background:dark?"#1C1916":"#fff",borderRadius:14,border:dark?"1px solid rgba(255,255,255,.08)":"1px solid rgba(0,0,0,.06)",marginBottom:12,overflow:"hidden"}}>
<div style={{display:"flex",borderBottom:dark?"1px solid rgba(255,255,255,.06)":"1px solid #EDEBE5"}}>{[["info","ℹ️ O miejscu"],["pois","🏛️ Atrakcje"]].map(([k,l])=><button key={k} onClick={()=>setDtab(k)} style={{flex:1,padding:"12px 8px",background:"none",border:"none",borderBottom:dtab===k?`2px solid ${dark?"#D8503F":"#8E1F16"}`:"2px solid transparent",cursor:"pointer",fontFamily:"'Work Sans',system-ui,sans-serif",fontSize:13,fontWeight:dtab===k?700:500,color:dtab===k?(dark?"#D8503F":"#8E1F16"):"#8A837C"}}>{l}</button>)}</div>
{dtab==="info"&&<div style={{padding:16}}>{wiki?<>{wiki.thumbnail&&<img src={wiki.thumbnail.source} alt="" style={{width:"100%",height:160,objectFit:"cover",borderRadius:10,marginBottom:12}}/>}<h4 style={{fontSize:16,fontWeight:700,fontFamily:"'Fraunces',Georgia,serif",marginBottom:8}}>{wiki.title}</h4><p style={{fontSize:14,color:dark?"#D8D3C9":"#2B2825",lineHeight:1.7}}>{wiki.extract}</p>{wiki.content_urls&&<a href={wiki.content_urls.desktop.page} target="_blank" rel="noreferrer" style={{display:"inline-block",marginTop:10,fontSize:11,color:dark?"#D8503F":"#8E1F16",fontWeight:600,letterSpacing:".08em",textTransform:"uppercase"}}>📖 Wikipedia →</a>}</>:<div style={{textAlign:"center",padding:"20px 0",color:"#8A837C",fontSize:13}}>{loading?"⏳ Szukam...":"Brak informacji"}</div>}</div>}
{dtab==="pois"&&<div style={{padding:12,maxHeight:300,overflowY:"auto"}}>{pois.length>0?pois.map((p,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:i%2===0?(dark?"#242019":"#F4F2ED"):"transparent",borderRadius:8,marginBottom:4}}><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:dark?"#F2EFE9":"#111111"}}>{p.name}</div>{p.kinds&&<div style={{fontSize:11,color:"#8A837C",marginTop:2}}>{p.kinds.split(",").slice(0,3).map(k=>k.replace(/_/g," ")).join(" • ")}</div>}</div>{p.point&&onAddPlace&&<button onClick={()=>onAddPlace({id:uid(),name:p.name,description:p.kinds?p.kinds.split(",").slice(0,2).map(k=>k.replace(/_/g," ")).join(", "):"",priority:"medium",visited:false,lat:p.point.lat,lng:p.point.lon})} style={{background:"#3F6B4A",color:"#fff",border:"none",padding:"4px 10px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:600,flexShrink:0,marginLeft:8}}>+ Dodaj</button>}</div>)):<div style={{textAlign:"center",padding:"20px 0",color:"#8A837C",fontSize:13}}>Brak atrakcji w bazie</div>}</div>}
</div>)}

/* ═══ CURRENCY ═══ */
function CurrencyConverter({baseCurrency}){const dark=useContext(DarkCtx);const s=dark?sDark:sL;const[amount,setAmount]=useState("100");const[from,setFrom]=useState(baseCurrency||"PLN");const[to,setTo]=useState(baseCurrency==="EUR"?"PLN":"EUR");const[rate,setRate]=useState(null);const[loading,setLoading]=useState(false);
const convert=async()=>{if(!amount)return;setLoading(true);try{const r=await fetch(`https://api.frankfurter.dev/v1/latest?amount=${amount}&from=${from}&to=${to}`);const d=await r.json();if(d.rates&&d.rates[to])setRate(d.rates[to]);else setRate(null)}catch{setRate(null)}setLoading(false)};
useEffect(()=>{if(amount&&from!==to)convert()},[from,to]);
return(<div style={{background:dark?"#1C1916":"#fff",borderRadius:14,padding:16,border:dark?"1px solid rgba(255,255,255,.08)":"1px solid rgba(0,0,0,.06)",marginBottom:16}}><h3 style={{fontSize:15,fontWeight:700,marginBottom:12,color:dark?"#EDEBE5":"#111111"}}>💱 Przelicznik walut</h3>
<div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} style={{...s.inp,flex:1,minWidth:80,marginBottom:0}} placeholder="Kwota"/><select value={from} onChange={e=>setFrom(e.target.value)} style={{...s.inp,width:80,flex:"none",marginBottom:0}}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</select><button onClick={()=>{const t=from;setFrom(to);setTo(t)}} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",padding:4,color:dark?"#F2EFE9":"#111111"}}>⇄</button><select value={to} onChange={e=>setTo(e.target.value)} style={{...s.inp,width:80,flex:"none",marginBottom:0}}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</select><button onClick={convert} disabled={loading||from===to} style={{background:"#8E1F16",color:"#fff",border:"none",padding:"10px 16px",borderRadius:10,cursor:"pointer",fontWeight:600,fontSize:13}}>{loading?"⏳":"Przelicz"}</button></div>
{rate!==null&&<div style={{marginTop:12,textAlign:"center",padding:12,background:dark?"#14120F":"#F4F2ED",borderRadius:10}}><div style={{fontSize:14,color:"#8A837C"}}>{amount} {from} =</div><div style={{fontSize:28,fontWeight:700,fontFamily:"'DM Mono',monospace",color:dark?"#D8503F":"#8E1F16"}}>{rate.toFixed(2)} {to}</div></div>}</div>)}

/* ═══ PHOTO ═══ */
function PhotoUpload({photos,onChange}){const fileRef=useRef(null);const[uploading,setUploading]=useState(false);const handleFiles=async(e)=>{const files=Array.from(e.target.files);if(!files.length)return;setUploading(true);const np=[];for(const f of files.slice(0,5)){if(!f.type.startsWith("image/"))continue;np.push({id:uid(),data:await compressImage(f),name:f.name})}onChange([...(photos||[]),...np]);setUploading(false);if(fileRef.current)fileRef.current.value=""};
return(<div><div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>{(photos||[]).map(p=><div key={p.id} style={{position:"relative",width:80,height:80,borderRadius:10,overflow:"hidden",border:"2px solid #E2DFD9"}}><img src={p.data} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/><button onClick={()=>onChange(photos.filter(x=>x.id!==p.id))} style={{position:"absolute",top:2,right:2,width:20,height:20,borderRadius:"50%",background:"rgba(0,0,0,.6)",color:"#fff",border:"none",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></div>)}<button onClick={()=>fileRef.current&&fileRef.current.click()} disabled={uploading} style={{width:80,height:80,borderRadius:10,border:"2px dashed #E2DFD9",background:"#F4F2ED",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontSize:10,color:"#8A837C",fontWeight:600}}>{uploading?"⏳":<>📷<span style={{marginTop:2}}>Dodaj</span></>}</button></div><input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{display:"none"}}/></div>)}

/* ═══ MAP ═══ */
function TripMap({trip,onAddPlace}){const containerRef=useRef(null);const mapRef=useRef(null);const markersRef=useRef(null);const clickMkRef=useRef(null);const myLocRef=useRef(null);const[ready,setReady]=useState(false);const[query,setQuery]=useState("");const[results,setResults]=useState([]);const[searching,setSearching]=useState(false);const[clickPos,setClickPos]=useState(null);const[newName,setNewName]=useState("");const watchRef=useRef(null);const orientHandler=useRef(null);const[gpsLoading,setGpsLoading]=useState(false);const[gpsError,setGpsError]=useState("");const[tracking,setTracking]=useState(false);
useEffect(()=>{if(window.L){setReady(true);return}const css=document.createElement("link");css.rel="stylesheet";css.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(css);const js=document.createElement("script");js.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";js.onload=()=>setReady(true);document.head.appendChild(js)},[]);
useEffect(()=>{if(!ready||!containerRef.current||mapRef.current)return;const L=window.L;const map=L.map(containerRef.current,{zoomControl:false}).setView([52,19],6);L.control.zoom({position:"bottomright"}).addTo(map);L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",{attribution:'© OSM',maxZoom:19}).addTo(map);markersRef.current=L.layerGroup().addTo(map);map.on("click",e=>{setClickPos({lat:e.latlng.lat,lng:e.latlng.lng});setNewName("")});mapRef.current=map;if(trip.destLat&&trip.destLng)map.setView([trip.destLat,trip.destLng],10);else if(trip.destination)fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trip.destination)}&limit=1`).then(r=>r.json()).then(d=>{if(d[0]&&mapRef.current)mapRef.current.setView([+d[0].lat,+d[0].lon],10)}).catch(()=>{});return()=>{if(mapRef.current){try{mapRef.current.remove()}catch(e){}}mapRef.current=null;markersRef.current=null}},[ready]);
useEffect(()=>{if(!mapRef.current||!window.L||!markersRef.current)return;const L=window.L;try{markersRef.current.clearLayers()}catch(e){return}const geo=trip.places.filter(p=>p.lat&&p.lng);geo.forEach(p=>{const c=p.visited?"#8A837C":(PRI_COLORS[p.priority]||"#8E1F16");L.marker([p.lat,p.lng],{icon:L.divIcon({className:"",iconSize:[0,0],html:`<div style="width:34px;height:34px;border-radius:50%;background:${c};border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff;font-weight:700;transform:translate(-17px,-17px);${p.visited?"opacity:.55;":""}">${p.visited?"✓":"📍"}</div>`})}).bindPopup(`<div style="font-family:sans-serif"><strong>${p.name}</strong>${p.description?`<p style="color:#666;font-size:12px;margin:4px 0 0">${p.description}</p>`:""}</div>`).addTo(markersRef.current)});if(geo.length>1)try{mapRef.current.fitBounds(L.latLngBounds(geo.map(p=>[p.lat,p.lng])).pad(.25))}catch(e){}else if(geo.length===1)try{mapRef.current.setView([geo[0].lat,geo[0].lng],13)}catch(e){}},[trip.places,ready]);
useEffect(()=>{if(!mapRef.current||!window.L)return;if(clickMkRef.current){try{mapRef.current.removeLayer(clickMkRef.current)}catch(e){};clickMkRef.current=null}if(!clickPos)return;clickMkRef.current=window.L.marker([clickPos.lat,clickPos.lng],{icon:window.L.divIcon({className:"",iconSize:[0,0],html:`<div style="width:22px;height:22px;border-radius:50%;background:#8E1F16;border:3px solid #fff;box-shadow:0 2px 10px rgba(239,68,68,.5);transform:translate(-11px,-11px)"></div>`})}).addTo(mapRef.current)},[clickPos]);
const updateLocMarker=(la,lo,hdg)=>{if(!mapRef.current||!window.L)return;if(myLocRef.current){try{mapRef.current.removeLayer(myLocRef.current)}catch(e){}}const arrowHtml=hdg!=null?`<div style="position:absolute;top:-16px;left:50%;transform:translateX(-50%) rotate(${hdg}deg);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:16px solid #3b82f6;filter:drop-shadow(0 1px 3px rgba(0,0,0,.4))"></div>`:"";myLocRef.current=window.L.marker([la,lo],{icon:window.L.divIcon({className:"",iconSize:[0,0],html:`<div style="position:relative;width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 8px rgba(59,130,246,.2);transform:translate(-10px,-10px)">${arrowHtml}</div>`})}).bindPopup("📍 Twoja lokalizacja").addTo(mapRef.current)};const goToMyLoc=async()=>{setGpsError("");if(!navigator.geolocation){setGpsError("GPS niedostępny w tej przeglądarce");return}if(watchRef.current){navigator.geolocation.clearWatch(watchRef.current);watchRef.current=null;if(orientHandler.current){window.removeEventListener("deviceorientation",orientHandler.current);orientHandler.current=null}if(myLocRef.current&&mapRef.current){try{mapRef.current.removeLayer(myLocRef.current)}catch(e){}}myLocRef.current=null;setTracking(false);setGpsLoading(false);return}if(navigator.permissions){try{const ps=await navigator.permissions.query({name:"geolocation"});if(ps.state==="denied"){setGpsError("GPS zablokowany. Kliknij 🔒 w pasku adresu → Lokalizacja → Zezwól, potem odśwież.");return}}catch(e){}}setGpsLoading(true);let lastLat=null,lastLon=null,lastHdg=null;orientHandler.current=e=>{const hdg=e.webkitCompassHeading!=null?e.webkitCompassHeading:(e.alpha!=null?((360-e.alpha+360)%360):null);lastHdg=hdg;if(lastLat!=null)updateLocMarker(lastLat,lastLon,hdg)};window.addEventListener("deviceorientation",orientHandler.current,{passive:true});watchRef.current=navigator.geolocation.watchPosition(pos=>{const la=pos.coords.latitude,lo=pos.coords.longitude;if(lastLat==null&&mapRef.current){try{mapRef.current.flyTo([la,lo],15,{duration:1.5})}catch(e){}}lastLat=la;lastLon=lo;const hdg=pos.coords.heading!=null&&!isNaN(pos.coords.heading)?pos.coords.heading:lastHdg;updateLocMarker(la,lo,hdg);setGpsLoading(false);setTracking(true)},err=>{setGpsLoading(false);setTracking(false);setGpsError(err.code===1?"GPS zablokowany — kliknij 🔒 w adresie → Lokalizacja → Zezwól":err.code===3?"GPS timeout — spróbuj ponownie":"Nie można ustalić pozycji");if(watchRef.current){navigator.geolocation.clearWatch(watchRef.current);watchRef.current=null}},{enableHighAccuracy:true,timeout:15000,maximumAge:3000})};const doSearch=async()=>{if(!query.trim())return;setSearching(true);setResults([]);try{const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,{headers:{"Accept-Language":"pl"}});setResults(await r.json())}catch{setResults([])}setSearching(false)};const flyTo=(lat,lng)=>{if(mapRef.current)try{mapRef.current.flyTo([lat,lng],14,{duration:1})}catch(e){}};const addFromClick=()=>{if(!clickPos||!newName.trim())return;onAddPlace({id:uid(),name:newName.trim(),description:"",priority:"medium",visited:false,lat:clickPos.lat,lng:clickPos.lng});setClickPos(null);setNewName("")};
if(!ready)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:400,color:"#8A837C"}}><div style={{textAlign:"center"}}><div style={{fontSize:48,marginBottom:8}}>🗺️</div>Ładowanie mapy...</div></div>;const geoCount=trip.places.filter(p=>p.lat).length;
return(<div style={{position:"relative"}}><div style={ms.sw}><div style={ms.sr}><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()} placeholder="🔍 Szukaj miejsca..." style={ms.si}/><button onClick={doSearch} disabled={searching} style={ms.sb}>{searching?"⏳":"Szukaj"}</button></div>{results.length>0&&<div style={ms.dd}>{results.map((r,i)=>(<div key={i} style={ms.di}><div onClick={()=>{flyTo(+r.lat,+r.lon);setResults([]);setQuery(r.display_name.split(",")[0])}} style={{flex:1,cursor:"pointer"}}><div style={{fontWeight:600,fontSize:14}}>{r.display_name.split(",")[0]}</div><div style={{fontSize:12,color:"#8A837C",marginTop:2}}>{r.display_name.slice(0,90)}</div></div><button onClick={()=>{onAddPlace({id:uid(),name:r.display_name.split(",")[0],description:r.display_name.split(",").slice(1,3).join(",").trim(),priority:"medium",visited:false,lat:+r.lat,lng:+r.lon});flyTo(+r.lat,+r.lon);setResults([]);setQuery("")}} style={ms.da}>+ Dodaj</button></div>))}</div>}</div>
<div ref={containerRef} style={ms.mc}/>{clickPos&&<div style={ms.cb}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:14,fontWeight:700}}>📍 Nowe miejsce</span><button onClick={()=>setClickPos(null)} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:"#8A837C"}}>✕</button></div><div style={{fontSize:11,color:"#8A837C",marginBottom:8,fontFamily:"monospace"}}>{clickPos.lat.toFixed(5)}, {clickPos.lng.toFixed(5)}</div><input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addFromClick()} placeholder="Wpisz nazwę..." style={ms.ci} autoFocus/><button onClick={addFromClick} disabled={!newName.trim()} style={{...ms.ca,opacity:newName.trim()?1:.5}}>Dodaj do listy</button></div>}
<button onClick={goToMyLoc} disabled={gpsLoading} title={tracking?"Zatrzymaj śledzenie GPS":"Włącz śledzenie GPS"} style={{position:"absolute",bottom:60,right:12,zIndex:6,background:tracking?"#eff6ff":"#fff",border:tracking?"2px solid #3b82f6":"2px solid transparent",borderRadius:12,padding:"9px 14px",cursor:gpsLoading?"default":"pointer",boxShadow:"0 2px 12px rgba(0,0,0,.18)",fontSize:13,fontWeight:700,color:gpsLoading?"#8A837C":tracking?"#1d4ed8":"#3b82f6",display:"flex",alignItems:"center",gap:5,minWidth:130,justifyContent:"center"}}>{gpsLoading?"⏳ Szukam...":tracking?"🔵 GPS aktywny":"📍 Tu jestem"}</button>{gpsError&&<div style={{position:"absolute",bottom:110,right:12,zIndex:6,background:"#F6ECEA",border:"1px solid #E0C9C5",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#8E1F16",fontWeight:600,maxWidth:240,lineHeight:1.5}}>{gpsError}</div>}<div style={ms.lg}>{[["#8E1F16","Wysoki"],["#f59e0b","Średni"],["#3F6B4A","Niski"],["#8A837C","✓"]].map(([c,l])=><div key={l} style={ms.li}><div style={{...ms.ld,background:c}}/>{l}</div>)}</div><div style={ms.ct}>📍 {geoCount}/{trip.places.length}</div>{geoCount===0&&<div style={ms.ht}>Kliknij na mapę lub szukaj</div>}</div>)}

function MiniMap({trip}){const ref=useRef(null);const mapInst=useRef(null);const[mapReady,setMapReady]=useState(false);useEffect(()=>{if(window.L)setMapReady(true);else{const c=setInterval(()=>{if(window.L){setMapReady(true);clearInterval(c)}},200);return()=>clearInterval(c)}},[]);useEffect(()=>{if(!mapReady||!ref.current||mapInst.current)return;const geo=trip.places.filter(p=>p.lat&&p.lng);if(!geo.length)return;try{const L=window.L;const map=L.map(ref.current,{zoomControl:false,attributionControl:false,dragging:false,scrollWheelZoom:false,touchZoom:false,doubleClickZoom:false});L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",{maxZoom:19}).addTo(map);geo.forEach(p=>L.marker([p.lat,p.lng],{icon:L.divIcon({className:"",iconSize:[0,0],html:`<div style="width:12px;height:12px;border-radius:50%;background:${PRI_COLORS[p.priority]||"#8E1F16"};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3);transform:translate(-6px,-6px)"></div>`})}).addTo(map));if(geo.length>1)map.fitBounds(L.latLngBounds(geo.map(p=>[p.lat,p.lng])).pad(.3));else map.setView([geo[0].lat,geo[0].lng],12);mapInst.current=map}catch(e){}return()=>{if(mapInst.current){try{mapInst.current.remove()}catch(e){}}mapInst.current=null}},[mapReady,trip.places]);return<div ref={ref} style={{width:"100%",height:"100%"}}/>}

/* ═══ PDF ═══ */
function exportPDF(trip){const days=trip.startDate&&trip.endDate?Math.ceil((new Date(trip.endDate)-new Date(trip.startDate))/864e5)+1:0;const spent=trip.expenses.reduce((s,e)=>s+e.amount,0);const byCat=CATEGORIES.map(c=>({c,t:trip.expenses.filter(e=>e.category===c).reduce((s,e)=>s+e.amount,0)})).filter(x=>x.t>0);
const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${trip.name}</title><style>body{font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:24px;color:#111111;font-size:13px}h1{font-size:24px}h2{font-size:16px;margin-top:24px;border-bottom:2px solid #8E1F16;padding-bottom:4px;color:#8E1F16}table{width:100%;border-collapse:collapse;margin:8px 0}th,td{border:1px solid #E2DFD9;padding:8px;text-align:left;font-size:12px}th{background:#F4F2ED}@media print{body{padding:12px}}</style></head><body><h1>${trip.coverEmoji} ${trip.name}</h1><div style="color:#8A837C;margin-bottom:20px">${trip.destination||""}${trip.startDate?` • ${trip.startDate} → ${trip.endDate}`:""}</div>${trip.places.length?`<h2>📍 Miejsca</h2><table><tr><th>Nazwa</th><th>Priorytet</th><th>Status</th></tr>${trip.places.map(p=>`<tr><td>${p.name}</td><td>${p.priority}</td><td>${p.visited?"✅":"⬜"}</td></tr>`).join("")}</table>`:""}${trip.itinerary.length?`<h2>🗓️ Plan dnia</h2>${trip.itinerary.map(d=>`<h3>${d.day}${d.title?" — "+d.title:""}</h3><table>${d.items.filter(i=>i.activity).map(i=>`<tr><td>${i.time}</td><td>${i.activity}</td></tr>`).join("")}</table>`).join("")}`:""}${byCat.length?`<h2>💰 Budżet (${spent.toFixed(2)} ${trip.currency})</h2><table>${byCat.map(({c,t})=>`<tr><td>${c}</td><td>${t.toFixed(2)}</td><td>${(t/spent*100).toFixed(0)}%</td></tr>`).join("")}</table>`:""}${trip.packing&&trip.packing.length?`<h2>🎒 Pakowanie</h2><table>${trip.packing.map(p=>`<tr><td>${p.name}</td><td>${p.packed?"✅":"⬜"}</td></tr>`).join("")}</table>`:""}${trip.notes.length?`<h2>📝 Notatki</h2>${trip.notes.map(n=>`<div style="margin:12px 0;padding:12px;background:#F4F2ED;border-radius:8px"><strong>${n.title}</strong><p>${n.content}</p></div>`).join("")}`:""}<div style="margin-top:32px;text-align:center;color:#8A837C;font-size:11px">🧭 Voyager</div></body></html>`;
const w=window.open("","_blank");if(w){w.document.write(html);w.document.close();setTimeout(()=>w.print(),500)}else{const blob=new Blob([html],{type:"text/html;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=(trip.name||"voyager")+".html";document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(()=>URL.revokeObjectURL(url),1000)}}

const distKm=(la1,lo1,la2,lo2)=>{const R=6371,dL=(la2-la1)*Math.PI/180,dO=(lo2-lo1)*Math.PI/180,a=Math.sin(dL/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dO/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))};
/* ═══ AI CHAT (GEMINI) ═══ */
function AIChat({trip,onClose,onAddPlaces,onUpdatePlace,onAddToItinerary}){const dark=useContext(DarkCtx);const s=dark?sDark:sL;const[msgs,setMsgs]=useState([{role:"assistant",text:`Cześć! 🌍 Jestem asystentem podróży${trip?.destination?` do ${trip.destination}`:""}.\n\nMogę pomóc z:\n🏛️ Ciekawostki i atrakcje\n🍽️ Restauracje i jedzenie\n🗓️ Plan dnia\n💡 Porady\n\nO co chcesz zapytać?`}]);const[input,setInput]=useState("");const[loading,setLoading]=useState(false);const[apiKey,setApiKey]=useState(()=>loadApiKey());const[showSetup,setShowSetup]=useState(()=>!loadApiKey());const[saved,setSaved]=useState({});const endRef=useRef(null);const[panelH,setPanelH]=useState("85vh");useEffect(()=>{const upd=()=>{const vp=window.visualViewport;if(!vp)return;const maxH=window.innerHeight*0.85;setPanelH(Math.min(maxH,vp.height-20)+"px")};window.visualViewport?.addEventListener("resize",upd);upd();return()=>window.visualViewport?.removeEventListener("resize",upd)},[]);
const stripEmoji=s=>s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/gu,"").replace(/[✀-➿]/g,"").trim();const addAsPlace=(text,idx)=>{const lines=text.split("\n").filter(l=>l.trim()&&l.length>4);const places=[];lines.forEach(l=>{let cleaned=l.replace(/^[\d\.\)\-\*•►▸]+\s*/,"").replace(/\*\*/g,"").trim();if(!cleaned||cleaned.length<3)return;if(/^(oto |tutaj |polecam|mogę |cześć|plan |podsumow|oczywiście|jasne|chętnie|kontekst|poniżej|oto lista|lista)/i.test(cleaned))return;const emojiClean=stripEmoji(cleaned);if(emojiClean.length<2)return;let name,desc;const dashMatch=cleaned.match(/^(.+?)\s*[—–\-:]\s*(.+)/);if(dashMatch){name=stripEmoji(dashMatch[1]);desc=dashMatch[2].trim()}else{name=emojiClean.slice(0,60);desc=""}name=name.replace(/^[,.\s]+|[,.\s]+$/g,"").trim();if(name.length<2||name.length>70)return;places.push({id:uid(),name,description:desc.slice(0,250)||"",address:"",priority:"medium",visited:false,lat:null,lng:null})});if(places.length===0){const first=lines[0]||text.slice(0,60);places.push({id:uid(),name:stripEmoji(first).slice(0,60)||"Miejsce z AI",description:"",address:"",priority:"medium",visited:false,lat:null,lng:null})}onAddPlaces(places);setSaved(p=>({...p,[`p${idx}`]:true}));geocodePlaces(places)};const geoSearch=async(query,lat,lng)=>{let url=`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=3&addressdetails=1${trip?.destCC?`&countrycodes=${trip.destCC}`:""}`;if(lat&&lng){const vb=`${lng-2},${lat+2},${lng+2},${lat-2}`;url+=`&viewbox=${vb}&bounded=1`}const r=await fetch(url,{headers:{"Accept-Language":"pl"}});return await r.json()};const geocodePlaces=async(places)=>{const dest=trip?.destination||"";const dlat=trip?.destLat;const dlng=trip?.destLng;for(let i=0;i<places.length;i++){const p=places[i];const cleanName=p.name.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu,"").replace(/["""„()]/g,"").replace(/\s+/g," ").trim();if(!cleanName||cleanName.length<2)continue;try{let found=false;const searches=[{q:`${cleanName}, ${dest}`,useBounds:true},{q:cleanName,useBounds:true},{q:`${cleanName}, ${dest}`,useBounds:false}];for(const s of searches){if(found)break;const d=await geoSearch(s.q,s.useBounds?dlat:null,s.useBounds?dlng:null);if(d&&d[0]){if(dlat&&dlng&&distKm(dlat,dlng,+d[0].lat,+d[0].lon)>400)continue;onUpdatePlace(p.id,+d[0].lat,+d[0].lon,d[0].display_name||"");found=true;break}if(!found)await new Promise(ok=>setTimeout(ok,700))}}catch{}await new Promise(ok=>setTimeout(ok,300))}};
const addAsItinerary=(text,idx)=>{const lines=text.split("\n").filter(l=>l.trim()&&l.length>3);const items=lines.slice(0,8).map((l,i)=>{const timeMatch=l.match(/(\d{1,2})[:.:](\d{2})/);const time=timeMatch?timeMatch[1].padStart(2,"0")+":"+timeMatch[2]:String(8+i).padStart(2,"0")+":00";const activity=l.replace(/^\s*\d{1,2}[:.]\d{2}\s*[-–:.]\s*/,"").replace(/^[\-\*\•\d\.\)]\s*/,"").trim();return{time,activity:activity||l.trim()}});const day=trip.startDate||new Date().toISOString().split("T")[0];onAddToItinerary({id:uid(),day,title:"Plan z AI",items:items.filter(i=>i.activity)});setSaved(p=>({...p,[`i${idx}`]:true}))};
useEffect(()=>{if(endRef.current)endRef.current.scrollIntoView({behavior:"smooth"})},[msgs]);
const send=async()=>{if(!input.trim()||loading)return;if(!apiKey){setShowSetup(true);return}const txt=input.trim();setInput("");setMsgs(m=>[...m,{role:"user",text:txt}]);setLoading(true);
try{const days2=trip?.startDate&&trip?.endDate?Math.ceil((new Date(trip.endDate)-new Date(trip.startDate))/864e5)+1:0;const ctx=trip?`[Kontekst podróży] Cel: ${trip.destination||"?"} | Daty: ${trip.startDate||"?"}–${trip.endDate||"?"} (${days2||"?"} dni) | Waluta: ${trip.currency}${trip.places.length?` | Dodane miejsca: ${trip.places.map(p=>p.name).join(", ")}`:""}.`:"";
const history=msgs.filter(m=>m.text).map(m=>({role:m.role==="assistant"?"assistant":"user",content:m.text}));
const res=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`},body:JSON.stringify({model:"llama-3.3-70b-versatile",messages:[{role:"system",content:`Jesteś ekspertem od podróży, odpowiadasz WYŁĄCZNIE po polsku. Zasady formatowania:\n1. Lista miejsc/atrakcji: każde w OSOBNEJ LINII w formacie "Oficjalna nazwa — opis (cena lub godziny)"\n2. Plan dnia: każda linia "HH:MM — aktywność"\n3. Używaj wyłącznie OFICJALNYCH nazw geograficznych (np. "Colosseum", "Marienplatz", "Sagrada Família")\n4. Odpowiedź max 10 pozycji, bez wstępów i podsumowań\n5. Dodawaj emoji przed każdą pozycją\n6. Przy miejscach podaj praktyczną informację (cena biletu, godz. otwarcia, adres)\n${ctx}`},...history,{role:"user",content:txt}],temperature:0.7,max_tokens:1200})});
const data=await res.json();const reply=data.choices?.[0]?.message?.content;
if(reply)setMsgs(m=>[...m,{role:"assistant",text:reply}]);else setMsgs(m=>[...m,{role:"assistant",text:"⚠️ Sprawdź klucz API."}])}catch(e){setMsgs(m=>[...m,{role:"assistant",text:"⚠️ Błąd: "+e.message}])}setLoading(false)};
const quickQ=[`Co warto zobaczyć w ${trip?.destination||"okolicy"}?`,`Najlepsze restauracje w ${trip?.destination||"okolicy"}`,`Ciekawostki o ${trip?.destination||"tym miejscu"}`,`Plan na 1 dzień w ${trip?.destination||"okolicy"}`];
return(<div style={s.aiO}><div style={{...s.aiP,height:panelH}}><div style={s.aiH}><span style={{fontSize:18}}>🤖 Asystent AI</span><button onClick={onClose} style={s.clB}>✕</button></div>
{showSetup&&<div style={{padding:16,background:"#F4F2ED",borderBottom:"1px solid #E2DFD9"}}><p style={{fontSize:13,color:"#2B2825",marginBottom:8}}>🔑 Podaj klucz Groq API (darmowy):</p><a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{fontSize:12,color:"#3b82f6",fontWeight:600}}>→ Pobierz klucz na console.groq.com</a><div style={{display:"flex",gap:6,marginTop:8}}><input value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="gsk_..." style={{...s.aiI,flex:1}}/><button onClick={()=>{saveApiKey(apiKey);setShowSetup(false)}} style={{background:"#8E1F16",color:"#fff",border:"none",padding:"8px 16px",borderRadius:10,cursor:"pointer",fontSize:13,fontWeight:600}}>Zapisz</button></div></div>}
<div style={s.aiM}>{msgs.map((m,i)=><div key={i} style={{maxWidth:"85%",alignSelf:m.role==="user"?"flex-end":"flex-start"}}><div style={{...s.bbl,...(m.role==="user"?s.uB:s.aB)}}><div style={{whiteSpace:"pre-wrap",lineHeight:1.6}}>{m.text}</div></div>{m.role==="assistant"&&i>0&&<div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}><button onClick={()=>addAsPlace(m.text,i)} disabled={saved[`p${i}`]} style={{background:saved[`p${i}`]?"#E8EFE7":"#F4F2ED",border:"1px solid "+(saved[`p${i}`]?"#A9C4AC":"#E2DFD9"),borderRadius:16,padding:"4px 10px",fontSize:11,color:saved[`p${i}`]?"#3F6B4A":"#8E1F16",cursor:"pointer",fontFamily:"'Work Sans',system-ui,sans-serif",fontWeight:600}}>{saved[`p${i}`]?"✅ Dodano do miejsc":"📍 Dodaj miejsca"}</button><button onClick={()=>addAsItinerary(m.text,i)} disabled={saved[`i${i}`]} style={{background:saved[`i${i}`]?"#E8EFE7":"#F4F2ED",border:"1px solid "+(saved[`i${i}`]?"#A9C4AC":"#E2DFD9"),borderRadius:16,padding:"4px 10px",fontSize:11,color:saved[`i${i}`]?"#3F6B4A":"#2B2825",cursor:"pointer",fontFamily:"'Work Sans',system-ui,sans-serif",fontWeight:600}}>{saved[`i${i}`]?"✅ Dodano do planu":"🗓️ Dodaj plan dnia"}</button></div>}</div>)}{loading&&<div style={{...s.bbl,...s.aB,color:"#8A837C"}}>✨ Myślę...</div>}{msgs.length<=1&&!loading&&<div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>{quickQ.map((q,i)=><button key={i} onClick={()=>setInput(q)} style={{background:"#F4F2ED",border:"1px solid #E2DFD9",borderRadius:20,padding:"8px 14px",fontSize:12,color:"#8E1F16",cursor:"pointer",fontFamily:"'Work Sans',system-ui,sans-serif",fontWeight:500}}>{q}</button>)}</div>}<div ref={endRef}/></div>
<div style={{...s.aiR,paddingBottom:"calc(12px + env(safe-area-inset-bottom, 0px))"}}><button onClick={()=>setShowSetup(!showSetup)} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",padding:4,opacity:.5}}>⚙️</button><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={apiKey?"Zapytaj...":"Ustaw klucz API ⚙️"} style={{...s.aiI,flex:1}}/><button onClick={send} disabled={loading} style={s.snB}>➤</button></div></div></div>)}

/* ═══════════════════════════════════════════════════════════
   ATLAS — system wizualny
   Magazyn podróżniczy: kadr, szeryfowy tytuł, gruba linia,
   wąska czerwień jako sygnał. Jedna fabryka stylów dla obu
   motywów — dzięki temu żaden kolor nie może istnieć tylko
   w jasnym wariancie.
   ═══════════════════════════════════════════════════════════ */
const SERIF = "'Fraunces',Georgia,'Times New Roman',serif";
const SANS  = "'Work Sans',system-ui,-apple-system,sans-serif";
const MONO  = "'DM Mono',ui-monospace,monospace";

const PAL_L = {paper:"#FBFBF9",paper2:"#F4F2ED",surf:"#FFFFFF",ink:"#111111",ink2:"#2B2825",muted:"#8A837C",rule:"#E2DFD9",ruleSoft:"#EDEBE5",accent:"#8E1F16",gold:"#B0873C",ok:"#3F6B4A",onCover:"#FFFFFF"};
const PAL_D = {paper:"#14120F",paper2:"#1C1916",surf:"#1C1916",ink:"#F2EFE9",ink2:"#D8D3C9",muted:"#8C857A",rule:"#2C2823",ruleSoft:"#231F1B",accent:"#D8503F",gold:"#CFA355",ok:"#6FA97C",onCover:"#FFFFFF"};

/* Okładki — kadr generowany deterministycznie z celu podróży,
   albo pierwsze zdjęcie z notatek, jeśli jakieś jest. */
const COVERS = [
  "radial-gradient(circle at 72% 26%,#F4CE86 0 7%,rgba(244,206,134,.28) 16%,transparent 42%),linear-gradient(180deg,#1E3560 0%,#4C4B79 42%,#9E6A5E 68%,#3B2C31 100%)",
  "linear-gradient(180deg,#0E3A4A 0%,#17697A 45%,#4FB0A5 76%,#CFDDD6 100%)",
  "linear-gradient(180deg,#2B3A55 0%,#5C6B8A 40%,#B9A48C 72%,#3C332C 100%)",
  "radial-gradient(circle at 30% 24%,#FFD9A0 0 7%,transparent 34%),linear-gradient(180deg,#7A4B2A 0%,#C98A4B 50%,#E8C48A 78%,#4A3520 100%)",
  "linear-gradient(180deg,#16281C 0%,#2F5237 45%,#7A9463 78%,#22301F 100%)",
  "radial-gradient(circle at 68% 20%,#FFE9A8 0 5%,transparent 30%),linear-gradient(180deg,#120E1F 0%,#2A1E44 45%,#6B3F6E 72%,#141019 100%)"
];
const coverIdx = (t) => {const k=(t.destination||t.name||"x");let h=0;for(let i=0;i<k.length;i++)h=(h*31+k.charCodeAt(i))>>>0;return h%COVERS.length};
const coverPhoto = (t) => {for(const n of (t.notes||[]))if(n.photos&&n.photos[0])return n.photos[0].data;return null};

const MONTHS = ["STY","LUT","MAR","KWI","MAJ","CZE","LIP","SIE","WRZ","PAŹ","LIS","GRU"];
const shortDate = (d) => {if(!d)return"";const x=new Date(d+"T12:00:00");return `${x.getDate()} ${MONTHS[x.getMonth()]}`};
const dateline = (t) => [t.destination?t.destination.toUpperCase():"",t.startDate?(t.endDate?`${shortDate(t.startDate)} – ${shortDate(t.endDate)}`:shortDate(t.startDate)):""].filter(Boolean).join("  ·  ");

/* Kontekst aplikacji — komponenty siedzą w zasięgu modułu
   (nie wewnątrz TravelPlanner), więc React ich nie przemontowuje
   przy każdym renderze. */
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

/* ═══ EKRAN STARTOWY ═══ */
function HomeScreen(){
  const {trips,setActive,setTab,setForm,setEdit,dark,setDarkMode,s} = useApp();
  return <div style={{...s.app,overflowY:"auto"}}>
    <div style={s.homeWrap}>
      <header style={s.masthead}>
        <div style={s.mastTop}>
          <span style={s.mastKicker}>Dziennik podróży</span>
          <button onClick={()=>setDarkMode(d=>!d)} style={s.mastToggle} aria-label="Zmień motyw">{dark?"☀":"☾"}</button>
        </div>
        <h1 style={s.mastTitle}>Voyager</h1>
        <div style={s.ruleBold}/>
      </header>

      {trips.length===0
        ? <div style={s.emptyHome}>
            <p style={s.emptyLead}>Nie masz jeszcze żadnej podróży.</p>
            <p style={s.emptyBody}>Zacznij od celu i dat — resztę zbudujesz po drodze.</p>
            <button onClick={()=>{setForm("trip");setEdit(null)}} className="vy-btn" style={s.b1}>Zaplanuj pierwszą podróż</button>
          </div>
        : <>
            <div style={s.sectionHead}>
              <h2 style={s.sectionTitle}>Wydania</h2>
              <button onClick={()=>{setForm("trip");setEdit(null)}} style={s.linkBtn}>+ Nowa podróż</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:34}}>
              {trips.map((t,i)=>{
                const days = t.startDate&&t.endDate?Math.ceil((new Date(t.endDate)-new Date(t.startDate))/864e5)+1:0;
                const spent = t.expenses.reduce((a,e)=>a+e.amount,0);
                const until = t.startDate?Math.ceil((new Date(t.startDate+"T00:00:00")-new Date())/864e5):-999;
                const photo = coverPhoto(t);
                return <article key={t.id} className="vy-card" onClick={()=>{setActive(t.id);setTab("Przegląd")}} style={{...s.coverCard,animationDelay:`${i*.08}s`}}>
                  <div style={{...s.cover,...(photo?{backgroundImage:`linear-gradient(180deg,rgba(10,8,6,.15),rgba(10,8,6,.72)),url(${photo})`,backgroundSize:"cover",backgroundPosition:"center"}:{backgroundImage:COVERS[coverIdx(t)]})}}>
                    <div style={s.coverInner}>
                      {until>0 && <span style={s.coverBadge}>za {until} dni</span>}
                      {until<=0&&until>-days && <span style={{...s.coverBadge,background:"rgba(255,255,255,.92)",color:"#1B4D2B"}}>w toku</span>}
                      <h3 style={s.coverTitle}>{t.name||"Bez nazwy"}</h3>
                    </div>
                  </div>
                  <p style={s.dateline}>{dateline(t)||"Cel nieokreślony"}</p>
                  <div style={s.ruleBold}/>
                  <div style={s.figRow}>
                    <Figure v={t.places.length} l="miejsc" s={s}/>
                    <Figure v={days||"—"} l="dni" s={s}/>
                    <Figure v={spent>0?spent.toFixed(0):"—"} l={t.currency} s={s}/>
                  </div>
                </article>
              })}
            </div>
          </>}
    </div>
  </div>;
}

function Figure({v,l,s}){
  return <div style={s.fig}><b style={s.figV}>{v}</b><span style={s.figL}>{l}</span></div>;
}

/* ═══ SPIS TREŚCI — nowa nawigacja ═══
   Zastępuje ślepą zakładkę „Więcej”. Dostępna z każdego ekranu
   jednym dotknięciem, pokazuje stan każdej sekcji. */
function ContentsSheet(){
  const {trip,tab,setTab,setShowContents,s} = useApp();
  const packing = trip.packing||[];
  const photos = trip.notes.reduce((a,n)=>a+((n.photos||[]).length),0);
  const acts = trip.itinerary.reduce((a,d)=>a+d.items.filter(i=>i.activity).length,0);
  const spent = trip.expenses.reduce((a,e)=>a+e.amount,0);
  const items = [
    ["Przegląd","Podsumowanie i pogoda"],
    ["Mapa",`${trip.places.filter(p=>p.lat).length} z ${trip.places.length} na mapie`],
    ["Miejsca",trip.places.length?`${trip.places.filter(p=>p.visited).length} z ${trip.places.length} odwiedzonych`:"nic jeszcze"],
    ["Plan dnia",acts?`${trip.itinerary.length} dni · ${acts} aktywności`:"nic jeszcze"],
    ["Budżet",spent>0?`${spent.toFixed(0)} ${trip.currency}`:"brak wydatków"],
    ["Pakowanie",packing.length?`${packing.filter(p=>p.packed).length} z ${packing.length} spakowane`:"brak listy"],
    ["Notatki",trip.notes.length?`${trip.notes.length} wpisów`:"nic jeszcze"],
    ["Galeria",photos?`${photos} zdjęć`:"brak zdjęć"],
    ["Tłumacz","5 języków"],
    ["SOS","numery alarmowe"]
  ];
  return <div style={s.sheet}>
    <div style={s.sheetInner}>
      <div style={s.sheetHead}>
        <span style={s.sheetKicker}>Spis treści</span>
        <button onClick={()=>setShowContents(false)} style={s.sheetClose} aria-label="Zamknij">✕</button>
      </div>
      <h2 style={s.sheetTitle}>{trip.name}</h2>
      <p style={s.dateline}>{dateline(trip)}</p>
      <div style={s.ruleBold}/>
      <nav style={{display:"flex",flexDirection:"column"}}>
        {items.map(([name,meta])=>(
          <button key={name} onClick={()=>{setTab(name);setShowContents(false)}} style={{...s.tocRow,...(tab===name?s.tocOn:{})}}>
            <span style={s.tocName}>{name}</span>
            <span style={s.tocLeader}/>
            <span style={s.tocMeta}>{meta}</span>
          </button>
        ))}
      </nav>
    </div>
  </div>;
}

/* ═══ PRZEGLĄD ═══ */
function OverviewTab(){
  const {trip,upTrip,setTab,setForm,setEdit,setTrips,setActive,s,dark} = useApp();
  const [confirmDel,setConfirmDel] = useState(false);
  const days = trip.startDate&&trip.endDate?Math.ceil((new Date(trip.endDate)-new Date(trip.startDate))/864e5)+1:0;
  const spent = trip.expenses.reduce((a,e)=>a+e.amount,0);
  const byCat = CATEGORIES.map(c=>({c,t:trip.expenses.filter(e=>e.category===c).reduce((a,e)=>a+e.amount,0)})).filter(x=>x.t>0).sort((a,b)=>b.t-a.t);
  const packing = trip.packing||[];
  const packed = packing.filter(p=>p.packed).length;
  const until = trip.startDate?Math.ceil((new Date(trip.startDate+"T00:00:00")-new Date())/864e5):-999;
  const photo = coverPhoto(trip);

  const notes = [];
  if(until>0&&until<=7) notes.push(`Wyjazd za ${until} dni — sprawdź, czy wszystko gotowe.`);
  if(until>0&&until<=3&&packing.length>packed) notes.push(`Do spakowania zostało ${packing.length-packed} rzeczy.`);
  if(until===1) notes.push("Jutro wyjazd. Dokumenty i bilety pod ręką?");
  if(until===0) notes.push("Dziś wyjeżdżasz. Dobrej podróży.");
  if(trip.places.length>0&&trip.itinerary.length===0&&until>0&&until<=14) notes.push("Masz miejsca, ale nie masz jeszcze planu dnia.");

  const today = new Date().toISOString().split("T")[0];
  const todayPlan = trip.itinerary.find(d=>d.day===today);

  return <div style={s.tc}>
    <div style={{...s.cover,height:200,marginBottom:16,...(photo?{backgroundImage:`linear-gradient(180deg,rgba(10,8,6,.12),rgba(10,8,6,.7)),url(${photo})`,backgroundSize:"cover",backgroundPosition:"center"}:{backgroundImage:COVERS[coverIdx(trip)]})}}>
      <div style={s.coverInner}>
        <span style={s.coverKicker}>{trip.destination||"Podróż"}</span>
        <h2 style={{...s.coverTitle,fontSize:38}}>{trip.name}</h2>
      </div>
    </div>

    <Countdown startDate={trip.startDate} endDate={trip.endDate}/>

    <p style={s.dateline}>{dateline(trip)}{days>0?`  ·  ${days} DNI`:""}</p>
    <div style={s.ruleBold}/>
    <div style={s.figRow}>
      <Figure v={trip.places.length} l="miejsc" s={s}/>
      <Figure v={trip.itinerary.length||"—"} l="dni planu" s={s}/>
      <Figure v={spent>0?spent.toFixed(0):"—"} l={trip.currency} s={s}/>
    </div>

    {notes.length>0 && <section style={s.sec}>
      <h3 style={s.secTtl}>Na marginesie</h3>
      {notes.map((n,i)=><p key={i} style={s.marginNote}>{n}</p>)}
    </section>}

    {todayPlan && <section style={s.sec}>
      <h3 style={s.secTtl}>Dziś w planie</h3>
      {todayPlan.items.filter(i=>i.activity).map((it,i)=>(
        <div key={i} style={s.row}><span style={s.time}>{it.time}</span><span style={s.rowTxt}>{it.activity}</span></div>
      ))}
    </section>}

    <WeatherWidget lat={trip.destLat} lng={trip.destLng} destination={trip.destination}
      onGeocode={(lat,lng,cc)=>upTrip({destLat:lat,destLng:lng,...(cc?{destCC:cc}:{})})}/>

    <DestinationDiscovery destination={trip.destination} lat={trip.destLat} lng={trip.destLng}
      onAddPlace={p=>upTrip({places:[...trip.places,p]})}/>

    {trip.places.some(p=>p.lat!=null) && <section style={s.sec}>
      <h3 style={s.secTtl}>Na mapie</h3>
      <div onClick={()=>setTab("Mapa")} style={s.miniMapBox}><MiniMap trip={trip}/></div>
      <p style={s.caption}>{trip.places.filter(p=>p.lat!=null).length} z {trip.places.length} miejsc ma współrzędne</p>
    </section>}

    {byCat.length>0 && <section style={s.sec}>
      <h3 style={s.secTtl}>Wydatki</h3>
      {byCat.map(({c,t})=>(
        <div key={c} style={s.barRow}>
          <span style={s.barLabel}>{c}</span>
          <div style={s.barTrack}><div style={{...s.barFill,width:`${(t/spent)*100}%`,background:CAT_COLORS[c]}}/></div>
          <span style={s.barVal}>{t.toFixed(0)}</span>
        </div>
      ))}
      {days>0 && <p style={s.caption}>Średnio {(spent/days).toFixed(0)} {trip.currency} na dzień</p>}
    </section>}

    {packing.length>0 && <section style={s.sec}>
      <h3 style={s.secTtl}>Pakowanie</h3>
      <div style={s.barRow}>
        <span style={s.barLabel}>Spakowane</span>
        <div style={s.barTrack}><div style={{...s.barFill,width:`${(packed/packing.length*100)}%`,background:packed===packing.length?s.__ok:s.__accent}}/></div>
        <span style={s.barVal}>{packed}/{packing.length}</span>
      </div>
    </section>}

    <div style={s.actionRow}>
      <button onClick={()=>{setEdit(trip);setForm("trip")}} className="vy-btn" style={s.bO}>Edytuj podróż</button>
      <button onClick={()=>exportPDF(trip)} className="vy-btn" style={s.bO}>Eksport PDF</button>
      {!confirmDel
        ? <button onClick={()=>setConfirmDel(true)} style={{...s.bO,color:s.__accent,borderColor:s.__accent}}>Usuń</button>
        : <button onClick={()=>{setTrips(p=>p.filter(t=>t.id!==trip.id));setActive(null)}} onBlur={()=>setTimeout(()=>setConfirmDel(false),200)} style={{...s.bO,background:s.__accent,color:"#fff",borderColor:s.__accent}}>Na pewno usunąć?</button>}
    </div>
  </div>;
}

/* ═══ MAPA ═══ */
function MapTab(){
  const {trip,upTrip} = useApp();
  return <TripMap trip={trip} onAddPlace={p=>upTrip({places:[...trip.places,p]})}/>;
}

/* ═══ MIEJSCA ═══ */
function PlacesTab(){
  const {trip,upTrip,setTrips,setForm,setEdit,s} = useApp();
  const [busy,setBusy] = useState({});
  const [failed,setFailed] = useState({});

  /* Uzupełnia kod kraju dla podróży założonych, zanim pole
     destCC istniało — bez niego filtr countrycodes nie działa. */
  const ensureCC = async () => {
    if(trip.destCC||!trip.destination) return trip.destCC||"";
    try{
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(trip.destination)}`,{headers:{"Accept-Language":"pl"}});
      const d = await r.json();
      const cc = d[0]?.address?.country_code||"";
      if(cc) setTrips(p=>p.map(t=>t.id===trip.id?{...t,destCC:cc,destLat:t.destLat??+d[0].lat,destLng:t.destLng??+d[0].lon}:t));
      return cc;
    }catch{return ""}
  };

  const geocodeOne = async (p) => {
    const dest=trip.destination||"", dlat=trip.destLat, dlng=trip.destLng;
    const cc = await ensureCC();
    setBusy(g=>({...g,[p.id]:true}));
    setFailed(e=>{const n={...e};delete n[p.id];return n});
    const clean = p.name.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu,"").replace(/["""„()]/g,"").replace(/\s+/g," ").trim();
    const queries = [{q:`${clean}, ${dest}`,bounded:true},{q:clean,bounded:true},{q:`${clean}, ${dest}`,bounded:false}];
    let found = false;
    for(const item of queries){
      if(found) break;
      try{
        let url = `https://nominatim.openstreetmap.org/search?format=json&limit=3&addressdetails=1&q=${encodeURIComponent(item.q)}${cc?`&countrycodes=${cc}`:""}`;
        if(item.bounded&&dlat!=null&&dlng!=null) url += `&viewbox=${dlng-2},${dlat+2},${dlng+2},${dlat-2}&bounded=1`;
        const r = await fetch(url,{headers:{"Accept-Language":"pl"}});
        const d = await r.json();
        if(d&&d[0]&&!(dlat!=null&&dlng!=null&&distKm(dlat,dlng,+d[0].lat,+d[0].lon)>400)){
          setTrips(prev=>prev.map(t=>t.id===trip.id?{...t,places:t.places.map(x=>x.id===p.id?{...x,lat:+d[0].lat,lng:+d[0].lon,address:d[0].display_name||""}:x)}:t));
          found = true;
        }
      }catch{}
      if(!found) await new Promise(ok=>setTimeout(ok,900));
    }
    setBusy(g=>{const n={...g};delete n[p.id];return n});
    if(!found) setFailed(e=>({...e,[p.id]:true}));
  };

  const geocodeAll = async () => {
    for(const p of trip.places.filter(x=>x.lat==null)){ await geocodeOne(p); await new Promise(ok=>setTimeout(ok,400)) }
  };
  const missing = trip.places.filter(p=>p.lat==null).length;

  return <div style={s.tc}>
    <h2 style={s.pageTitle}>Miejsca</h2>
    <div style={s.ruleBold}/>
    <div style={s.actionRow}>
      <button onClick={()=>{setForm("place");setEdit(null)}} className="vy-btn" style={s.b1}>+ Dodaj miejsce</button>
    </div>
    {missing>0 && <button onClick={geocodeAll} style={s.ghostBtn}>Znajdź współrzędne dla {missing} {missing===1?"miejsca":"miejsc"}</button>}

    {!trip.places.length
      ? <p style={s.emptyBody}>Lista jest pusta. Dodaj miejsce ręcznie, wskaż je na mapie albo poproś asystenta AI o propozycje.</p>
      : <div>{trip.places.map(p=>(
          <article key={p.id} style={s.placeRow}>
            <button onClick={()=>upTrip({places:trip.places.map(x=>x.id===p.id?{...x,visited:!x.visited}:x)})} style={{...s.chk,...(p.visited?s.chkOn:{})}} aria-label="Odwiedzone">{p.visited?"✓":""}</button>
            <div style={{flex:1,minWidth:0}}>
              <h3 style={{...s.placeName,...(p.visited?{opacity:.45,textDecoration:"line-through"}:{})}}>{p.name}</h3>
              {p.description && <p style={s.placeDesc}>{p.description}</p>}
              {p.address && <p style={s.caption}>{p.address.split(",").slice(0,3).join(", ")}</p>}
              <div style={s.chipRow}>
                <span style={{...s.chip,color:s.pri[p.priority],borderColor:s.pri[p.priority]}}>
                  {p.priority==="high"?"wysoki":p.priority==="medium"?"średni":"niski"}
                </span>
                {p.lat!=null
                  ? <>
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`} target="_blank" rel="noreferrer" style={s.chipLink}>Nawiguj</a>
                      <button onClick={()=>navigator.clipboard?.writeText(`${p.lat.toFixed(6)},${p.lng.toFixed(6)}`)} style={s.chipBtn}>Kopiuj GPS</button>
                    </>
                  : <button onClick={()=>!busy[p.id]&&geocodeOne(p)} style={{...s.chipBtn,color:failed[p.id]?s.__accent:s.__ink2}}>
                      {busy[p.id]?"Szukam…":failed[p.id]?"Nie znaleziono — spróbuj ponownie":"Znajdź GPS"}
                    </button>}
              </div>
              {p.lat!=null && <p style={s.coords}>{p.lat.toFixed(5)}, {p.lng.toFixed(5)}</p>}
            </div>
            <div style={s.acts}>
              <button onClick={()=>{setEdit(p);setForm("place")}} style={s.iB} aria-label="Edytuj">✎</button>
              <button onClick={()=>upTrip({places:trip.places.filter(x=>x.id!==p.id)})} style={s.iB} aria-label="Usuń">✕</button>
            </div>
          </article>
        ))}</div>}
  </div>;
}

/* ═══ PLAN DNIA ═══ */
function ItineraryTab(){
  const {trip,upTrip,setForm,setEdit,s} = useApp();
  return <div style={s.tc}>
    <h2 style={s.pageTitle}>Plan dnia</h2>
    <div style={s.ruleBold}/>
    <div style={s.actionRow}><button onClick={()=>{setForm("itin");setEdit(null)}} className="vy-btn" style={s.b1}>+ Dodaj dzień</button></div>
    {!trip.itinerary.length
      ? <p style={s.emptyBody}>Nie masz jeszcze rozpisanego żadnego dnia.</p>
      : trip.itinerary.map(d=>(
          <section key={d.id} style={s.daySection}>
            <div style={s.dayHead}>
              <div>
                <h3 style={s.dayTitle}>{new Date(d.day+"T12:00:00").toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"long"})}</h3>
                {d.title && <p style={s.caption}>{d.title}</p>}
              </div>
              <div style={s.acts}>
                <button onClick={()=>{setEdit(d);setForm("itin")}} style={s.iB} aria-label="Edytuj">✎</button>
                <button onClick={()=>upTrip({itinerary:trip.itinerary.filter(x=>x.id!==d.id)})} style={s.iB} aria-label="Usuń">✕</button>
              </div>
            </div>
            {d.items.filter(i=>i.activity).map((it,i)=>(
              <div key={i} style={s.row}><span style={s.time}>{it.time}</span><span style={s.rowTxt}>{it.activity}</span></div>
            ))}
          </section>
        ))}
  </div>;
}

/* ═══ BUDŻET ═══ */
function BudgetTab(){
  const {trip,upTrip,setForm,setEdit,s} = useApp();
  const spent = trip.expenses.reduce((a,e)=>a+e.amount,0);
  const days = trip.startDate&&trip.endDate?Math.ceil((new Date(trip.endDate)-new Date(trip.startDate))/864e5)+1:0;
  return <div style={s.tc}>
    <h2 style={s.pageTitle}>Budżet</h2>
    <div style={s.ruleBold}/>
    <div style={s.bigFigure}>
      <b style={s.bigFigureV}>{spent.toFixed(2)}</b>
      <span style={s.bigFigureU}>{trip.currency}</span>
    </div>
    <p style={s.caption}>{days>0?`Około ${(spent/days).toFixed(0)} ${trip.currency} na dzień · ${trip.expenses.length} wpisów`:`${trip.expenses.length} wpisów`}</p>
    <CurrencyConverter baseCurrency={trip.currency}/>
    <div style={s.actionRow}><button onClick={()=>{setForm("expense");setEdit(null)}} className="vy-btn" style={s.b1}>+ Dodaj wydatek</button></div>
    {!trip.expenses.length
      ? <p style={s.emptyBody}>Brak wydatków.</p>
      : [...trip.expenses].sort((a,b)=>b.date.localeCompare(a.date)).map(e=>(
          <article key={e.id} style={s.expRow}>
            <div style={{...s.catDot,background:CAT_COLORS[e.category]}}>{CAT_ICONS[e.category]}</div>
            <div style={{flex:1,minWidth:0}}>
              <h3 style={s.placeName}>{e.name}</h3>
              <p style={s.caption}>{e.category} · {e.date}</p>
            </div>
            <span style={s.amount}>{e.amount.toFixed(2)}</span>
            <div style={s.acts}>
              <button onClick={()=>{setEdit(e);setForm("expense")}} style={s.iB} aria-label="Edytuj">✎</button>
              <button onClick={()=>upTrip({expenses:trip.expenses.filter(x=>x.id!==e.id)})} style={s.iB} aria-label="Usuń">✕</button>
            </div>
          </article>
        ))}
  </div>;
}

/* ═══ PAKOWANIE ═══ */
function PackingTab(){
  const {trip,upTrip,s} = useApp();
  const [input,setInput] = useState("");
  const [confirmClear,setConfirmClear] = useState(false);
  const packing = trip.packing||[];
  const packed = packing.filter(p=>p.packed).length;
  const add = () => {if(input.trim()){upTrip({packing:[...packing,{id:uid(),name:input.trim(),category:"Inne",packed:false}]});setInput("")}};

  return <div style={s.tc}>
    <h2 style={s.pageTitle}>Pakowanie</h2>
    <div style={s.ruleBold}/>
    {packing.length===0
      ? <>
          <p style={s.emptyBody}>Zacznij od gotowego szablonu albo zbuduj listę od zera.</p>
          <div style={s.actionRow}>
            <button onClick={()=>{const items=[];Object.entries(PACK_TEMPLATES).forEach(([cat,things])=>things.forEach(name=>items.push({id:uid(),name,category:cat,packed:false})));upTrip({packing:items})}} className="vy-btn" style={s.b1}>Załaduj szablon</button>
          </div>
          <button onClick={()=>upTrip({packing:[{id:uid(),name:"",category:"Inne",packed:false}]})} style={s.ghostBtn}>Pusta lista</button>
        </>
      : <>
          <div style={s.bigFigure}><b style={s.bigFigureV}>{packed}</b><span style={s.bigFigureU}>z {packing.length}</span></div>
          <div style={s.barTrack}><div style={{...s.barFill,width:`${packed/packing.length*100}%`,background:packed===packing.length?s.__ok:s.__accent}}/></div>

          {Object.keys(PACK_TEMPLATES).map(cat=>{
            const items = packing.filter(p=>p.category===cat);
            if(!items.length) return null;
            const done = items.filter(i=>i.packed).length;
            const all = done===items.length;
            return <section key={cat} style={s.sec}>
              <div style={s.packHead}>
                <h3 style={s.secTtl}>{cat} <span style={s.packCount}>{done}/{items.length}</span></h3>
                <button onClick={()=>upTrip({packing:packing.map(p=>p.category===cat?{...p,packed:!all}:p)})} style={s.linkBtn}>{all?"Odznacz":"Zaznacz"}</button>
              </div>
              {items.map(item=>(
                <div key={item.id} style={s.packRow}>
                  <button onClick={()=>upTrip({packing:packing.map(p=>p.id===item.id?{...p,packed:!p.packed}:p)})} style={{...s.chk,...(item.packed?s.chkOn:{})}} aria-label="Spakowane">{item.packed?"✓":""}</button>
                  <span style={{...s.rowTxt,...(item.packed?{opacity:.45,textDecoration:"line-through"}:{})}}>{item.name}</span>
                  <button onClick={()=>upTrip({packing:packing.filter(p=>p.id!==item.id)})} style={s.iB} aria-label="Usuń">✕</button>
                </div>
              ))}
            </section>;
          })}

          <div style={s.addRow}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Dodaj rzecz…" style={{...s.inp,marginBottom:0,flex:1}}/>
            <button onClick={add} disabled={!input.trim()} style={{...s.b1,width:"auto",padding:"13px 20px",opacity:input.trim()?1:.4}}>Dodaj</button>
          </div>
          {!confirmClear
            ? <button onClick={()=>setConfirmClear(true)} style={{...s.ghostBtn,color:s.__accent,borderColor:s.__accent}}>Wyczyść listę</button>
            : <button onClick={()=>{upTrip({packing:[]});setConfirmClear(false)}} onBlur={()=>setTimeout(()=>setConfirmClear(false),200)} style={{...s.ghostBtn,background:s.__accent,color:"#fff",borderColor:s.__accent}}>Na pewno wyczyścić?</button>}
        </>}
  </div>;
}

/* ═══ NOTATKI ═══ */
function NotesTab(){
  const {trip,upTrip,setForm,setEdit,s} = useApp();
  return <div style={s.tc}>
    <h2 style={s.pageTitle}>Notatki</h2>
    <div style={s.ruleBold}/>
    <div style={s.actionRow}><button onClick={()=>{setForm("note");setEdit(null)}} className="vy-btn" style={s.b1}>+ Dodaj notatkę</button></div>
    {!trip.notes.length
      ? <p style={s.emptyBody}>Jeszcze nic tu nie zapisałeś.</p>
      : trip.notes.map(n=>(
          <article key={n.id} style={s.noteArticle}>
            {n.photos&&n.photos.length>0 && <div style={s.notePhotos}>
              {n.photos.map((p,i)=><img key={i} src={p.data} alt="" style={{...s.notePhoto,width:n.photos.length===1?"100%":220}}/>)}
            </div>}
            <h3 style={s.noteTitle}>{n.title}</h3>
            <p style={s.noteBody}>{n.content}</p>
            <div style={s.noteFoot}>
              <span style={s.caption}>{n.date}{n.photos?.length?` · ${n.photos.length} zdjęć`:""}</span>
              <div style={s.acts}>
                <button onClick={()=>{setEdit(n);setForm("note")}} style={s.iB} aria-label="Edytuj">✎</button>
                <button onClick={()=>upTrip({notes:trip.notes.filter(x=>x.id!==n.id)})} style={s.iB} aria-label="Usuń">✕</button>
              </div>
            </div>
          </article>
        ))}
  </div>;
}

/* ═══ GALERIA ═══ */
function GalleryTab(){
  const {trip,s} = useApp();
  const all = [];
  trip.notes.forEach(n=>(n.photos||[]).forEach(p=>all.push({...p,noteTitle:n.title,noteDate:n.date})));
  const dates = [...new Set(all.map(p=>p.noteDate))].sort().reverse();
  return <div style={s.tc}>
    <h2 style={s.pageTitle}>Galeria</h2>
    <div style={s.ruleBold}/>
    <p style={s.caption}>{all.length} zdjęć z tej podróży</p>
    {all.length===0
      ? <p style={s.emptyBody}>Zdjęcia dodajesz przy notatkach — pojawią się tutaj automatycznie.</p>
      : dates.map(date=>(
          <section key={date} style={s.sec}>
            <h3 style={s.secTtl}>{new Date(date+"T12:00:00").toLocaleDateString("pl-PL",{day:"numeric",month:"long",year:"numeric"})}</h3>
            <div style={s.galGrid}>
              {all.filter(p=>p.noteDate===date).map((p,i)=>(
                <figure key={i} style={s.galItem}>
                  <img src={p.data} alt="" style={s.galImg}/>
                  <figcaption style={s.galCap}>{p.noteTitle}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        ))}
  </div>;
}

/* ═══ TŁUMACZ ═══ */
function PhrasesTab(){
  const {s} = useApp();
  const say = (text,lang) => {if(window.speechSynthesis){const u=new SpeechSynthesisUtterance(text);u.lang=lang;window.speechSynthesis.speak(u)}};
  return <div style={s.tc}>
    <h2 style={s.pageTitle}>Rozmówki</h2>
    <div style={s.ruleBold}/>
    <p style={s.caption}>{LANG_FLAGS.join("  ")} — dotknij głośnika, żeby usłyszeć wymowę</p>
    {Object.entries(PHRASES).map(([cat,phrases])=>(
      <section key={cat} style={s.sec}>
        <h3 style={s.secTtl}>{cat}</h3>
        {Object.entries(phrases).map(([pl,trans],i)=>(
          <div key={i} style={s.phraseBlock}>
            <div style={s.phraseHead}>
              <span style={s.phrasePl}>{pl}</span>
              <button onClick={()=>say(pl,"pl-PL")} style={s.iB} aria-label="Wymowa">🔊</button>
            </div>
            {trans.map((t,j)=>(
              <div key={j} style={s.phraseRow}>
                <span style={s.phraseFlag}>{LANG_FLAGS[j]}</span>
                <span style={s.rowTxt}>{t}</span>
                <button onClick={()=>say(t,LANG_CODES[j])} style={{...s.iB,opacity:.5}} aria-label="Wymowa">🔊</button>
              </div>
            ))}
          </div>
        ))}
      </section>
    ))}
  </div>;
}

/* ═══ SOS ═══ */
function SosTab(){
  const {s} = useApp();
  return <div style={s.tc}>
    <h2 style={s.pageTitle}>Awaryjnie</h2>
    <div style={s.ruleBold}/>
    <section style={s.sosLead}>
      <span style={s.sosNumber}>112</span>
      <p style={s.sosText}>Wspólny numer alarmowy w całej Unii Europejskiej — pogotowie, straż, policja.</p>
    </section>
    {Object.entries(EMERGENCY_DATA).map(([country,data])=>(
      <section key={country} style={s.sec}>
        <h3 style={s.secTtl}>{country}</h3>
        <div style={s.sosGrid}>
          <div style={s.sosCell}><span style={s.sosLabel}>Pogotowie</span><b style={s.sosVal}>{data.tel}</b></div>
          <div style={s.sosCell}><span style={s.sosLabel}>Policja</span><b style={s.sosVal}>{data.police}</b></div>
        </div>
        <p style={s.rowTxt}>{data.amb}</p>
        {data.tips.map((tip,i)=><p key={i} style={s.marginNote}>{tip}</p>)}
      </section>
    ))}
  </div>;
}

const TAB_VIEWS = {"Przegląd":OverviewTab,"Mapa":MapTab,"Miejsca":PlacesTab,"Plan dnia":ItineraryTab,"Budżet":BudgetTab,"Pakowanie":PackingTab,"Notatki":NotesTab,"Tłumacz":PhrasesTab,"SOS":SosTab,"Galeria":GalleryTab};
const BOTTOM_TABS = ["Przegląd","Mapa","Miejsca","Plan dnia","Budżet"];
const BOTTOM_LABELS = {"Przegląd":"Przegląd","Mapa":"Mapa","Miejsca":"Miejsca","Plan dnia":"Plan","Budżet":"Budżet"};

/* ═══ FORMULARZE ═══ */
function TripForm(){
  const {edit,setForm,setEdit,setTrips,setActive,s} = useApp();
  const [f,sF] = useState(edit||defaultTrip());
  const [status,setStatus] = useState(f.destLat!=null?"✓":"");
  const em = ["✈️","🏖️","🏔️","🌍","🗼","🏛️","🎡","🚗","🛳️","🌴","🏕️","🎿"];
  const geocode = async (dest) => {
    if(!dest.trim()) return;
    setStatus("…");
    try{
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(dest)}`,{headers:{"Accept-Language":"pl"}});
      const d = await r.json();
      if(d[0]){sF(p=>({...p,destLat:+d[0].lat,destLng:+d[0].lon,destCC:d[0].address?.country_code||""}));setStatus("✓")}
      else setStatus("✕");
    }catch{setStatus("✕")}
  };
  return <div style={s.modal}><div style={s.mc}>
    <h3 style={s.fT}>{edit?"Edytuj podróż":"Nowa podróż"}</h3>
    <div style={s.eR}>{em.map(e=><button key={e} onClick={()=>sF({...f,coverEmoji:e})} style={{...s.eB,...(f.coverEmoji===e?s.eBA:{})}}>{e}</button>)}</div>
    <input placeholder="Nazwa podróży" value={f.name} onChange={e=>sF({...f,name:e.target.value})} style={s.inp}/>
    <div style={{position:"relative"}}>
      <input placeholder="Cel (miasto lub kraj)" value={f.destination} onChange={e=>{sF({...f,destination:e.target.value});setStatus("")}} onBlur={e=>geocode(e.target.value)} style={s.inp}/>
      {status && <span style={s.inpStatus}>{status}</span>}
    </div>
    <div style={s.formRow}>
      <input type="date" value={f.startDate} onChange={e=>sF({...f,startDate:e.target.value})} style={{...s.inp,flex:1}}/>
      <input type="date" value={f.endDate} onChange={e=>sF({...f,endDate:e.target.value})} style={{...s.inp,flex:1}}/>
    </div>
    <select value={f.currency} onChange={e=>sF({...f,currency:e.target.value})} style={s.inp}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</select>
    <div style={s.formRow}>
      <button onClick={()=>{setForm(null);setEdit(null)}} className="vy-btn" style={s.b2}>Anuluj</button>
      <button onClick={()=>{if(!f.name)return;if(edit)setTrips(p=>p.map(t=>t.id===f.id?f:t));else{setTrips(p=>[...p,f]);setActive(f.id)}setForm(null);setEdit(null)}} className="vy-btn" style={s.b1}>{edit?"Zapisz":"Utwórz"}</button>
    </div>
  </div></div>;
}

function PlaceForm(){
  const {trip,upTrip,edit,setForm,setEdit,s} = useApp();
  const [f,sF] = useState(edit||{id:uid(),name:"",description:"",priority:"medium",visited:false,lat:null,lng:null});
  const [q,sQ] = useState("");
  const [res,sRes] = useState([]);
  const [loading,sLoading] = useState(false);
  const search = async () => {
    if(!q.trim()) return;
    sLoading(true);
    try{
      const cc = trip?.destCC?`&countrycodes=${trip.destCC}`:"";
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=4&q=${encodeURIComponent(q)}${cc}`,{headers:{"Accept-Language":"pl"}});
      sRes(await r.json());
    }catch{}
    sLoading(false);
  };
  return <div style={s.modal}><div style={s.mc}>
    <h3 style={s.fT}>{edit?"Edytuj miejsce":"Nowe miejsce"}</h3>
    <input placeholder="Nazwa" value={f.name} onChange={e=>sF({...f,name:e.target.value})} style={s.inp}/>
    <textarea placeholder="Opis" value={f.description} onChange={e=>sF({...f,description:e.target.value})} style={{...s.inp,minHeight:64,resize:"vertical"}}/>
    <div style={s.geoBox}>
      <span style={s.secTtlSm}>Lokalizacja</span>
      {f.lat!=null
        ? <div style={s.geoFound}>
            <span style={s.coords}>{f.lat.toFixed(5)}, {f.lng.toFixed(5)}</span>
            <button onClick={()=>sF({...f,lat:null,lng:null})} style={s.iB} aria-label="Usuń współrzędne">✕</button>
          </div>
        : <>
            <div style={{display:"flex",gap:6}}>
              <input value={q} onChange={e=>sQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&search()} placeholder="Szukaj adresu…" style={{...s.inp,marginBottom:0,flex:1}}/>
              <button onClick={search} disabled={loading} style={s.b2sm}>{loading?"…":"Szukaj"}</button>
            </div>
            {res.map((r,i)=>(
              <button key={i} onClick={()=>{sF({...f,lat:+r.lat,lng:+r.lon});sRes([])}} style={s.geoResult}>
                <b style={s.rowTxt}>{r.display_name.split(",")[0]}</b>
                <span style={s.caption}>{r.display_name.slice(0,80)}</span>
              </button>
            ))}
          </>}
    </div>
    <div style={s.pR}>{[["low","Niski"],["medium","Średni"],["high","Wysoki"]].map(([v,l])=>
      <button key={v} onClick={()=>sF({...f,priority:v})} style={{...s.pB,...(f.priority===v?s.pA:{})}}>{l}</button>)}</div>
    <div style={s.formRow}>
      <button onClick={()=>{setForm(null);setEdit(null)}} className="vy-btn" style={s.b2}>Anuluj</button>
      <button onClick={()=>{if(!f.name)return;upTrip({places:edit?trip.places.map(p=>p.id===f.id?f:p):[...trip.places,f]});setForm(null);setEdit(null)}} className="vy-btn" style={s.b1}>Zapisz</button>
    </div>
  </div></div>;
}

function ExpenseForm(){
  const {trip,upTrip,edit,setForm,setEdit,s} = useApp();
  const [f,sF] = useState(edit||{id:uid(),name:"",amount:"",category:"Inne",date:new Date().toISOString().split("T")[0]});
  return <div style={s.modal}><div style={s.mc}>
    <h3 style={s.fT}>{edit?"Edytuj wydatek":"Nowy wydatek"}</h3>
    <input placeholder="Na co" value={f.name} onChange={e=>sF({...f,name:e.target.value})} style={s.inp}/>
    <input placeholder="Kwota" type="number" inputMode="decimal" value={f.amount} onChange={e=>sF({...f,amount:e.target.value})} style={s.inp}/>
    <div style={s.cG}>{CATEGORIES.map(c=><button key={c} onClick={()=>sF({...f,category:c})} style={{...s.cB,...(f.category===c?{background:CAT_COLORS[c],color:"#fff",borderColor:CAT_COLORS[c]}:{})}}>{CAT_ICONS[c]} {c}</button>)}</div>
    <input type="date" value={f.date} onChange={e=>sF({...f,date:e.target.value})} style={s.inp}/>
    <div style={s.formRow}>
      <button onClick={()=>{setForm(null);setEdit(null)}} className="vy-btn" style={s.b2}>Anuluj</button>
      <button onClick={()=>{if(!f.name||!f.amount)return;upTrip({expenses:edit?trip.expenses.map(e=>e.id===f.id?{...f,amount:+f.amount}:e):[...trip.expenses,{...f,amount:+f.amount}]});setForm(null);setEdit(null)}} className="vy-btn" style={s.b1}>Zapisz</button>
    </div>
  </div></div>;
}

function NoteForm(){
  const {trip,upTrip,edit,setForm,setEdit,s} = useApp();
  const [f,sF] = useState(edit||{id:uid(),title:"",content:"",date:new Date().toISOString().split("T")[0],photos:[]});
  return <div style={s.modal}><div style={s.mc}>
    <h3 style={s.fT}>{edit?"Edytuj notatkę":"Nowa notatka"}</h3>
    <input placeholder="Tytuł" value={f.title} onChange={e=>sF({...f,title:e.target.value})} style={s.inp}/>
    <textarea placeholder="Treść…" value={f.content} onChange={e=>sF({...f,content:e.target.value})} style={{...s.inp,minHeight:110,resize:"vertical"}}/>
    <span style={s.secTtlSm}>Zdjęcia</span>
    <PhotoUpload photos={f.photos||[]} onChange={photos=>sF({...f,photos})}/>
    <div style={{...s.formRow,marginTop:14}}>
      <button onClick={()=>{setForm(null);setEdit(null)}} className="vy-btn" style={s.b2}>Anuluj</button>
      <button onClick={()=>{if(!f.title)return;upTrip({notes:edit?trip.notes.map(n=>n.id===f.id?f:n):[...trip.notes,f]});setForm(null);setEdit(null)}} className="vy-btn" style={s.b1}>Zapisz</button>
    </div>
  </div></div>;
}

function ItinForm(){
  const {trip,upTrip,edit,setForm,setEdit,s} = useApp();
  const [f,sF] = useState(edit||{id:uid(),day:"",title:"",items:[{time:"09:00",activity:""}]});
  const [sugg,setSugg] = useState(null);
  const upI = (i,k,v) => {const it=[...f.items];it[i]={...it[i],[k]:v};sF({...f,items:it})};
  const period = (time) => {if(!time)return null;const h=parseInt(time);if(h>=6&&h<10)return"Rano (6-10)";if(h>=10&&h<13)return"Przedpołudnie (10-13)";if(h>=13&&h<17)return"Popołudnie (13-17)";if(h>=17&&h<22)return"Wieczór (17-21)";return null};
  return <div style={s.modal}><div style={s.mc}>
    <h3 style={s.fT}>{edit?"Edytuj dzień":"Nowy dzień"}</h3>
    <input type="date" value={f.day} onChange={e=>sF({...f,day:e.target.value})} style={s.inp}/>
    <input placeholder="Tytuł dnia" value={f.title} onChange={e=>sF({...f,title:e.target.value})} style={s.inp}/>
    <span style={s.secTtlSm}>Aktywności</span>
    {f.items.map((it,i)=><div key={i} style={{marginBottom:8}}>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <input type="time" value={it.time} onChange={e=>{upI(i,"time",e.target.value);setSugg(null)}} style={{...s.inp,width:104,flex:"none",marginBottom:0}}/>
        <input placeholder="Co robicie" value={it.activity} onChange={e=>upI(i,"activity",e.target.value)} onFocus={()=>setSugg(i)} style={{...s.inp,flex:1,marginBottom:0}}/>
        {f.items.length>1 && <button onClick={()=>sF({...f,items:f.items.filter((_,j)=>j!==i)})} style={s.iB} aria-label="Usuń">✕</button>}
      </div>
      {sugg===i&&!it.activity && <div style={s.suggBox}>
        {(period(it.time)?ACTIVITY_SUGGESTIONS[period(it.time)]:Object.values(ACTIVITY_SUGGESTIONS).flat()).map((sg,j)=>
          <button key={j} onClick={()=>{upI(i,"activity",sg);setSugg(null)}} style={s.suggItem}>{sg}</button>)}
      </div>}
    </div>)}
    <button onClick={()=>sF({...f,items:[...f.items,{time:"",activity:""}]})} style={s.ghostBtn}>+ Kolejna aktywność</button>
    <div style={s.formRow}>
      <button onClick={()=>{setForm(null);setEdit(null)}} className="vy-btn" style={s.b2}>Anuluj</button>
      <button onClick={()=>{if(!f.day)return;upTrip({itinerary:(edit?trip.itinerary.map(d=>d.id===f.id?f:d):[...trip.itinerary,f]).sort((a,b)=>a.day.localeCompare(b.day))});setForm(null);setEdit(null)}} className="vy-btn" style={s.b1}>Zapisz</button>
    </div>
  </div></div>;
}

/* ═══ APLIKACJA ═══ */
export default function TravelPlanner(){
  const [trips,setTrips] = useState(()=>loadTrips());
  const [active,setActive] = useState(null);
  const [tab,setTab] = useState("Przegląd");
  const [form,setForm] = useState(null);
  const [edit,setEdit] = useState(null);
  const [showAI,setShowAI] = useState(false);
  const [showContents,setShowContents] = useState(false);
  const [darkMode,setDarkMode] = useState(()=>loadDark());
  const [storageFull,setStorageFull] = useState(false);
  const s = darkMode?sDark:sL;

  /* Zapis może się nie udać, gdy pamięć przeglądarki jest pełna
     (zwykle przez zdjęcia). Wcześniej błąd był połykany po cichu
     i dane znikały po restarcie — teraz użytkownik to widzi. */
  useEffect(()=>{setStorageFull(!saveTrips(trips))},[trips]);
  useEffect(()=>{saveDark(darkMode)},[darkMode]);

  const trip = trips.find(t=>t.id===active);
  const upTrip = useCallback(u=>setTrips(p=>p.map(t=>t.id===active?{...t,...u}:t)),[active]);
  const ctx = {trips,setTrips,active,setActive,tab,setTab,trip,upTrip,form,setForm,edit,setEdit,dark:darkMode,setDarkMode,showAI,setShowAI,showContents,setShowContents,s};

  const Forms = <>
    {form==="trip"&&<TripForm/>}
    {form==="place"&&trip&&<PlaceForm/>}
    {form==="expense"&&trip&&<ExpenseForm/>}
    {form==="note"&&trip&&<NoteForm/>}
    {form==="itin"&&trip&&<ItinForm/>}
  </>;

  const Warning = storageFull
    ? <div style={s.warnBar}>Pamięć urządzenia jest pełna — ostatnie zmiany <b>nie zostały zapisane</b>. Usuń kilka zdjęć z notatek, żeby zwolnić miejsce.</div>
    : null;

  if(!trip) return <DarkCtx.Provider value={darkMode}><AppCtx.Provider value={ctx}>
    <style>{CSS}</style>
    {Warning}
    <HomeScreen/>
    {Forms}
  </AppCtx.Provider></DarkCtx.Provider>;

  const View = TAB_VIEWS[tab]||OverviewTab;

  return <DarkCtx.Provider value={darkMode}><AppCtx.Provider value={ctx}>
    <div style={s.app}>
      <style>{CSS}</style>
      {Warning}
      <header style={s.tHdr}>
        <div style={s.tHdrRow}>
          <button onClick={()=>setActive(null)} style={s.back}>← Wszystkie</button>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={()=>setDarkMode(d=>!d)} style={s.hBtn} aria-label="Zmień motyw">{darkMode?"☀":"☾"}</button>
            <button onClick={()=>setShowAI(true)} style={s.hBtn}>Asystent</button>
            <button onClick={()=>setShowContents(true)} style={s.hBtnPrimary}>Spis</button>
          </div>
        </div>
        <h1 style={s.tTtl}>{trip.coverEmoji} {trip.name}</h1>
        <p style={s.tDate}>{dateline(trip)}</p>
      </header>

      <div style={s.contentArea}><View/></div>

      <nav style={s.btmBar}>
        {BOTTOM_TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{...s.btmBtn,...(tab===t?s.btmOn:{})}}>{BOTTOM_LABELS[t]}</button>
        ))}
        <button onClick={()=>setShowContents(true)} style={{...s.btmBtn,...(BOTTOM_TABS.includes(tab)?{}:s.btmOn)}}>Spis</button>
      </nav>

      {showContents && <ContentsSheet/>}
      {Forms}
      {showAI && <AIChat trip={trip} onClose={()=>setShowAI(false)}
        onAddPlaces={arr=>upTrip({places:[...trip.places,...arr]})}
        onUpdatePlace={(id,lat,lng,addr)=>setTrips(p=>p.map(t=>t.id===active?{...t,places:t.places.map(pl=>pl.id===id?{...pl,lat,lng,address:addr||""}:pl)}:t))}
        onAddToItinerary={item=>upTrip({itinerary:[...trip.itinerary,item].sort((a,b)=>a.day.localeCompare(b.day))})}/>}
    </div>
  </AppCtx.Provider></DarkCtx.Provider>;
}

/* ═══ STYLE ═══ */
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html,body{font-family:${SANS};overscroll-behavior:none;-webkit-overflow-scrolling:touch;height:100%;overflow:hidden}
#root{height:100%}
input,textarea,select{font-size:16px!important}
button{font-family:${SANS};color:inherit}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes cardIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
::-webkit-scrollbar{width:0;display:none}
.leaflet-container{font-family:${SANS}!important;z-index:1!important}
.leaflet-pane{z-index:1!important}
.leaflet-top,.leaflet-bottom{z-index:2!important}
.vy-card{transition:transform .18s cubic-bezier(.2,.8,.2,1),opacity .18s ease}
.vy-card:active{transform:scale(.99)}
.vy-btn{transition:transform .15s cubic-bezier(.2,.8,.2,1),filter .15s ease}
.vy-btn:active{transform:scale(.97);filter:brightness(.94)}
button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:2px solid currentColor;outline-offset:2px}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`;

const mkStyles = (c) => ({
  __accent:c.accent, __ok:c.ok, __muted:c.muted, __ink2:c.ink2,
  pri:{high:c.accent,medium:c.gold,low:c.ok},

  app:{fontFamily:SANS,background:c.paper,color:c.ink,position:"fixed",top:0,left:0,right:0,bottom:0,display:"flex",flexDirection:"column",overflow:"hidden"},

  /* ekran startowy */
  homeWrap:{maxWidth:620,margin:"0 auto",padding:"0 22px 60px",width:"100%"},
  masthead:{paddingTop:"max(28px,calc(env(safe-area-inset-top) + 18px))",paddingBottom:6},
  mastTop:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10},
  mastKicker:{fontSize:10.5,fontWeight:600,letterSpacing:".22em",textTransform:"uppercase",color:c.muted},
  mastToggle:{background:"none",border:`1px solid ${c.rule}`,color:c.ink2,width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:14},
  mastTitle:{fontFamily:SERIF,fontSize:46,fontWeight:700,letterSpacing:"-.03em",lineHeight:1,color:c.ink,marginBottom:14},
  ruleBold:{height:2,background:c.ink,margin:"12px 0 14px"},
  sectionHead:{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:18},
  sectionTitle:{fontFamily:SERIF,fontSize:20,fontWeight:600,color:c.ink},
  linkBtn:{background:"none",border:"none",color:c.accent,cursor:"pointer",fontSize:12.5,fontWeight:600,letterSpacing:".04em"},

  coverCard:{cursor:"pointer",animation:"cardIn .5s cubic-bezier(.2,.8,.2,1) both"},
  cover:{height:230,borderRadius:3,position:"relative",overflow:"hidden",display:"flex",alignItems:"flex-end",backgroundColor:"#2A2420"},
  coverInner:{position:"relative",zIndex:2,padding:"18px 18px 16px",width:"100%"},
  coverKicker:{display:"block",fontSize:10,fontWeight:600,letterSpacing:".2em",textTransform:"uppercase",color:"rgba(255,255,255,.82)",marginBottom:6},
  coverTitle:{fontFamily:SERIF,fontSize:34,fontWeight:700,lineHeight:.98,letterSpacing:"-.02em",color:"#fff",textShadow:"0 2px 18px rgba(0,0,0,.45)"},
  coverBadge:{display:"inline-block",background:"rgba(255,255,255,.9)",color:"#1A1A1A",fontSize:10,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",padding:"4px 9px",borderRadius:2,marginBottom:10},
  dateline:{fontSize:10.5,fontWeight:600,letterSpacing:".16em",color:c.muted,marginTop:12},

  figRow:{display:"flex"},
  fig:{flex:1,textAlign:"center",borderLeft:`1px solid ${c.rule}`,padding:"0 4px"},
  figV:{display:"block",fontFamily:SERIF,fontSize:26,fontWeight:700,color:c.ink,lineHeight:1,fontVariantNumeric:"tabular-nums"},
  figL:{display:"block",fontSize:9,letterSpacing:".14em",textTransform:"uppercase",color:c.muted,marginTop:6,fontWeight:600},

  emptyHome:{padding:"36px 0"},
  emptyLead:{fontFamily:SERIF,fontSize:22,fontWeight:600,color:c.ink,marginBottom:8},
  emptyBody:{fontSize:14.5,color:c.muted,lineHeight:1.65,margin:"10px 0 18px",maxWidth:"46ch"},

  /* nagłówek podróży */
  tHdr:{background:c.paper,borderBottom:`2px solid ${c.ink}`,padding:"10px 20px 12px",paddingTop:"max(10px,env(safe-area-inset-top))",flexShrink:0},
  tHdrRow:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8},
  back:{background:"none",border:"none",color:c.muted,cursor:"pointer",fontSize:12,fontWeight:600,letterSpacing:".06em",padding:0},
  hBtn:{background:"none",border:`1px solid ${c.rule}`,color:c.ink2,padding:"5px 11px",borderRadius:2,cursor:"pointer",fontSize:11.5,fontWeight:600,letterSpacing:".06em"},
  hBtnPrimary:{background:c.ink,border:`1px solid ${c.ink}`,color:c.paper,padding:"5px 13px",borderRadius:2,cursor:"pointer",fontSize:11.5,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase"},
  tTtl:{fontFamily:SERIF,fontSize:24,fontWeight:700,letterSpacing:"-.02em",color:c.ink,lineHeight:1.1},
  tDate:{fontSize:10,fontWeight:600,letterSpacing:".16em",color:c.muted,marginTop:4},

  contentArea:{flex:1,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",background:c.paper},
  tc:{padding:"22px 20px 30px",maxWidth:620,margin:"0 auto",animation:"fadeUp .28s ease"},
  pageTitle:{fontFamily:SERIF,fontSize:28,fontWeight:700,letterSpacing:"-.02em",color:c.ink},

  /* pasek dolny */
  btmBar:{display:"flex",background:c.paper,borderTop:`1px solid ${c.rule}`,flexShrink:0,paddingBottom:"env(safe-area-inset-bottom,0px)"},
  btmBtn:{flex:1,background:"none",border:"none",borderTop:"2px solid transparent",padding:"11px 2px 13px",cursor:"pointer",fontSize:9.5,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:c.muted},
  btmOn:{color:c.ink,borderTopColor:c.accent},

  /* spis treści */
  sheet:{position:"fixed",inset:0,background:c.paper,zIndex:150,overflowY:"auto",animation:"fadeUp .24s ease"},
  sheetInner:{maxWidth:620,margin:"0 auto",padding:"0 22px 50px"},
  sheetHead:{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:"max(20px,env(safe-area-inset-top))",marginBottom:16},
  sheetKicker:{fontSize:10.5,fontWeight:600,letterSpacing:".22em",textTransform:"uppercase",color:c.accent},
  sheetClose:{background:"none",border:`1px solid ${c.rule}`,color:c.ink2,width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:14},
  sheetTitle:{fontFamily:SERIF,fontSize:30,fontWeight:700,letterSpacing:"-.02em",color:c.ink,lineHeight:1.05},
  tocRow:{display:"flex",alignItems:"baseline",gap:8,padding:"15px 0",background:"none",border:"none",borderBottom:`1px solid ${c.ruleSoft}`,cursor:"pointer",textAlign:"left",width:"100%"},
  tocOn:{},
  tocName:{fontFamily:SERIF,fontSize:19,fontWeight:600,color:c.ink,flexShrink:0},
  tocLeader:{flex:1,borderBottom:`1px dotted ${c.rule}`,transform:"translateY(-4px)",minWidth:14},
  tocMeta:{fontSize:11,color:c.muted,flexShrink:0,letterSpacing:".03em",textAlign:"right"},

  /* sekcje i wiersze */
  sec:{marginTop:26},
  secTtl:{fontFamily:SERIF,fontSize:17,fontWeight:600,color:c.ink,marginBottom:10,letterSpacing:"-.01em"},
  secTtlSm:{display:"block",fontSize:10,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:c.muted,marginBottom:8},
  row:{display:"flex",alignItems:"baseline",gap:12,padding:"10px 0",borderBottom:`1px solid ${c.ruleSoft}`},
  rowTxt:{flex:1,fontSize:14,color:c.ink2,lineHeight:1.55},
  time:{fontFamily:MONO,fontSize:11.5,fontWeight:500,color:c.accent,width:42,flexShrink:0,fontVariantNumeric:"tabular-nums"},
  caption:{fontSize:11.5,color:c.muted,lineHeight:1.5,marginTop:6},
  marginNote:{fontSize:13,color:c.ink2,lineHeight:1.6,paddingLeft:12,borderLeft:`2px solid ${c.accent}`,margin:"8px 0"},

  /* miejsca */
  placeRow:{display:"flex",gap:12,alignItems:"flex-start",padding:"15px 0",borderBottom:`1px solid ${c.ruleSoft}`},
  placeName:{fontFamily:SERIF,fontSize:16.5,fontWeight:600,color:c.ink,lineHeight:1.25},
  placeDesc:{fontSize:13,color:c.ink2,lineHeight:1.55,marginTop:3},
  chipRow:{display:"flex",flexWrap:"wrap",gap:6,marginTop:8,alignItems:"center"},
  chip:{fontSize:9.5,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",padding:"3px 8px",border:"1px solid",borderRadius:2},
  chipBtn:{fontSize:9.5,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",padding:"3px 8px",border:`1px solid ${c.rule}`,borderRadius:2,background:"none",color:c.ink2,cursor:"pointer"},
  chipLink:{fontSize:9.5,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",padding:"3px 8px",border:`1px solid ${c.ink}`,borderRadius:2,background:c.ink,color:c.paper,textDecoration:"none"},
  coords:{fontFamily:MONO,fontSize:10.5,color:c.muted,marginTop:6},
  chk:{width:22,height:22,borderRadius:"50%",border:`1.5px solid ${c.rule}`,background:"none",color:c.paper,cursor:"pointer",fontSize:11,fontWeight:700,flexShrink:0,marginTop:2,display:"flex",alignItems:"center",justifyContent:"center"},
  chkOn:{background:c.ok,borderColor:c.ok},
  acts:{display:"flex",gap:2,flexShrink:0},
  iB:{background:"none",border:"none",cursor:"pointer",fontSize:14,padding:5,color:c.muted,lineHeight:1},

  /* plan */
  daySection:{marginTop:24,paddingTop:4},
  dayHead:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderBottom:`2px solid ${c.ink}`,paddingBottom:8,marginBottom:4},
  dayTitle:{fontFamily:SERIF,fontSize:17,fontWeight:700,color:c.ink,textTransform:"capitalize",letterSpacing:"-.01em"},

  /* budżet */
  bigFigure:{display:"flex",alignItems:"baseline",gap:8,marginTop:14},
  bigFigureV:{fontFamily:SERIF,fontSize:46,fontWeight:700,color:c.ink,lineHeight:1,letterSpacing:"-.03em",fontVariantNumeric:"tabular-nums"},
  bigFigureU:{fontSize:13,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:c.muted},
  expRow:{display:"flex",alignItems:"center",gap:11,padding:"13px 0",borderBottom:`1px solid ${c.ruleSoft}`},
  catDot:{width:34,height:34,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0},
  amount:{fontFamily:SERIF,fontSize:17,fontWeight:700,color:c.ink,whiteSpace:"nowrap",fontVariantNumeric:"tabular-nums"},
  barRow:{display:"flex",alignItems:"center",gap:10,marginBottom:9},
  barLabel:{fontSize:12,color:c.ink2,width:96,flexShrink:0},
  barTrack:{flex:1,height:6,background:c.paper2,borderRadius:0,overflow:"hidden"},
  barFill:{height:"100%",transition:"width .5s ease"},
  barVal:{fontFamily:MONO,fontSize:11.5,color:c.ink2,width:52,textAlign:"right",flexShrink:0,fontVariantNumeric:"tabular-nums"},

  /* pakowanie */
  packHead:{display:"flex",justifyContent:"space-between",alignItems:"baseline"},
  packCount:{fontFamily:MONO,fontSize:11,color:c.muted,fontWeight:400},
  packRow:{display:"flex",alignItems:"center",gap:11,padding:"9px 0",borderBottom:`1px solid ${c.ruleSoft}`},
  addRow:{display:"flex",gap:8,marginTop:22},

  /* notatki i galeria */
  noteArticle:{paddingTop:22,marginTop:22,borderTop:`1px solid ${c.rule}`},
  notePhotos:{display:"flex",gap:4,overflowX:"auto",marginBottom:12},
  notePhoto:{height:190,objectFit:"cover",flexShrink:0,borderRadius:2},
  noteTitle:{fontFamily:SERIF,fontSize:21,fontWeight:700,color:c.ink,letterSpacing:"-.01em",lineHeight:1.2},
  noteBody:{fontSize:14.5,color:c.ink2,lineHeight:1.7,whiteSpace:"pre-wrap",marginTop:8},
  noteFoot:{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12},
  galGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8},
  galItem:{margin:0},
  galImg:{width:"100%",aspectRatio:"1",objectFit:"cover",borderRadius:2,display:"block"},
  galCap:{fontSize:10.5,color:c.muted,marginTop:5,letterSpacing:".02em"},
  miniMapBox:{height:190,borderRadius:2,overflow:"hidden",cursor:"pointer",border:`1px solid ${c.rule}`},

  /* rozmówki */
  phraseBlock:{padding:"13px 0",borderBottom:`1px solid ${c.ruleSoft}`},
  phraseHead:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7},
  phrasePl:{fontFamily:SERIF,fontSize:16,fontWeight:600,color:c.ink},
  phraseRow:{display:"flex",alignItems:"center",gap:9,padding:"4px 0"},
  phraseFlag:{fontSize:13,width:20,flexShrink:0},

  /* sos */
  sosLead:{display:"flex",alignItems:"center",gap:16,padding:"18px 0",borderBottom:`2px solid ${c.ink}`},
  sosNumber:{fontFamily:SERIF,fontSize:46,fontWeight:700,color:c.accent,lineHeight:1,letterSpacing:"-.03em"},
  sosText:{fontSize:13.5,color:c.ink2,lineHeight:1.6},
  sosGrid:{display:"flex",gap:22,marginBottom:10},
  sosCell:{},
  sosLabel:{display:"block",fontSize:9.5,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:c.muted,marginBottom:3},
  sosVal:{fontFamily:MONO,fontSize:16,fontWeight:500,color:c.ink},

  /* przyciski */
  actionRow:{display:"flex",gap:8,flexWrap:"wrap",marginTop:20},
  b1:{background:c.ink,color:c.paper,border:`1px solid ${c.ink}`,padding:"13px 22px",borderRadius:2,cursor:"pointer",fontWeight:600,fontSize:12.5,letterSpacing:".1em",textTransform:"uppercase",width:"100%"},
  b2:{background:"none",color:c.ink2,border:`1px solid ${c.rule}`,padding:"13px 22px",borderRadius:2,cursor:"pointer",fontWeight:600,fontSize:12.5,letterSpacing:".1em",textTransform:"uppercase",flex:1},
  b2sm:{background:"none",color:c.ink2,border:`1px solid ${c.rule}`,padding:"11px 16px",borderRadius:2,cursor:"pointer",fontWeight:600,fontSize:11.5,letterSpacing:".08em",textTransform:"uppercase",flexShrink:0},
  bO:{background:"none",border:`1px solid ${c.rule}`,color:c.ink2,padding:"11px 18px",borderRadius:2,cursor:"pointer",fontWeight:600,fontSize:11.5,letterSpacing:".08em",textTransform:"uppercase",flex:1},
  ghostBtn:{background:"none",border:`1px dashed ${c.rule}`,color:c.muted,padding:"11px 16px",borderRadius:2,cursor:"pointer",fontWeight:600,fontSize:11.5,letterSpacing:".08em",textTransform:"uppercase",width:"100%",marginTop:10},

  /* formularze */
  modal:{position:"fixed",inset:0,background:"rgba(14,12,10,.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:120,padding:16},
  mc:{background:c.paper,borderRadius:3,padding:"26px 24px",width:"100%",maxWidth:440,maxHeight:"86vh",overflowY:"auto",animation:"fadeUp .26s ease",border:`1px solid ${c.rule}`},
  fT:{fontFamily:SERIF,fontSize:23,fontWeight:700,color:c.ink,marginBottom:18,letterSpacing:"-.02em"},
  inp:{width:"100%",padding:"12px 13px",border:`1px solid ${c.rule}`,borderRadius:2,fontSize:14,fontFamily:SANS,marginBottom:10,outline:"none",background:c.surf,color:c.ink},
  inpStatus:{position:"absolute",right:12,top:12,fontSize:13,color:c.muted},
  formRow:{display:"flex",gap:8,marginTop:8},
  eR:{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14},
  eB:{width:38,height:38,borderRadius:2,border:`1px solid ${c.rule}`,background:c.surf,fontSize:18,cursor:"pointer"},
  eBA:{borderColor:c.ink,background:c.paper2},
  pR:{display:"flex",gap:6,marginBottom:10},
  pB:{flex:1,padding:11,border:`1px solid ${c.rule}`,borderRadius:2,background:c.surf,color:c.ink2,cursor:"pointer",fontSize:11.5,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase"},
  pA:{borderColor:c.ink,background:c.ink,color:c.paper},
  cG:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10},
  cB:{padding:"10px 6px",border:`1px solid ${c.rule}`,borderRadius:2,background:c.surf,color:c.ink2,cursor:"pointer",fontSize:11,fontWeight:600,textAlign:"center"},
  geoBox:{border:`1px solid ${c.rule}`,borderRadius:2,padding:13,marginBottom:10,background:c.paper2},
  geoFound:{display:"flex",alignItems:"center",justifyContent:"space-between"},
  geoResult:{display:"block",width:"100%",textAlign:"left",background:c.surf,border:`1px solid ${c.rule}`,borderRadius:2,padding:"9px 11px",marginTop:6,cursor:"pointer"},
  suggBox:{marginTop:6,maxHeight:150,overflowY:"auto",border:`1px solid ${c.rule}`,borderRadius:2,background:c.surf},
  suggItem:{display:"block",width:"100%",padding:"9px 11px",background:"none",border:"none",borderBottom:`1px solid ${c.ruleSoft}`,cursor:"pointer",textAlign:"left",fontSize:13,color:c.ink2},

  warnBar:{position:"fixed",top:0,left:0,right:0,zIndex:300,background:c.accent,color:"#fff",fontSize:12.5,lineHeight:1.5,padding:"10px 16px",paddingTop:"max(10px,env(safe-area-inset-top))"},

  /* asystent AI */
  aiO:{position:"fixed",inset:0,background:"rgba(14,12,10,.78)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"},
  aiP:{background:c.paper,borderRadius:"3px 3px 0 0",width:"100%",maxWidth:520,height:"85vh",display:"flex",flexDirection:"column",animation:"fadeUp .28s ease"},
  aiH:{padding:"16px 20px",borderBottom:`2px solid ${c.ink}`,display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:SERIF,fontSize:18,fontWeight:700,color:c.ink},
  clB:{background:"none",border:"none",fontSize:17,cursor:"pointer",color:c.muted},
  aiM:{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12},
  bbl:{padding:"12px 15px",borderRadius:3,maxWidth:"86%",fontSize:14,lineHeight:1.6},
  uB:{background:c.ink,color:c.paper,alignSelf:"flex-end"},
  aB:{background:c.paper2,color:c.ink2,alignSelf:"flex-start",border:`1px solid ${c.rule}`},
  aiR:{padding:"12px 16px",borderTop:`1px solid ${c.rule}`,display:"flex",gap:8,alignItems:"center"},
  aiI:{padding:"12px 13px",border:`1px solid ${c.rule}`,borderRadius:2,fontSize:14,fontFamily:SANS,outline:"none",background:c.surf,color:c.ink},
  snB:{background:c.ink,color:c.paper,border:"none",width:42,height:42,borderRadius:2,cursor:"pointer",fontSize:16,flexShrink:0}
});

const sL = mkStyles(PAL_L);
const sDark = mkStyles(PAL_D);

/* style mapy (Leaflet) — nakładki nad jasnymi kafelkami w obu motywach */
const ms = {
  sw:{position:"absolute",top:12,left:12,right:12,zIndex:5},
  sr:{display:"flex",gap:6},
  si:{flex:1,padding:"11px 13px",border:"1px solid #E2DFD9",borderRadius:2,fontSize:14,fontFamily:SANS,boxShadow:"0 2px 14px rgba(0,0,0,.14)",outline:"none",background:"#FBFBF9",color:"#111"},
  sb:{padding:"11px 18px",background:"#111111",color:"#FBFBF9",border:"none",borderRadius:2,cursor:"pointer",fontFamily:SANS,fontWeight:600,fontSize:11.5,letterSpacing:".1em",textTransform:"uppercase"},
  dd:{background:"#FBFBF9",borderRadius:2,marginTop:6,boxShadow:"0 4px 22px rgba(0,0,0,.16)",overflow:"hidden",maxHeight:260,overflowY:"auto"},
  di:{padding:"11px 13px",borderBottom:"1px solid #EDEBE5",display:"flex",alignItems:"center",gap:10,color:"#111"},
  da:{background:"#8E1F16",color:"#fff",border:"none",padding:"5px 12px",borderRadius:2,cursor:"pointer",fontFamily:SANS,fontSize:10.5,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",whiteSpace:"nowrap",flexShrink:0},
  mc:{height:"calc(100vh - 210px)",minHeight:400,width:"100%",background:"#E2DFD9"},
  cb:{position:"absolute",bottom:80,left:12,right:12,background:"#FBFBF9",borderRadius:2,padding:15,boxShadow:"0 4px 26px rgba(0,0,0,.2)",zIndex:6,maxWidth:360,color:"#111"},
  ci:{width:"100%",padding:"10px 12px",border:"1px solid #E2DFD9",borderRadius:2,fontSize:14,fontFamily:SANS,marginBottom:8,outline:"none",background:"#fff",color:"#111"},
  ca:{width:"100%",padding:"11px",background:"#111111",color:"#FBFBF9",border:"none",borderRadius:2,cursor:"pointer",fontFamily:SANS,fontWeight:600,fontSize:11.5,letterSpacing:".1em",textTransform:"uppercase"},
  lg:{position:"absolute",bottom:16,left:12,background:"rgba(251,251,249,.95)",borderRadius:2,padding:"7px 12px",display:"flex",gap:12,boxShadow:"0 2px 10px rgba(0,0,0,.12)",zIndex:6,fontSize:10,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase"},
  li:{display:"flex",alignItems:"center",gap:4,color:"#2B2825"},
  ld:{width:9,height:9,borderRadius:"50%",border:"2px solid #fff",boxShadow:"0 1px 3px rgba(0,0,0,.25)"},
  ct:{position:"absolute",bottom:16,right:12,background:"rgba(251,251,249,.95)",borderRadius:2,padding:"7px 12px",boxShadow:"0 2px 10px rgba(0,0,0,.12)",zIndex:6,fontFamily:MONO,fontSize:11,fontWeight:500,color:"#8E1F16"},
  ht:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"rgba(251,251,249,.94)",borderRadius:2,padding:"14px 20px",boxShadow:"0 2px 16px rgba(0,0,0,.12)",zIndex:3,fontSize:13,color:"#2B2825",fontWeight:500,textAlign:"center",pointerEvents:"none"}
};
