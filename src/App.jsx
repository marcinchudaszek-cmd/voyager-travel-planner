import { useState, useEffect, useRef, useCallback } from "react";

const TABS = ["Przegląd","Mapa","Miejsca","Plan dnia","Budżet","Notatki"];
const ICONS = {"Przegląd":"📋","Mapa":"🗺️","Miejsca":"📍","Plan dnia":"🗓️","Budżet":"💰","Notatki":"📝"};
const CURRENCIES = ["PLN","EUR","USD","GBP","CZK","CHF"];
const CATEGORIES = ["Transport","Nocleg","Jedzenie","Atrakcje","Zakupy","Inne"];
const CAT_ICONS = {Transport:"✈️",Nocleg:"🏨",Jedzenie:"🍽️",Atrakcje:"🎭",Zakupy:"🛍️",Inne:"📦"};
const CAT_COLORS = {Transport:"#4A90D9",Nocleg:"#8B5CF6",Jedzenie:"#F59E0B",Atrakcje:"#EC4899",Zakupy:"#10B981",Inne:"#6B7280"};
const PRI_COLORS = {high:"#ef4444",medium:"#f59e0b",low:"#22c55e"};
const WMO_ICONS = {0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",48:"🌫️",51:"🌦️",53:"🌧️",55:"🌧️",61:"🌧️",63:"🌧️",65:"🌧️",71:"🌨️",73:"🌨️",75:"❄️",80:"🌦️",81:"🌧️",82:"⛈️",95:"⛈️"};
const WMO_TEXT = {0:"Słonecznie",1:"Lekkie chmury",2:"Częściowe zachmurzenie",3:"Pochmurno",45:"Mgła",51:"Mżawka",61:"Lekki deszcz",63:"Deszcz",65:"Silny deszcz",71:"Lekki śnieg",73:"Śnieg",75:"Silny śnieg",80:"Przelotny deszcz",82:"Ulewa",95:"Burza"};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
const defaultTrip = () => ({id:uid(),name:"",destination:"",startDate:"",endDate:"",coverEmoji:"✈️",places:[],itinerary:[],expenses:[],notes:[],currency:"PLN",destLat:null,destLng:null});

function saveTrips(trips) {
  try { localStorage.setItem("voyager-data", JSON.stringify(trips)); } catch(e) {}
}
function loadTrips() {
  try { const d = localStorage.getItem("voyager-data"); return d ? JSON.parse(d) : []; } catch(e) { return []; }
}

const compressImage = (file, maxDim=800, quality=0.6) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let w=img.width, h=img.height;
      if(w>maxDim||h>maxDim){if(w>h){h=(h/w)*maxDim;w=maxDim}else{w=(w/h)*maxDim;h=maxDim}}
      canvas.width=w;canvas.height=h;
      canvas.getContext("2d").drawImage(img,0,0,w,h);
      resolve(canvas.toDataURL("image/jpeg",quality));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

/* ═══════════ WEATHER ═══════════ */
function WeatherWidget({lat,lng,destination}) {
  const [weather,setWeather]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const mounted=useRef(true);

  useEffect(()=>{
    mounted.current=true;
    if(!lat||!lng) return;
    setLoading(true);setError(null);
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,wind_speed_10m_max&current=temperature_2m,weathercode,relative_humidity_2m,wind_speed_10m&timezone=auto&forecast_days=7`)
      .then(r=>r.json()).then(data=>{if(mounted.current){if(data.daily)setWeather(data);else setError("Brak danych")}})
      .catch(()=>{if(mounted.current)setError("Brak połączenia")})
      .finally(()=>{if(mounted.current)setLoading(false)});
    return()=>{mounted.current=false};
  },[lat,lng]);

  if(!lat||!lng) return <div style={wS.box}><div style={wS.hdr}><span style={{fontSize:20}}>🌤️</span><span style={{fontWeight:700}}>Pogoda</span></div><p style={{color:"#94a3b8",fontSize:13,textAlign:"center",padding:"16px 0"}}>Ustaw cel podróży, aby zobaczyć prognozę</p></div>;
  if(loading) return <div style={wS.box}><div style={wS.hdr}><span style={{fontSize:20}}>🌤️</span><span style={{fontWeight:700}}>Pogoda — {destination}</span></div><div style={{textAlign:"center",padding:"20px 0",color:"#94a3b8"}}>Ładowanie...</div></div>;
  if(error) return <div style={wS.box}><div style={wS.hdr}><span style={{fontSize:20}}>🌤️</span><span style={{fontWeight:700}}>Pogoda</span></div><p style={{color:"#ef4444",fontSize:13,textAlign:"center",padding:"16px 0"}}>⚠️ {error}</p></div>;
  if(!weather) return null;

  const cur=weather.current, d=weather.daily;
  const days=["Nd","Pn","Wt","Śr","Cz","Pt","Sb"];
  return (
    <div style={wS.box}>
      <div style={wS.hdr}><span style={{fontSize:20}}>🌤️</span><span style={{fontWeight:700}}>Pogoda — {destination}</span></div>
      <div style={{display:"flex",alignItems:"center",gap:16,padding:16}}>
        <div style={{fontSize:48}}>{WMO_ICONS[cur.weathercode]||"🌡️"}</div>
        <div>
          <div style={{fontSize:36,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{Math.round(cur.temperature_2m)}°C</div>
          <div style={{fontSize:14,color:"#475569"}}>{WMO_TEXT[cur.weathercode]||"—"}</div>
          <div style={{fontSize:12,color:"#94a3b8",marginTop:4}}>💧 {cur.relative_humidity_2m}% 💨 {Math.round(cur.wind_speed_10m)} km/h</div>
        </div>
      </div>
      <div style={{display:"flex",overflowX:"auto",gap:4,padding:"4px 8px 12px"}}>
        {d.time.map((date,i)=>{const dt=new Date(date+"T12:00:00");return(
          <div key={i} style={{flex:"0 0 auto",width:64,textAlign:"center",padding:"8px 4px",borderRadius:10,background:"#f8fafc"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:4}}>{i===0?"Dziś":days[dt.getDay()]}</div>
            <div style={{fontSize:22}}>{WMO_ICONS[d.weathercode[i]]||"🌡️"}</div>
            <div style={{fontSize:13,fontWeight:700,marginTop:4}}>{Math.round(d.temperature_2m_max[i])}°</div>
            <div style={{fontSize:11,color:"#94a3b8"}}>{Math.round(d.temperature_2m_min[i])}°</div>
            {d.precipitation_sum[i]>0&&<div style={{fontSize:10,color:"#3b82f6",marginTop:2}}>💧{d.precipitation_sum[i].toFixed(1)}</div>}
          </div>)})}
      </div>
    </div>
  );
}
const wS={box:{background:"#fff",borderRadius:14,border:"1px solid rgba(0,0,0,.06)",marginBottom:12,overflow:"hidden"},hdr:{display:"flex",alignItems:"center",gap:8,padding:"14px 16px",borderBottom:"1px solid #f1f5f9",fontSize:15}};

/* ═══════════ PHOTO UPLOAD ═══════════ */
function PhotoUpload({photos,onChange}) {
  const fileRef=useRef(null);
  const [uploading,setUploading]=useState(false);
  const handleFiles=async(e)=>{
    const files=Array.from(e.target.files);if(!files.length)return;setUploading(true);
    const np=[];for(const f of files.slice(0,5)){if(!f.type.startsWith("image/"))continue;np.push({id:uid(),data:await compressImage(f),name:f.name})}
    onChange([...(photos||[]),...np]);setUploading(false);if(fileRef.current)fileRef.current.value="";
  };
  return(<div>
    <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
      {(photos||[]).map(p=><div key={p.id} style={{position:"relative",width:80,height:80,borderRadius:10,overflow:"hidden",border:"2px solid #e2e8f0"}}>
        <img src={p.data} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
        <button onClick={()=>onChange(photos.filter(x=>x.id!==p.id))} style={{position:"absolute",top:2,right:2,width:20,height:20,borderRadius:"50%",background:"rgba(0,0,0,.6)",color:"#fff",border:"none",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      </div>)}
      <button onClick={()=>fileRef.current&&fileRef.current.click()} disabled={uploading} style={{width:80,height:80,borderRadius:10,border:"2px dashed #cbd5e1",background:"#f8fafc",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontSize:10,color:"#94a3b8",fontWeight:600}}>
        {uploading?"⏳":<>📷<span style={{marginTop:2}}>Dodaj</span></>}
      </button>
    </div>
    <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{display:"none"}}/>
  </div>);
}

/* ═══════════ LEAFLET MAP ═══════════ */
function TripMap({trip,onAddPlace}) {
  const containerRef=useRef(null);
  const mapRef=useRef(null);
  const markersRef=useRef(null);
  const clickMkRef=useRef(null);
  const [ready,setReady]=useState(false);
  const [query,setQuery]=useState("");
  const [results,setResults]=useState([]);
  const [searching,setSearching]=useState(false);
  const [clickPos,setClickPos]=useState(null);
  const [newName,setNewName]=useState("");

  // Load Leaflet
  useEffect(()=>{
    if(window.L){setReady(true);return}
    const css=document.createElement("link");css.rel="stylesheet";css.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(css);
    const js=document.createElement("script");js.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    js.onload=()=>setReady(true);document.head.appendChild(js);
  },[]);

  // Init map
  useEffect(()=>{
    if(!ready||!containerRef.current||mapRef.current) return;
    const L=window.L;
    const map=L.map(containerRef.current,{zoomControl:false}).setView([52,19],6);
    L.control.zoom({position:"bottomright"}).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",{attribution:'© OSM © CARTO',maxZoom:19}).addTo(map);
    markersRef.current=L.layerGroup().addTo(map);
    map.on("click",e=>{setClickPos({lat:e.latlng.lat,lng:e.latlng.lng});setNewName("")});
    mapRef.current=map;
    if(trip.destLat&&trip.destLng)map.setView([trip.destLat,trip.destLng],10);
    else if(trip.destination)fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trip.destination)}&limit=1`).then(r=>r.json()).then(d=>{if(d[0]&&mapRef.current)mapRef.current.setView([+d[0].lat,+d[0].lon],10)}).catch(()=>{});
    return()=>{
      if(mapRef.current){try{mapRef.current.remove()}catch(e){}}
      mapRef.current=null;markersRef.current=null;
    };
  },[ready]);

  // Sync markers
  useEffect(()=>{
    if(!mapRef.current||!window.L||!markersRef.current)return;
    const L=window.L;
    try{markersRef.current.clearLayers()}catch(e){return}
    const geo=trip.places.filter(p=>p.lat&&p.lng);
    geo.forEach(p=>{
      const c=p.visited?"#94a3b8":(PRI_COLORS[p.priority]||"#1e3a5f");
      L.marker([p.lat,p.lng],{icon:L.divIcon({className:"",iconSize:[0,0],
        html:`<div style="width:34px;height:34px;border-radius:50%;background:${c};border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff;font-weight:700;transform:translate(-17px,-17px);${p.visited?"opacity:.55;":""}">${p.visited?"✓":"📍"}</div>`
      })}).bindPopup(`<div style="font-family:sans-serif;min-width:150px"><strong>${p.name}</strong>${p.description?`<p style="color:#666;font-size:12px;margin:4px 0 0">${p.description}</p>`:""}</div>`,{maxWidth:240}).addTo(markersRef.current);
    });
    if(geo.length>1)try{mapRef.current.fitBounds(L.latLngBounds(geo.map(p=>[p.lat,p.lng])).pad(.25))}catch(e){}
    else if(geo.length===1)try{mapRef.current.setView([geo[0].lat,geo[0].lng],13)}catch(e){}
  },[trip.places,ready]);

  // Click marker
  useEffect(()=>{
    if(!mapRef.current||!window.L)return;
    if(clickMkRef.current){try{mapRef.current.removeLayer(clickMkRef.current)}catch(e){};clickMkRef.current=null}
    if(!clickPos)return;
    const L=window.L;
    clickMkRef.current=L.marker([clickPos.lat,clickPos.lng],{icon:L.divIcon({className:"",iconSize:[0,0],
      html:`<div style="width:22px;height:22px;border-radius:50%;background:#ef4444;border:3px solid #fff;box-shadow:0 2px 10px rgba(239,68,68,.5);transform:translate(-11px,-11px)"></div>`
    })}).addTo(mapRef.current);
  },[clickPos]);

  const doSearch=async()=>{if(!query.trim())return;setSearching(true);try{const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);setResults(await r.json())}catch{setResults([])}setSearching(false)};
  const flyTo=(lat,lng)=>{if(mapRef.current)try{mapRef.current.flyTo([lat,lng],14,{duration:1})}catch(e){}};
  const addFromClick=()=>{if(!clickPos||!newName.trim())return;onAddPlace({id:uid(),name:newName.trim(),description:"",priority:"medium",visited:false,lat:clickPos.lat,lng:clickPos.lng});setClickPos(null);setNewName("")};

  if(!ready)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:400,color:"#94a3b8"}}><div style={{textAlign:"center"}}><div style={{fontSize:48,marginBottom:8}}>🗺️</div>Ładowanie mapy...</div></div>;

  const geoCount=trip.places.filter(p=>p.lat).length;
  return(
    <div style={{position:"relative"}}>
      <div style={ms.sw}><div style={ms.sr}>
        <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()} placeholder="🔍 Szukaj miejsca..." style={ms.si}/>
        <button onClick={doSearch} disabled={searching} style={ms.sb}>{searching?"⏳":"Szukaj"}</button>
      </div>
      {results.length>0&&<div style={ms.dd}>{results.map((r,i)=>(
        <div key={i} style={ms.di}>
          <div onClick={()=>{flyTo(+r.lat,+r.lon);setResults([]);setQuery(r.display_name.split(",")[0])}} style={{flex:1,cursor:"pointer"}}>
            <div style={{fontWeight:600,fontSize:14}}>{r.display_name.split(",")[0]}</div>
            <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{r.display_name.slice(0,90)}</div>
          </div>
          <button onClick={()=>{onAddPlace({id:uid(),name:r.display_name.split(",")[0],description:r.display_name.split(",").slice(1,3).join(",").trim(),priority:"medium",visited:false,lat:+r.lat,lng:+r.lon});flyTo(+r.lat,+r.lon);setResults([]);setQuery("")}} style={ms.da}>+ Dodaj</button>
        </div>))}</div>}
      </div>
      <div ref={containerRef} style={ms.mc}/>
      {clickPos&&<div style={ms.cb}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:14,fontWeight:700}}>📍 Nowe miejsce</span>
          <button onClick={()=>setClickPos(null)} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:"#94a3b8"}}>✕</button>
        </div>
        <div style={{fontSize:11,color:"#94a3b8",marginBottom:8,fontFamily:"monospace"}}>{clickPos.lat.toFixed(5)}, {clickPos.lng.toFixed(5)}</div>
        <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addFromClick()} placeholder="Wpisz nazwę..." style={ms.ci} autoFocus/>
        <button onClick={addFromClick} disabled={!newName.trim()} style={{...ms.ca,opacity:newName.trim()?1:.5}}>Dodaj do listy</button>
      </div>}
      <div style={ms.lg}>{[["#ef4444","Wysoki"],["#f59e0b","Średni"],["#22c55e","Niski"],["#94a3b8","✓"]].map(([c,l])=><div key={l} style={ms.li}><div style={{...ms.ld,background:c}}/>{l}</div>)}</div>
      <div style={ms.ct}>📍 {geoCount}/{trip.places.length}</div>
      {geoCount===0&&<div style={ms.ht}>Kliknij na mapę lub szukaj aby dodać miejsca</div>}
    </div>
  );
}

/* ═══════════ MINI MAP ═══════════ */
function MiniMap({trip}) {
  const ref=useRef(null);
  const mapInst=useRef(null);
  const [mapReady,setMapReady]=useState(false);

  useEffect(()=>{
    if(window.L)setMapReady(true);
    else{
      const check=setInterval(()=>{if(window.L){setMapReady(true);clearInterval(check)}},200);
      return()=>clearInterval(check);
    }
  },[]);

  useEffect(()=>{
    if(!mapReady||!ref.current||mapInst.current)return;
    const L=window.L;
    const geo=trip.places.filter(p=>p.lat&&p.lng);
    if(!geo.length)return;
    try{
      const map=L.map(ref.current,{zoomControl:false,attributionControl:false,dragging:false,scrollWheelZoom:false,touchZoom:false,doubleClickZoom:false});
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",{maxZoom:19}).addTo(map);
      geo.forEach(p=>L.marker([p.lat,p.lng],{icon:L.divIcon({className:"",iconSize:[0,0],html:`<div style="width:12px;height:12px;border-radius:50%;background:${PRI_COLORS[p.priority]||"#1e3a5f"};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3);transform:translate(-6px,-6px)"></div>`})}).addTo(map));
      if(geo.length>1)map.fitBounds(L.latLngBounds(geo.map(p=>[p.lat,p.lng])).pad(.3));
      else map.setView([geo[0].lat,geo[0].lng],12);
      mapInst.current=map;
    }catch(e){}
    return()=>{if(mapInst.current){try{mapInst.current.remove()}catch(e){}}mapInst.current=null};
  },[mapReady,trip.places]);

  return <div ref={ref} style={{width:"100%",height:"100%"}}/>;
}

/* ═══════════ AI CHAT ═══════════ */
function AIChat({trip,onClose}) {
  const [msgs,setMsgs]=useState([{role:"assistant",text:`Cześć! 🌍 Asystent podróży${trip?.destination?` do ${trip.destination}`:""}. Zapytaj o miejsca, restauracje, budżet, plan dnia!`}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const endRef=useRef(null);

  useEffect(()=>{if(endRef.current)endRef.current.scrollIntoView({behavior:"smooth"})},[msgs]);

  const send=async()=>{
    if(!input.trim()||loading)return;
    const txt=input.trim();setInput("");
    setMsgs(m=>[...m,{role:"user",text:txt}]);setLoading(true);
    try{
      const ctx=trip?`Podróż do ${trip.destination||"?"} (${trip.startDate||"?"}–${trip.endDate||"?"}). Waluta: ${trip.currency}. Miejsca: ${trip.places.map(p=>p.name).join(", ")||"brak"}.`:"";
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:`Jesteś ekspertem od podróży. Odpowiadaj po polsku, konkretnie, z emoji. ${ctx}`,
          messages:[...msgs.filter(m=>m.role==="user").map(m=>({role:"user",content:m.text})),{role:"user",content:txt}]})});
      const data=await res.json();
      setMsgs(m=>[...m,{role:"assistant",text:data.content?.map(c=>c.text||"").join("")||"Przepraszam, błąd."}]);
    }catch{setMsgs(m=>[...m,{role:"assistant",text:"⚠️ Błąd połączenia z AI."}])}
    setLoading(false);
  };

  return(
    <div style={s.aiO}><div style={s.aiP}>
      <div style={s.aiH}><span style={{fontSize:20}}>🤖 Asystent AI</span><button onClick={onClose} style={s.clB}>✕</button></div>
      <div style={s.aiM}>{msgs.map((m,i)=><div key={i} style={{...s.bbl,...(m.role==="user"?s.uB:s.aB)}}><div style={{whiteSpace:"pre-wrap",lineHeight:1.5}}>{m.text}</div></div>)}
        {loading&&<div style={{...s.bbl,...s.aB,color:"#94a3b8"}}>● ● ●</div>}
        <div ref={endRef}/>
      </div>
      <div style={s.aiR}><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Zapytaj..." style={s.aiI}/><button onClick={send} disabled={loading} style={s.snB}>➤</button></div>
    </div></div>
  );
}

/* ═══════════ MAIN APP ═══════════ */
export default function TravelPlanner() {
  const [trips,setTrips]=useState(()=>loadTrips());
  const [active,setActive]=useState(null);
  const [tab,setTab]=useState("Przegląd");
  const [form,setForm]=useState(null);
  const [edit,setEdit]=useState(null);
  const [showAI,setShowAI]=useState(false);

  useEffect(()=>{saveTrips(trips)},[trips]);

  const trip=trips.find(t=>t.id===active);
  const upTrip=useCallback((u)=>setTrips(p=>p.map(t=>t.id===active?{...t,...u}:t)),[active]);

  // ─── FORMS ───
  const TripForm=()=>{
    const [f,sF]=useState(edit||defaultTrip());
    const em=["✈️","🏖️","🏔️","🌍","🗼","🏛️","🎡","🚗","🛳️","🌴","🏕️","🎿"];
    const geocode=async(dest)=>{
      if(!dest.trim())return;
      try{const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dest)}&limit=1`);const d=await r.json();if(d[0])sF(prev=>({...prev,destLat:+d[0].lat,destLng:+d[0].lon}))}catch{}
    };
    return <div style={s.modal}><div style={s.mc}>
      <h3 style={s.fT}>{edit?"Edytuj":"Nowa"} podróż ✈️</h3>
      <div style={s.eR}>{em.map(e=><button key={e} onClick={()=>sF({...f,coverEmoji:e})} style={{...s.eB,...(f.coverEmoji===e?s.eBA:{})}}>{e}</button>)}</div>
      <input placeholder="Nazwa podróży" value={f.name} onChange={e=>sF({...f,name:e.target.value})} style={s.inp}/>
      <div style={{position:"relative"}}>
        <input placeholder="Cel (miasto/kraj)" value={f.destination} onChange={e=>sF({...f,destination:e.target.value})} onBlur={e=>geocode(e.target.value)} style={s.inp}/>
        {f.destLat&&<div style={{position:"absolute",right:12,top:12,fontSize:11,color:"#22c55e",fontWeight:600}}>✅ GPS</div>}
      </div>
      <div style={s.row}><input type="date" value={f.startDate} onChange={e=>sF({...f,startDate:e.target.value})} style={{...s.inp,flex:1}}/><input type="date" value={f.endDate} onChange={e=>sF({...f,endDate:e.target.value})} style={{...s.inp,flex:1}}/></div>
      <select value={f.currency} onChange={e=>sF({...f,currency:e.target.value})} style={s.inp}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</select>
      <div style={s.row}><button onClick={()=>{setForm(null);setEdit(null)}} style={s.b2}>Anuluj</button><button onClick={()=>{if(!f.name)return;if(edit)setTrips(p=>p.map(t=>t.id===f.id?f:t));else{setTrips(p=>[...p,f]);setActive(f.id)}setForm(null);setEdit(null)}} style={s.b1}>{edit?"Zapisz":"Utwórz"}</button></div>
    </div></div>;
  };

  const PlaceForm=()=>{
    const [f,sF]=useState(edit||{id:uid(),name:"",description:"",priority:"medium",visited:false,lat:null,lng:null});
    const [gq,sGq]=useState("");const [gr,sGr]=useState([]);const [gl,sGl]=useState(false);
    const geo=async()=>{if(!gq.trim())return;sGl(true);try{const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(gq)}&limit=4`);sGr(await r.json())}catch{}sGl(false)};
    return <div style={s.modal}><div style={s.mc}>
      <h3 style={s.fT}>📍 {edit?"Edytuj":"Dodaj"} miejsce</h3>
      <input placeholder="Nazwa" value={f.name} onChange={e=>sF({...f,name:e.target.value})} style={s.inp}/>
      <textarea placeholder="Opis" value={f.description} onChange={e=>sF({...f,description:e.target.value})} style={{...s.inp,minHeight:60}}/>
      <div style={{background:"#f8fafc",borderRadius:12,padding:12,marginBottom:10,border:"1px solid #e2e8f0"}}>
        <div style={{fontSize:12,fontWeight:600,color:"#64748b",marginBottom:8}}>📍 Lokalizacja</div>
        {f.lat?<div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:13,color:"#22c55e",fontWeight:600}}>✅ {f.lat.toFixed(4)}, {f.lng.toFixed(4)}</span><button onClick={()=>sF({...f,lat:null,lng:null})} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:12}}>✕</button></div>:
        <><div style={{display:"flex",gap:6}}><input value={gq} onChange={e=>sGq(e.target.value)} onKeyDown={e=>e.key==="Enter"&&geo()} placeholder="Szukaj..." style={{...s.inp,marginBottom:0,flex:1,fontSize:13}}/><button onClick={geo} disabled={gl} style={{background:"#e2e8f0",border:"none",padding:"10px 14px",borderRadius:10,cursor:"pointer",fontSize:14}}>{gl?"⏳":"🔍"}</button></div>
        {gr.length>0&&<div style={{marginTop:8}}>{gr.map((r,i)=><div key={i} onClick={()=>{sF({...f,lat:+r.lat,lng:+r.lon});sGr([])}} style={{padding:"8px 10px",cursor:"pointer",borderRadius:8,fontSize:12,background:"#fff",marginBottom:4,border:"1px solid #e2e8f0"}}><div style={{fontWeight:600}}>{r.display_name.split(",")[0]}</div><div style={{color:"#94a3b8",fontSize:11}}>{r.display_name.slice(0,80)}</div></div>)}</div>}</>}
      </div>
      <div style={s.pR}>{[["low","Niska ⬇️"],["medium","Średnia ➡️"],["high","Wysoka ⬆️"]].map(([v,l])=><button key={v} onClick={()=>sF({...f,priority:v})} style={{...s.pB,...(f.priority===v?s.pA:{})}}>{l}</button>)}</div>
      <div style={s.row}><button onClick={()=>{setForm(null);setEdit(null)}} style={s.b2}>Anuluj</button><button onClick={()=>{if(!f.name)return;upTrip({places:edit?trip.places.map(p=>p.id===f.id?f:p):[...trip.places,f]});setForm(null);setEdit(null)}} style={s.b1}>Zapisz</button></div>
    </div></div>;
  };

  const ExpenseForm=()=>{
    const [f,sF]=useState(edit||{id:uid(),name:"",amount:"",category:"Inne",date:new Date().toISOString().split("T")[0]});
    return <div style={s.modal}><div style={s.mc}>
      <h3 style={s.fT}>💰 {edit?"Edytuj":"Dodaj"} wydatek</h3>
      <input placeholder="Opis" value={f.name} onChange={e=>sF({...f,name:e.target.value})} style={s.inp}/>
      <input placeholder="Kwota" type="number" value={f.amount} onChange={e=>sF({...f,amount:e.target.value})} style={s.inp}/>
      <div style={s.cG}>{CATEGORIES.map(c=><button key={c} onClick={()=>sF({...f,category:c})} style={{...s.cB,...(f.category===c?{background:CAT_COLORS[c],color:"#fff"}:{})}}>{CAT_ICONS[c]} {c}</button>)}</div>
      <input type="date" value={f.date} onChange={e=>sF({...f,date:e.target.value})} style={s.inp}/>
      <div style={s.row}><button onClick={()=>{setForm(null);setEdit(null)}} style={s.b2}>Anuluj</button><button onClick={()=>{if(!f.name||!f.amount)return;upTrip({expenses:edit?trip.expenses.map(e=>e.id===f.id?{...f,amount:+f.amount}:e):[...trip.expenses,{...f,amount:+f.amount}]});setForm(null);setEdit(null)}} style={s.b1}>Zapisz</button></div>
    </div></div>;
  };

  const NoteForm=()=>{
    const [f,sF]=useState(edit||{id:uid(),title:"",content:"",date:new Date().toISOString().split("T")[0],photos:[]});
    return <div style={s.modal}><div style={s.mc}>
      <h3 style={s.fT}>📝 {edit?"Edytuj":"Dodaj"} notatkę</h3>
      <input placeholder="Tytuł" value={f.title} onChange={e=>sF({...f,title:e.target.value})} style={s.inp}/>
      <textarea placeholder="Treść..." value={f.content} onChange={e=>sF({...f,content:e.target.value})} style={{...s.inp,minHeight:100}}/>
      <div style={{fontSize:13,fontWeight:600,color:"#475569",marginBottom:8}}>📷 Zdjęcia</div>
      <PhotoUpload photos={f.photos||[]} onChange={photos=>sF({...f,photos})}/>
      <div style={{...s.row,marginTop:12}}><button onClick={()=>{setForm(null);setEdit(null)}} style={s.b2}>Anuluj</button><button onClick={()=>{if(!f.title)return;upTrip({notes:edit?trip.notes.map(n=>n.id===f.id?f:n):[...trip.notes,f]});setForm(null);setEdit(null)}} style={s.b1}>Zapisz</button></div>
    </div></div>;
  };

  const ItinForm=()=>{
    const [f,sF]=useState(edit||{id:uid(),day:"",title:"",items:[{time:"09:00",activity:""}]});
    const upI=(i,k,v)=>{const it=[...f.items];it[i]={...it[i],[k]:v};sF({...f,items:it})};
    return <div style={s.modal}><div style={s.mc}>
      <h3 style={s.fT}>🗓️ {edit?"Edytuj":"Dodaj"} plan dnia</h3>
      <input type="date" value={f.day} onChange={e=>sF({...f,day:e.target.value})} style={s.inp}/><input placeholder="Tytuł dnia" value={f.title} onChange={e=>sF({...f,title:e.target.value})} style={s.inp}/>
      <div style={{fontSize:13,fontWeight:600,color:"#475569",margin:"6px 0"}}>Aktywności:</div>
      {f.items.map((it,i)=><div key={i} style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
        <input type="time" value={it.time} onChange={e=>upI(i,"time",e.target.value)} style={{...s.inp,width:100,flex:"none"}}/>
        <input placeholder="Aktywność" value={it.activity} onChange={e=>upI(i,"activity",e.target.value)} style={{...s.inp,flex:1}}/>
        {f.items.length>1&&<button onClick={()=>sF({...f,items:f.items.filter((_,j)=>j!==i)})} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:16}}>✕</button>}
      </div>)}
      <button onClick={()=>sF({...f,items:[...f.items,{time:"",activity:""}]})} style={s.addB}>+ Aktywność</button>
      <div style={s.row}><button onClick={()=>{setForm(null);setEdit(null)}} style={s.b2}>Anuluj</button><button onClick={()=>{if(!f.day)return;upTrip({itinerary:(edit?trip.itinerary.map(d=>d.id===f.id?f:d):[...trip.itinerary,f]).sort((a,b)=>a.day.localeCompare(b.day))});setForm(null);setEdit(null)}} style={s.b1}>Zapisz</button></div>
    </div></div>;
  };

  /* ─── HOME ─── */
  if(!active) return(
    <div style={s.app}><style>{CSS}</style>
      <div style={s.home}>
        <div style={s.hero}><div style={s.hPat}/><div style={{position:"relative",zIndex:1}}>
          <div style={{fontSize:56,marginBottom:8,filter:"drop-shadow(0 4px 12px rgba(0,0,0,.3))"}}>🧭</div>
          <h1 style={s.hT}>Voyager</h1><p style={s.hS}>Twój osobisty planer podróży</p>
        </div></div>
        <div style={{padding:"24px 16px"}}>
          {trips.length===0?<div style={s.empty}>
            <div style={{fontSize:64,marginBottom:16}}>🌎</div>
            <h2 style={{color:"#1e293b",fontFamily:"'Playfair Display',serif",fontSize:22,margin:0}}>Brak podróży</h2>
            <p style={{color:"#64748b",margin:"8px 0 24px"}}>Zaplanuj swoją pierwszą przygodę!</p>
            <button onClick={()=>{setForm("trip");setEdit(null)}} style={s.b1}>+ Zaplanuj podróż</button>
          </div>:<>
            <div style={s.sH}><h2 style={s.sT}>Moje podróże</h2><button onClick={()=>{setForm("trip");setEdit(null)}} style={s.bSm}>+ Nowa</button></div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>{trips.map((t,i)=>{
              const d=t.startDate&&t.endDate?Math.ceil((new Date(t.endDate)-new Date(t.startDate))/864e5)+1:0;
              const sp=t.expenses.reduce((s,e)=>s+e.amount,0);
              return <div key={t.id} onClick={()=>{setActive(t.id);setTab("Przegląd")}} style={{...s.card,animationDelay:`${i*.1}s`}}>
                <div style={{fontSize:36,marginBottom:8}}>{t.coverEmoji}</div>
                <h3 style={{fontSize:18,fontWeight:700,fontFamily:"'Playfair Display',serif",margin:"4px 0"}}>{t.name||"Bez nazwy"}</h3>
                <p style={{color:"#64748b",fontSize:14,marginBottom:8}}>{t.destination||"Cel nieznany"}</p>
                <div style={{display:"flex",gap:14,color:"#94a3b8",fontSize:13,flexWrap:"wrap"}}>{d>0&&<span>📅 {d} dni</span>}<span>📍 {t.places.length}</span>{sp>0&&<span>💰 {sp.toFixed(0)} {t.currency}</span>}</div>
              </div>})}</div>
          </>}
        </div>
      </div>
      {form==="trip"&&<TripForm/>}
    </div>
  );

  /* ─── DETAIL ─── */
  const days=trip.startDate&&trip.endDate?Math.ceil((new Date(trip.endDate)-new Date(trip.startDate))/864e5)+1:0;
  const spent=trip.expenses.reduce((s,e)=>s+e.amount,0);
  const byCat=CATEGORIES.map(c=>({c,t:trip.expenses.filter(e=>e.category===c).reduce((s,e)=>s+e.amount,0)})).filter(x=>x.t>0);

  const TabContent=()=>{switch(tab){
    case "Przegląd": return <div style={s.tc}>
      <div style={s.oG}>{[["📍",trip.places.length,"Miejsc"],["📅",days||"—","Dni"],["💰",spent.toFixed(0),trip.currency],["📝",trip.notes.length,"Notatek"]].map(([i,v,l],k)=>
        <div key={k} style={s.stat}><div style={{fontSize:28}}>{i}</div><div style={s.stV}>{v}</div><div style={s.stL}>{l}</div></div>)}</div>
      <WeatherWidget lat={trip.destLat} lng={trip.destLng} destination={trip.destination}/>
      {trip.places.some(p=>p.lat)&&<div style={{...s.oS,padding:0,overflow:"hidden",cursor:"pointer",marginBottom:12}} onClick={()=>setTab("Mapa")}>
        <div style={{height:180,position:"relative"}}><MiniMap trip={trip}/><div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,.6))",padding:"20px 16px 12px",color:"#fff",fontSize:13,fontWeight:600}}>🗺️ {trip.places.filter(p=>p.lat).length} miejsc na mapie</div></div>
      </div>}
      {trip.places.length>0&&<div style={s.oS}><h3 style={s.oST}>🎯 Do odwiedzenia</h3>{trip.places.filter(p=>!p.visited).slice(0,3).map(p=><div key={p.id} style={{padding:"8px 0",borderBottom:"1px solid #f1f5f9",fontSize:14,color:"#475569"}}>{p.name}</div>)}</div>}
      {byCat.length>0&&<div style={s.oS}><h3 style={s.oST}>📊 Wydatki</h3>{byCat.map(({c,t})=><div key={c} style={s.bR}><span style={s.bL}>{CAT_ICONS[c]} {c}</span><div style={s.bT}><div style={{...s.bF,width:`${(t/spent)*100}%`,background:CAT_COLORS[c]}}/></div><span style={s.bV}>{t.toFixed(0)}</span></div>)}</div>}
      <div style={{display:"flex",gap:12,marginTop:20}}>
        <button onClick={()=>{setEdit(trip);setForm("trip")}} style={s.bO}>✏️ Edytuj</button>
        <button onClick={()=>{if(confirm("Usunąć?")){setTrips(p=>p.filter(t=>t.id!==active));setActive(null)}}} style={{...s.bO,borderColor:"#ef4444",color:"#ef4444"}}>🗑️ Usuń</button>
      </div>
    </div>;
    case "Mapa": return <TripMap trip={trip} onAddPlace={p=>upTrip({places:[...trip.places,p]})}/>;
    case "Miejsca": return <div style={s.tc}>
      <button onClick={()=>{setForm("place");setEdit(null)}} style={s.b1}>+ Dodaj miejsce</button>
      {!trip.places.length?<div style={s.eT}><div style={{fontSize:48}}>📍</div><p>Dodaj miejsca lub użyj Mapy</p></div>:
      <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:16}}>{trip.places.map(p=>
        <div key={p.id} style={s.plC}>
          <div style={{display:"flex",gap:12,alignItems:"flex-start",flex:1}}>
            <button onClick={()=>upTrip({places:trip.places.map(x=>x.id===p.id?{...x,visited:!x.visited}:x)})} style={{...s.chk,...(p.visited?s.chkO:{})}}>{p.visited&&"✓"}</button>
            <div><div style={{fontSize:15,fontWeight:600,textDecoration:p.visited?"line-through":"none",opacity:p.visited?.5:1}}>{p.name}</div>
              {p.description&&<div style={{fontSize:13,color:"#64748b",marginTop:2}}>{p.description}</div>}
              <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                <span style={{...s.tag,background:p.priority==="high"?"#fef2f2":p.priority==="medium"?"#fffbeb":"#f0fdf4",color:PRI_COLORS[p.priority]}}>{p.priority==="high"?"⬆️ Wysoka":p.priority==="medium"?"➡️ Średnia":"⬇️ Niska"}</span>
                {p.lat&&<span style={{...s.tag,background:"#eff6ff",color:"#3b82f6"}}>🗺️</span>}
              </div></div>
          </div>
          <div style={s.acts}><button onClick={()=>{setEdit(p);setForm("place")}} style={s.iB}>✏️</button><button onClick={()=>upTrip({places:trip.places.filter(x=>x.id!==p.id)})} style={s.iB}>🗑️</button></div>
        </div>)}</div>}
    </div>;
    case "Plan dnia": return <div style={s.tc}>
      <button onClick={()=>{setForm("itin");setEdit(null)}} style={s.b1}>+ Dodaj plan dnia</button>
      {!trip.itinerary.length?<div style={s.eT}><div style={{fontSize:48}}>🗓️</div><p>Zaplanuj dni</p></div>:
      <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:16}}>{trip.itinerary.map(d=>
        <div key={d.id} style={s.dC}><div style={s.dH}><div><div style={{fontSize:14,fontWeight:700,color:"#1e3a5f",textTransform:"capitalize"}}>{new Date(d.day+"T12:00:00").toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"long"})}</div>{d.title&&<div style={{fontSize:13,color:"#64748b",marginTop:2}}>{d.title}</div>}</div>
          <div style={s.acts}><button onClick={()=>{setEdit(d);setForm("itin")}} style={s.iB}>✏️</button><button onClick={()=>upTrip({itinerary:trip.itinerary.filter(x=>x.id!==d.id)})} style={s.iB}>🗑️</button></div></div>
          <div style={{padding:"12px 16px"}}>{d.items.filter(x=>x.activity).map((it,i)=>
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid #f8fafc"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#1e3a5f",flexShrink:0}}/><div style={{fontSize:13,fontWeight:600,color:"#1e3a5f",fontFamily:"monospace",width:50}}>{it.time}</div><div style={{fontSize:14,color:"#475569"}}>{it.activity}</div>
            </div>)}</div>
        </div>)}</div>}
    </div>;
    case "Budżet": return <div style={s.tc}>
      <div style={{background:"#fff",borderRadius:14,padding:20,marginBottom:16,textAlign:"center",border:"1px solid rgba(0,0,0,.06)"}}>
        <div style={{fontSize:14,color:"#64748b"}}>Łączne wydatki</div>
        <div style={{fontSize:32,fontWeight:700,fontFamily:"monospace"}}>{spent.toFixed(2)} <span style={{fontSize:18,color:"#94a3b8"}}>{trip.currency}</span></div>
      </div>
      <button onClick={()=>{setForm("expense");setEdit(null)}} style={s.b1}>+ Dodaj wydatek</button>
      {!trip.expenses.length?<div style={s.eT}><div style={{fontSize:48}}>💰</div><p>Śledź wydatki</p></div>:
      <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:16}}>{[...trip.expenses].sort((a,b)=>b.date.localeCompare(a.date)).map(e=>
        <div key={e.id} style={s.exC}><div style={{display:"flex",alignItems:"center",gap:12,flex:1}}>
          <div style={{...s.cD,background:CAT_COLORS[e.category]}}>{CAT_ICONS[e.category]}</div>
          <div><div style={{fontSize:14,fontWeight:600}}>{e.name}</div><div style={{fontSize:12,color:"#94a3b8"}}>{e.category} • {e.date}</div></div></div>
          <div style={{fontWeight:700,fontSize:15,fontFamily:"monospace",whiteSpace:"nowrap"}}>{e.amount.toFixed(2)}</div>
          <div style={s.acts}><button onClick={()=>{setEdit(e);setForm("expense")}} style={s.iB}>✏️</button><button onClick={()=>upTrip({expenses:trip.expenses.filter(x=>x.id!==e.id)})} style={s.iB}>🗑️</button></div>
        </div>)}</div>}
    </div>;
    case "Notatki": return <div style={s.tc}>
      <button onClick={()=>{setForm("note");setEdit(null)}} style={s.b1}>+ Dodaj notatkę</button>
      {!trip.notes.length?<div style={s.eT}><div style={{fontSize:48}}>📝</div><p>Zapisuj myśli i zdjęcia</p></div>:
      <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:16}}>{trip.notes.map(n=>
        <div key={n.id} style={s.nC}>
          {n.photos&&n.photos.length>0&&<div style={{display:"flex",overflowX:"auto",gap:2}}>{n.photos.map((p,i)=><img key={i} src={p.data} style={{width:n.photos.length===1?"100%":200,height:180,objectFit:"cover",flexShrink:0}} alt=""/>)}</div>}
          <div style={{padding:16}}>
            <h4 style={{fontSize:16,fontWeight:700,fontFamily:"'Playfair Display',serif",marginBottom:6}}>{n.title}</h4>
            <p style={{fontSize:14,color:"#475569",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{n.content}</p>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
              <span style={{fontSize:12,color:"#94a3b8"}}>{n.date}{n.photos?.length?` • 📷 ${n.photos.length}`:""}</span>
              <div style={s.acts}><button onClick={()=>{setEdit(n);setForm("note")}} style={s.iB}>✏️</button><button onClick={()=>upTrip({notes:trip.notes.filter(x=>x.id!==n.id)})} style={s.iB}>🗑️</button></div>
            </div>
          </div>
        </div>)}</div>}
    </div>;
    default: return null;
  }};

  return(
    <div style={s.app}><style>{CSS}</style>
      <div style={s.dHd}>
        <button onClick={()=>setActive(null)} style={s.back}>← Powrót</button>
        <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:28}}>{trip.coverEmoji}</span><div><h2 style={s.dT}>{trip.name}</h2><p style={s.dD}>{trip.destination}{trip.startDate&&` • ${trip.startDate} → ${trip.endDate}`}</p></div></div>
        <button onClick={()=>setShowAI(true)} style={s.aiTB}>🤖 AI</button>
      </div>
      <div style={s.tBar}>{TABS.map(t=><button key={t} onClick={()=>setTab(t)} style={{...s.tBtn,...(tab===t?s.tA:{})}}><span>{ICONS[t]}</span><span>{t}</span></button>)}</div>
      <TabContent/>
      <button onClick={()=>setShowAI(true)} style={s.fab}>🤖</button>
      {form==="trip"&&<TripForm/>}{form==="place"&&<PlaceForm/>}{form==="expense"&&<ExpenseForm/>}{form==="note"&&<NoteForm/>}{form==="itin"&&<ItinForm/>}
      {showAI&&<AIChat trip={trip} onClose={()=>setShowAI(false)}/>}
    </div>
  );
}

/* ═══════════ STYLES ═══════════ */
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes cardIn{from{opacity:0;transform:scale(.95) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
.leaflet-container{font-family:'DM Sans',sans-serif!important}`;

const ms={sw:{position:"absolute",top:12,left:12,right:12,zIndex:1000},sr:{display:"flex",gap:6},
si:{flex:1,padding:"12px 14px",border:"none",borderRadius:12,fontSize:14,fontFamily:"'DM Sans',sans-serif",boxShadow:"0 2px 16px rgba(0,0,0,.15)",outline:"none",background:"#fff"},
sb:{padding:"12px 20px",background:"linear-gradient(135deg,#1e3a5f,#2d5a8a)",color:"#fff",border:"none",borderRadius:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13,boxShadow:"0 2px 12px rgba(0,0,0,.15)"},
dd:{background:"#fff",borderRadius:12,marginTop:6,boxShadow:"0 4px 24px rgba(0,0,0,.15)",overflow:"hidden",maxHeight:260,overflowY:"auto"},
di:{padding:"12px 14px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:10},
da:{background:"#10b981",color:"#fff",border:"none",padding:"5px 14px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,whiteSpace:"nowrap",flexShrink:0},
mc:{height:"calc(100vh - 180px)",minHeight:420,width:"100%",background:"#e2e8f0"},
cb:{position:"absolute",bottom:80,left:12,right:12,background:"#fff",borderRadius:16,padding:16,boxShadow:"0 4px 28px rgba(0,0,0,.18)",zIndex:1000,maxWidth:360},
ci:{width:"100%",padding:"10px 12px",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:14,fontFamily:"'DM Sans',sans-serif",marginBottom:8,outline:"none"},
ca:{width:"100%",padding:"11px",background:"linear-gradient(135deg,#1e3a5f,#2d5a8a)",color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13},
lg:{position:"absolute",bottom:16,left:12,background:"rgba(255,255,255,.95)",borderRadius:10,padding:"8px 14px",display:"flex",gap:14,boxShadow:"0 2px 10px rgba(0,0,0,.1)",zIndex:1000,fontSize:11,fontWeight:600},
li:{display:"flex",alignItems:"center",gap:4,color:"#475569"},ld:{width:10,height:10,borderRadius:"50%",border:"2px solid #fff",boxShadow:"0 1px 3px rgba(0,0,0,.2)"},
ct:{position:"absolute",bottom:16,right:12,background:"rgba(255,255,255,.95)",borderRadius:10,padding:"8px 14px",boxShadow:"0 2px 10px rgba(0,0,0,.1)",zIndex:1000,fontSize:12,fontWeight:700,color:"#1e3a5f"},
ht:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"rgba(255,255,255,.92)",borderRadius:14,padding:"16px 24px",boxShadow:"0 2px 16px rgba(0,0,0,.1)",zIndex:999,fontSize:14,color:"#64748b",fontWeight:500,textAlign:"center",pointerEvents:"none"}};

const s={
app:{fontFamily:"'DM Sans',sans-serif",background:"linear-gradient(135deg,#f8fafc,#f1f5f9,#e8eef5)",minHeight:"100vh",color:"#1e293b",position:"relative"},
hero:{background:"linear-gradient(135deg,#0f172a,#1e3a5f 50%,#1a4066)",padding:"48px 24px 56px",textAlign:"center",position:"relative",overflow:"hidden"},
hPat:{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 20% 50%,rgba(56,189,248,.12),transparent 50%),radial-gradient(circle at 80% 20%,rgba(251,191,36,.1),transparent 40%)"},
hT:{fontFamily:"'Playfair Display',serif",fontSize:38,fontWeight:700,color:"#fff",letterSpacing:"-.5px",margin:"4px 0"},hS:{color:"rgba(255,255,255,.6)",fontSize:15},
home:{maxWidth:600,margin:"0 auto"},empty:{textAlign:"center",padding:"48px 24px"},
sH:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16},sT:{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:600},
bSm:{background:"#1e3a5f",color:"#fff",border:"none",padding:"8px 16px",borderRadius:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13},
card:{background:"#fff",borderRadius:16,padding:20,cursor:"pointer",border:"1px solid rgba(0,0,0,.06)",boxShadow:"0 2px 12px rgba(0,0,0,.04)",animation:"cardIn .5s ease both"},
dHd:{background:"linear-gradient(135deg,#0f172a,#1e3a5f)",padding:"16px 16px 20px",display:"flex",flexDirection:"column",gap:12,position:"relative"},
back:{background:"none",border:"none",color:"rgba(255,255,255,.7)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,alignSelf:"flex-start",padding:0},
dT:{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#fff",margin:0},dD:{color:"rgba(255,255,255,.6)",fontSize:13,margin:0},
aiTB:{position:"absolute",top:16,right:16,background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.2)",color:"#fff",padding:"6px 14px",borderRadius:20,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600},
tBar:{display:"flex",background:"#fff",borderBottom:"1px solid #e2e8f0",overflowX:"auto",padding:"0 4px",position:"sticky",top:0,zIndex:10},
tBtn:{flex:1,minWidth:"fit-content",background:"none",border:"none",padding:"14px 6px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,color:"#94a3b8",borderBottom:"2px solid transparent",display:"flex",alignItems:"center",justifyContent:"center",gap:4,whiteSpace:"nowrap",transition:"all .2s"},
tA:{color:"#1e3a5f",borderBottomColor:"#1e3a5f",fontWeight:700},
tc:{padding:"20px 16px",maxWidth:600,margin:"0 auto",animation:"fadeUp .3s ease"},
oG:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16},
stat:{background:"#fff",borderRadius:14,padding:"20px 16px",textAlign:"center",border:"1px solid rgba(0,0,0,.06)"},
stV:{fontSize:26,fontWeight:700,fontFamily:"'DM Mono',monospace"},stL:{fontSize:12,color:"#94a3b8",fontWeight:500,marginTop:2},
oS:{background:"#fff",borderRadius:14,padding:16,marginBottom:12,border:"1px solid rgba(0,0,0,.06)"},oST:{fontSize:15,fontWeight:700,marginBottom:12},
bR:{display:"flex",alignItems:"center",gap:10,marginBottom:10},bL:{fontSize:13,width:110,whiteSpace:"nowrap",color:"#475569"},
bT:{flex:1,height:8,background:"#f1f5f9",borderRadius:4,overflow:"hidden"},bF:{height:"100%",borderRadius:4,transition:"width .5s ease"},
bV:{fontSize:13,fontWeight:600,width:50,textAlign:"right",fontFamily:"'DM Mono',monospace"},
plC:{background:"#fff",borderRadius:12,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",border:"1px solid rgba(0,0,0,.06)"},
chk:{width:24,height:24,borderRadius:7,border:"2px solid #cbd5e1",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,fontWeight:700,color:"#fff",flexShrink:0,background:"none",marginTop:2},chkO:{background:"#10b981",borderColor:"#10b981"},
tag:{display:"inline-block",fontSize:11,padding:"2px 8px",borderRadius:6,fontWeight:600},
exC:{background:"#fff",borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:8,border:"1px solid rgba(0,0,0,.06)"},
cD:{width:40,height:40,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18},
dC:{background:"#fff",borderRadius:14,overflow:"hidden",border:"1px solid rgba(0,0,0,.06)"},
dH:{padding:16,display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderBottom:"1px solid #f1f5f9"},
nC:{background:"#fff",borderRadius:14,overflow:"hidden",border:"1px solid rgba(0,0,0,.06)"},
acts:{display:"flex",gap:4,flexShrink:0},iB:{background:"none",border:"none",cursor:"pointer",fontSize:16,padding:4},
eT:{textAlign:"center",padding:"40px 20px",color:"#94a3b8"},
modal:{position:"fixed",inset:0,background:"rgba(15,23,42,.6)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16},
mc:{background:"#fff",borderRadius:20,padding:24,width:"100%",maxWidth:440,maxHeight:"85vh",overflowY:"auto",animation:"fadeUp .3s ease"},
fT:{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,marginBottom:16,textAlign:"center"},
inp:{width:"100%",padding:"12px 14px",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:14,fontFamily:"'DM Sans',sans-serif",marginBottom:10,outline:"none",background:"#fafbfc",color:"#1e293b"},
row:{display:"flex",gap:10,marginTop:8},
eR:{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12,justifyContent:"center"},
eB:{width:40,height:40,borderRadius:10,border:"2px solid #e2e8f0",background:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},
eBA:{borderColor:"#1e3a5f",background:"#f0f7ff"},
pR:{display:"flex",gap:8,marginBottom:10},pB:{flex:1,padding:10,border:"1.5px solid #e2e8f0",borderRadius:10,background:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600},pA:{borderColor:"#1e3a5f",background:"#f0f7ff"},
cG:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10},
cB:{padding:"10px 8px",border:"1.5px solid #e2e8f0",borderRadius:10,background:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,textAlign:"center"},
addB:{background:"none",border:"1.5px dashed #cbd5e1",color:"#64748b",padding:10,borderRadius:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,width:"100%",marginBottom:10},
b1:{background:"linear-gradient(135deg,#1e3a5f,#2d5a8a)",color:"#fff",border:"none",padding:"13px 24px",borderRadius:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:14,width:"100%",boxShadow:"0 4px 14px rgba(30,58,95,.2)"},
b2:{background:"#f1f5f9",color:"#475569",border:"none",padding:"13px 24px",borderRadius:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,flex:1},
bO:{background:"none",border:"1.5px solid #e2e8f0",color:"#475569",padding:"11px 20px",borderRadius:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,flex:1},
fab:{position:"fixed",bottom:24,right:24,width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,#1e3a5f,#2d5a8a)",border:"none",fontSize:24,cursor:"pointer",boxShadow:"0 6px 24px rgba(30,58,95,.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50},
aiO:{position:"fixed",inset:0,background:"rgba(15,23,42,.7)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"},
aiP:{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:500,height:"80vh",display:"flex",flexDirection:"column",animation:"fadeUp .3s ease"},
aiH:{padding:"16px 20px",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",fontWeight:700},
clB:{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#94a3b8"},
aiM:{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12},
bbl:{padding:"12px 16px",borderRadius:16,maxWidth:"85%",fontSize:14,lineHeight:1.5},
uB:{background:"#1e3a5f",color:"#fff",alignSelf:"flex-end",borderBottomRightRadius:4},
aB:{background:"#f1f5f9",color:"#1e293b",alignSelf:"flex-start",borderBottomLeftRadius:4},
aiR:{padding:"12px 16px",borderTop:"1px solid #e2e8f0",display:"flex",gap:8},
aiI:{flex:1,padding:"12px 14px",border:"1.5px solid #e2e8f0",borderRadius:12,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none",background:"#fafbfc"},
snB:{background:"linear-gradient(135deg,#1e3a5f,#2d5a8a)",color:"#fff",border:"none",width:44,height:44,borderRadius:12,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"},
};
