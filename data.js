/*
 * DATI PdRugby — V0.9
 * Database master.
 * V0.9 aggiunge contenitori annidati e materiali con stato nuovo/usato.
 */
const IMG = {
  logo: "images/logo/logo_PDR.png",
  players: {
    nicolo:"images/giocatori/nicolo.jpg", nando:"images/giocatori/nando.jpg",
    sante:"images/giocatori/sante.jpg", paolino:"images/giocatori/paolino.jpg",
    hassan:"images/giocatori/hassan.jpg", ahmed:"images/giocatori/ahmed.jpg",
    nicolas:"images/giocatori/nicolas.jpg", rambo:"images/giocatori/rambo.jpg",
    luca:"images/giocatori/luca.jpg", emina:"images/giocatori/emina.jpg",
    massimo:"images/giocatori/massimo.jpg", rosa:"images/giocatori/rosa.jpg",
    francesco:"images/giocatori/francesco.jpg", amine:"images/giocatori/amine.jpg",
    matteo:"images/giocatori/matteo.jpg"
  },
  chairs: { attack:"images/carrozzine/attacco.jpg", defense:"images/carrozzine/difesa.jpg" },
  bags: {
    blue:"images/borse/sacca_blu_materiale.jpg", black:"images/borse/sacca_nera.jpg", grey:"images/borse/sacca_grigia.jpg"
  },
  wheels: {
    red25:"images/ruote/25_attacco_rosse.jpg", red24:"images/ruote/24_attacco_rosse.jpg",
    tubular24:"images/ruote/24-tubolari.jpg", grey25:"images/ruote/25_difesa_grigie.jpg"
  }
};

const DATA = {
  players: [
    {id:"P001",number:1,name:"Fernando Gabriel Zurlo",role:"Attacco",avatar:IMG.players.nando,wheelchair:{model:"Da completare",photo:IMG.chairs.attack},wheels:{diameter:'25"',cover:"Raggi rosse (IRC)",spoke:"Corto",handrim:"Da completare"},accessories:[],bag:{color:"Nera",photo:IMG.bags.black,contents:["2× Ruote"]},notes:""},
    {id:"P002",number:2,name:"Ahmed Raourahi",role:"Attacco",avatar:IMG.players.ahmed,wheelchair:{model:"Da completare",photo:IMG.chairs.attack},wheels:{diameter:'25"',cover:"Raggi rosse (IRC)",spoke:"Corto",handrim:"Da completare"},accessories:[],bag:{color:"Nera",photo:IMG.bags.black,contents:["2× Ruote"]},notes:""},
    {id:"P003",number:3,name:"Sante Pinton",role:"Difesa",avatar:IMG.players.sante,wheelchair:{model:"Da completare",photo:IMG.chairs.defense},wheels:{diameter:'24"',cover:"Raggi rosse (IRC)",spoke:"Corto",handrim:"Da completare"},accessories:[],bag:{color:"Nera",photo:IMG.bags.black,contents:["1× Ruota (?)"]},notes:"Quantità ruote da verificare."},
    {id:"P005",number:5,name:"Nicolas Battistella",role:"Difesa",avatar:IMG.players.nicolas,wheelchair:{model:"Da completare",photo:IMG.chairs.defense},wheels:{diameter:'24"',cover:"Raggi rosse (IRC)",spoke:"Corto",handrim:"Da completare"},accessories:[],bag:{color:"Nera",photo:IMG.bags.black,contents:["1× Ruota (?)"]},notes:"Quantità ruote da verificare."},
    {id:"P006",number:6,name:"Nicolò Toscano",role:"Attacco",avatar:IMG.players.nicolo,wheelchair:{model:"Da completare",photo:IMG.chairs.attack},wheels:{diameter:'25"',cover:"Raggi rosse (IRC)",spoke:"Corto",handrim:"Da completare"},accessories:[],bag:{color:"Nera",photo:IMG.bags.black,contents:["2× Ruote","Sacchetto Mercedes","Pece"]},notes:""},
    {id:"P007",number:7,name:"Paolo Roberto Sacerdoti",role:"Difesa",avatar:IMG.players.paolino,wheelchair:{model:"Da completare",photo:IMG.chairs.defense},wheels:{diameter:'25"',cover:"Raggi rosse (IRC)",spoke:"Corto",handrim:"Da completare"},accessories:[],bag:{color:"Nera",photo:IMG.bags.black,contents:["2× Ruote","Sacchetto Mercedes","Pece"]},notes:""},
    {id:"P008",number:8,name:"Massimo Girardello",role:"Difesa",avatar:IMG.players.massimo,wheelchair:{model:"Da completare",photo:IMG.chairs.attack},wheels:{diameter:'25"',cover:"Raggi rosse (IRC)",spoke:"Corto",handrim:"Da completare"},accessories:[],bag:{color:"Nera",photo:IMG.bags.black,contents:["2× Ruote","Sacchetto Mercedes","Pece"]},notes:""},
    {id:"P010",number:10,name:"Hassan",role:"Difesa",avatar:IMG.players.hassan,wheelchair:{model:"Da completare",photo:IMG.chairs.defense},wheels:{diameter:'25"',cover:"Raggi grigie (Kenda)",spoke:"Lungo",handrim:"Da completare"},accessories:[],bag:{color:"Nera",photo:IMG.bags.black,contents:["2× Ruote"]},notes:""},
    {id:"P011",number:11,name:'Stefano "Rambo" Franchin',role:"Difesa",avatar:IMG.players.rambo,wheelchair:{model:"Da completare",photo:IMG.chairs.defense},wheels:{diameter:'25"',cover:"Raggi grigie (Kenda)",spoke:"Lungo",handrim:"Da completare"},accessories:[],bag:{color:"Nera",photo:IMG.bags.black,contents:["2× Ruote"]},notes:""},
    {id:"P012",number:12,name:"Luca Brugnolaro",role:"Difesa",avatar:IMG.players.luca,wheelchair:{model:"Da completare",photo:IMG.chairs.defense},wheels:{diameter:'25"',cover:"Raggi grigie (Kenda)",spoke:"Lungo",handrim:"Da completare"},accessories:[],bag:{color:"Nera",photo:IMG.bags.black,contents:["2× Ruote"]},notes:""},
    {id:"P013",number:13,name:"Emina Coric",role:"Difesa",avatar:IMG.players.emina,wheelchair:{model:"Da completare",photo:IMG.chairs.defense},wheels:{diameter:'25"',cover:"Raggi grigie (Kenda)",spoke:"Lungo",handrim:"Da completare"},accessories:[],bag:{color:"Nera",photo:IMG.bags.black,contents:["2× Ruote"]},notes:""},
    {id:"P020",number:20,name:"Rozalia Bellini",role:"Difesa",avatar:IMG.players.rosa,wheelchair:{model:"Da completare",photo:IMG.chairs.defense},wheels:{diameter:'25"',cover:"Raggi grigie (Kenda)",spoke:"Lungo",handrim:"Da completare"},accessories:[],bag:{color:"Grigia",photo:IMG.bags.grey,contents:["2× Ruote"]},notes:""},
    {id:"P021",number:21,name:"Francesco Bettella",role:"Difesa",avatar:IMG.players.francesco,wheelchair:{model:"Da completare",photo:IMG.chairs.defense},wheels:{diameter:'25"',cover:"Raggi grigie (Kenda)",spoke:"Lungo",handrim:"Da completare"},accessories:[],bag:{color:"Grigia",photo:IMG.bags.grey,contents:["2× Ruote"]},notes:""},
    {id:"P022",number:22,name:"Amine H.",role:"Difesa",avatar:IMG.players.amine,wheelchair:{model:"Da completare",photo:IMG.chairs.defense},wheels:{diameter:'25"',cover:"Raggi grigie (Kenda)",spoke:"Lungo",handrim:"Da completare"},accessories:[],bag:{color:"Nera",photo:IMG.bags.black,contents:["2× Ruote"]},notes:""},
    {id:"P023",number:23,name:"-",role:"Difesa",avatar:IMG.players.matteo,wheelchair:{model:"Da completare",photo:IMG.chairs.defense},wheels:{diameter:'25"',cover:"Raggi grigie (Kenda)",spoke:"Lungo",handrim:"Da completare"},accessories:[],bag:{color:"Nera",photo:IMG.bags.black,contents:["2× Ruote"]},notes:""}
  ],
  containers: [
    {id:"C001",name:"Sacca blu materiale",type:"Sacca",parent:null,photo:IMG.bags.blue},
    {id:"C002",name:"Magazzino",type:"Locale",parent:null,photo:""},
    {id:"C003",name:"Cesta",type:"Cesta",parent:null,photo:""},
    {id:"C004",name:"Cassetta attrezzi",type:"Cassetta",parent:null,photo:""},
    {id:"C005",name:"Sacca nera ruote",type:"Sacca",parent:null,photo:IMG.bags.black},
    {id:"C006",name:"Sacca grigia ruote",type:"Sacca",parent:null,photo:IMG.bags.grey},
    {id:"C007",name:"Sacca Errea Rossa",type:"Sacca",parent:null,photo:""},
    {id:"C008",name:"Sacchetto azzurro FINP",type:"Sacchetto",parent:"C007",photo:"",note:"10 camere 24\""},
    {id:"C009",name:"Sacchetto trasparente 25×24\"",type:"Sacchetto",parent:"C007",photo:"",note:"25 camere 24\""},
    {id:"C010",name:"Sacchetto giallo",type:"Sacchetto",parent:"C007",photo:"",note:"5 camere 25\""},
    {id:"C011",name:"Sacchetto trasparente 15×25\"",type:"Sacchetto",parent:"C007",photo:"",note:"15 camere 25\""},
    {id:"C012",name:"Sacca Italia Blu",type:"Sacca",parent:null,photo:""},
    {id:"C013",name:"Sacchetto giallo fluo",type:"Sacchetto",parent:"C012",photo:"",note:"5 camere 24\" con toppe"},
    {id:"C014",name:"Sacchetto blu scuro FINP",type:"Sacchetto",parent:"C012",photo:"",note:"22 camere 25\" nuove"},
    {id:"C015",name:"Sacchetto arancione scout",type:"Sacchetto",parent:"C012",photo:""}
  ],
  materials: [
    ["M001","Camera d'aria","Camera",'24"',"Nuova"],
    ["M002","Camera d'aria","Camera",'24"',"Con toppe"],
    ["M003","Camera d'aria","Camera",'25"',"Con toppe"],
    ["M004","Camera d'aria","Camera",'25"',"Nuova"],
    ["M005","Tubolare","Tubolare",'24"',""],
    ["M006","Tubolare","Tubolare",'25"',""],
    ["M007","Copertoncino","Copertoncino",'24"',"Rosso"],
    ["M008","Copertoncino","Copertoncino",'25"',"Rosso"],
    ["M009","Copertoncino","Copertoncino",'25"',"Grigio"],
    ["M010","Kit riparazione","Attrezzatura","",""],
    ["M011","Striscione Bettson","Striscioni","",""],
    ["M012","Striscione PD","Striscioni","",""],
    ["M013","Bandiera Italia","Striscioni","",""],
    ["M014","Cinghia","Fissaggio","",""],
    ["M015","Ruotino","Ricambio","","Nuovo"],
    ["M016","Ruotino","Ricambio","","Usato"],
    ["M017","Perno","Ricambio","","Piccolo"],
    ["M018","Perno","Ricambio","","Lungo"],
    ["M019","Scotch nero","Fissaggio","",""],
    ["M020","Scotch grigio","Fissaggio","",""],
    ["M021","Scotch carta","Fissaggio","",""],
    ["M022","Pelvi-lock intero","Accessorio","",""],
    ["M023","Scotch carta alto","Fissaggio","",""],
    ["M024","Scotch vetroresina","Fissaggio","",""],
    ["M025","Fascette sedile biga MEC","Fissaggio","",""],
    ["M026","Porta borracce","Accessorio","",""],
    ["M027","Ghiaccio spray","Manutenzione","",""],
    ["M028","Spruzzino PdR","Manutenzione","",""],
    ["M029","Routine","Ricambio","","", "Nuova"],
    ["M030","Routine","Ricambio","","", "Usata"]
  ].map(x=>({id:x[0],name:x[1],category:x[2],size:x[3],variant:x[4],condition:x[5]||""})),
  criticalThresholds: {
    M001:5,M002:2,M003:2,M004:5,M005:2,M006:2,M007:1,M008:1,M009:1,M010:2,M014:2,M015:1,M016:1,M017:2,M018:2,
    M019:1,M020:1,M021:2,M022:1,M023:1,M024:1,M025:2,M029:1,M030:1
  },
  stock: [
    ["C001","M001",23],["C001","M002",2],["C001","M003",5],["C001","M004",23],["C001","M005",3],["C001","M006",3],["C001","M007",3],["C001","M008",3],["C001","M009",1],["C001","M010",10],["C001","M011",1],["C001","M012",1],["C001","M013",1],["C001","M014",2],
    ["C003","M005",4],["C003","M006",6],["C004","M015",3],["C004","M016",3],["C004","M017",13],["C004","M018",5],["C002","M007",2],["C002","M008",2],["C002","M009",1],
    ["C008","M001",10],["C009","M001",25],["C010","M004",5],["C011","M004",15],["C007","M006",3],["C007","M021",3],
    ["C013","M002",5],["C014","M004",22],["C012","M005",6],["C012","M006",5],
    ["C015","M019",1],["C015","M020",2],["C015","M021",2],["C015","M022",2],["C015","M023",1],["C015","M024",1],["C015","M025",1],["C015","M010",5],
    ["C012","M029",2],["C012","M030",4]
  ].map(x=>({container:x[0],material:x[1],qty:x[2]})),
  looseItems: [
    {container:"C007",label:"Bandiere"},
    {container:"C007",label:"Striscioni"},
    {container:"C012",label:"Porta borracce"},
    {container:"C012",label:"Ghiaccio spray"},
    {container:"C012",label:"Spruzzino PdR"}
  ],
  wheels: [
    {id:"R001",size:'26"',assignment:"Hamed",note:""},{id:"R002",size:'26"',assignment:"Hamed",note:""},{id:"R003",size:'26"',assignment:"Hamed",note:""},{id:"R004",size:'26"',assignment:"Hamed",note:""},{id:"R005",size:'26"',assignment:"Hamed",note:"Una rotta"},
    {id:"R006",size:'25"',assignment:"",note:"Copertoncino grigio raggi"},{id:"R007",size:'24"',assignment:"Nando",note:"Copertoncino rosso Spinergy"},{id:"R008",size:'24"',assignment:"",note:"Copertoncino rosso Spinergy"},{id:"R009",size:'24"',assignment:"Niki",note:"Copertoncino rosso Spinergy - Niki vecchia"},{id:"R010",size:'24"',assignment:"",note:"Copertoncino rosso Spinergy"},{id:"R011",size:'24"',assignment:"",note:"Tubolare PDR 4"},{id:"R012",size:'25"',assignment:"",note:""},{id:"R013",size:'24"',assignment:"",note:""}
  ],
  personalBags:["Hassan","Francesco","Nando","Roza","Brugno","Sach","Sante","Nicolas","Ahmed","Max","Niki","Amine"].map((person,i)=>({id:`SP${String(i+1).padStart(3,"0")}`,person,color:(person==="Francesco"||person==="Roza")?"Grigia":"Nera",photo:(person==="Francesco"||person==="Roza")?IMG.bags.grey:IMG.bags.black,contents:[]}))
};
