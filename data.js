/*
 * DATI PdRugby — V0.6
 *
 * V0.6 mantiene compatibilità con il formato dati precedente.
 * app.js normalizza automaticamente:
 *   wheels.handrim: string -> oggetto strutturato
 *   accessories: array -> oggetto strutturato
 *
 * Immagini:
 * images/
 * ├── logo/
 * ├── giocatori/
 * ├── carrozzine/
 * ├── borse/
 * └── ruote/
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
  chairs: {
    attack:"images/carrozzine/attacco.jpg",
    defense:"images/carrozzine/difesa.jpg"
  },
  bags: {
    blue:"images/borse/sacca_blu_materiale.jpg",
    black:"images/borse/sacca_nera.jpg",
    grey:"images/borse/sacca_grigia.jpg"
  },
  wheels: {
    red25:"images/ruote/25_attacco_rosse.jpg",
    red24:"images/ruote/24_attacco_rosse.jpg",
    tubular24:"images/ruote/24-tubolari.jpg",
    grey25:"images/ruote/25_difesa_grigie.jpg"
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
    {id:"P010",number:10,name:"Hassan Khbadi",role:"Difesa",avatar:IMG.players.hassan,wheelchair:{model:"Da completare",photo:IMG.chairs.defense},wheels:{diameter:'25"',cover:"Raggi grigie (Kenda)",spoke:"Lungo",handrim:"Da completare"},accessories:[],bag:{color:"Nera",photo:IMG.bags.black,contents:["2× Ruote"]},notes:""},
    {id:"P011",number:11,name:'Stefano "Rambo" Franchin',role:"Difesa",avatar:IMG.players.rambo,wheelchair:{model:"Da completare",photo:IMG.chairs.defense},wheels:{diameter:'25"',cover:"Raggi grigie (Kenda)",spoke:"Lungo",handrim:"Da completare"},accessories:[],bag:{color:"Nera",photo:IMG.bags.black,contents:["2× Ruote"]},notes:""},
    {id:"P012",number:12,name:"Luca Brugnolaro",role:"Difesa",avatar:IMG.players.luca,wheelchair:{model:"Da completare",photo:IMG.chairs.defense},wheels:{diameter:'25"',cover:"Raggi grigie (Kenda)",spoke:"Lungo",handrim:"Da completare"},accessories:[],bag:{color:"Nera",photo:IMG.bags.black,contents:["2× Ruote"]},notes:""},
    {id:"P013",number:13,name:"Emina Coric",role:"Difesa",avatar:IMG.players.emina,wheelchair:{model:"Da completare",photo:IMG.chairs.defense},wheels:{diameter:'25"',cover:"Raggi grigie (Kenda)",spoke:"Lungo",handrim:"Da completare"},accessories:[],bag:{color:"Nera",photo:IMG.bags.black,contents:["2× Ruote"]},notes:""},
    {id:"P020",number:20,name:"Rozalia Bellini",role:"Difesa",avatar:IMG.players.rosa,wheelchair:{model:"Da completare",photo:IMG.chairs.defense},wheels:{diameter:'25"',cover:"Raggi grigie (Kenda)",spoke:"Lungo",handrim:"Da completare"},accessories:[],bag:{color:"Grigia",photo:IMG.bags.grey,contents:["2× Ruote"]},notes:""},
    {id:"P021",number:21,name:"Francesco Bettella",role:"Difesa",avatar:IMG.players.francesco,wheelchair:{model:"Da completare",photo:IMG.chairs.defense},wheels:{diameter:'25"',cover:"Raggi grigie (Kenda)",spoke:"Lungo",handrim:"Da completare"},accessories:[],bag:{color:"Grigia",photo:IMG.bags.grey,contents:["2× Ruote"]},notes:""},
    {id:"P022",number:22,name:"Amine Moukhariq",role:"Difesa",avatar:IMG.players.amine,wheelchair:{model:"Da completare",photo:IMG.chairs.defense},wheels:{diameter:'25"',cover:"Raggi grigie (Kenda)",spoke:"Lungo",handrim:"Da completare"},accessories:[],bag:{color:"Nera",photo:IMG.bags.black,contents:["2× Ruote"]},notes:""},
    {id:"P023",number:23,name:"Matteo Nicoletto",role:"Difesa",avatar:IMG.players.matteo,wheelchair:{model:"Da completare",photo:IMG.chairs.defense},wheels:{diameter:'25"',cover:"Raggi grigie (Kenda)",spoke:"Lungo",handrim:"Da completare"},accessories:[],bag:{color:"Nera",photo:IMG.bags.black,contents:["2× Ruote"]},notes:""}
  ],
  containers:[
    {id:"C001",name:"Sacca blu materiale",type:"Sacca",parent:null,photo:IMG.bags.blue},
    {id:"C002",name:"Magazzino",type:"Locale",parent:null,photo:""},
    {id:"C003",name:"Cesta",type:"Cesta",parent:null,photo:""},
    {id:"C004",name:"Cassetta attrezzi",type:"Cassetta",parent:null,photo:""},
    {id:"C005",name:"Sacca nera ruote",type:"Sacca",parent:null,photo:IMG.bags.black},
    {id:"C006",name:"Sacca grigia ruote",type:"Sacca",parent:null,photo:IMG.bags.grey}
  ],
  materials:[
    ["M001","Camera d'aria","Camera",'24"',"Nuova"],["M002","Camera d'aria","Camera",'24"',"Con toppe"],["M003","Camera d'aria","Camera",'25"',"Con toppe"],["M004","Camera d'aria","Camera",'25"',"Nuova"],
    ["M005","Tubolare","Tubolare",'24"',""],["M006","Tubolare","Tubolare",'25"',""],["M007","Copertoncino","Copertoncino",'24"',"Rosso"],["M008","Copertoncino","Copertoncino",'25"',"Rosso"],["M009","Copertoncino","Copertoncino",'25"',"Grigio"],
    ["M010","Kit riparazione","Attrezzatura","",""],["M011","Striscione Bettson","Striscioni","",""],["M012","Striscione PD","Striscioni","",""],["M013","Bandiera Italia","Striscioni","",""],["M014","Cinghia","Fissaggio","",""],
    ["M015","Ruotino","Ricambio","","Nuovo"],["M016","Ruotino","Ricambio","","Usato"],["M017","Perno","Ricambio","","Piccolo"],["M018","Perno","Ricambio","","Lungo"]
  ].map(x=>({id:x[0],name:x[1],category:x[2],size:x[3],variant:x[4]})),
  stock:[
    ["C001","M001",23],["C001","M002",2],["C001","M003",5],["C001","M004",23],["C001","M005",3],["C001","M006",3],["C001","M007",3],["C001","M008",3],["C001","M009",1],["C001","M010",10],["C001","M011",1],["C001","M012",1],["C001","M013",1],["C001","M014",2],
    ["C003","M005",4],["C003","M006",6],["C004","M015",3],["C004","M016",3],["C004","M017",13],["C004","M018",5],["C002","M007",2],["C002","M008",2],["C002","M009",1]
  ].map(x=>({container:x[0],material:x[1],qty:x[2]})),
  wheels:[
    {id:"R001",size:'26"',assignment:"Hamed",note:""},{id:"R002",size:'26"',assignment:"Hamed",note:""},{id:"R003",size:'26"',assignment:"Hamed",note:""},{id:"R004",size:'26"',assignment:"Hamed",note:""},{id:"R005",size:'26"',assignment:"Hamed",note:"Una rotta"},
    {id:"R006",size:'25"',assignment:"",note:"Copertoncino grigio raggi"},{id:"R007",size:'24"',assignment:"Nando",note:"Copertoncino rosso Spinergy"},{id:"R008",size:'24"',assignment:"",note:"Copertoncino rosso Spinergy"},{id:"R009",size:'24"',assignment:"Niki",note:"Copertoncino rosso Spinergy - Niki vecchia"},{id:"R010",size:'24"',assignment:"",note:"Copertoncino rosso Spinergy"},{id:"R011",size:'24"',assignment:"",note:"Tubolare PDR 4"},{id:"R012",size:'25"',assignment:"",note:""},{id:"R013",size:'24"',assignment:"",note:""}
  ],
  personalBags:["Hassan","Francesco","Nando","Roza","Brugno","Sach","Sante","Nicolas","Ahmed","Max","Niki","Amine"].map((person,i)=>({
    id:`SP${String(i+1).padStart(3,"0")}`,
    person,
    color:(person==="Francesco"||person==="Roza")?"Grigia":"Nera",
    photo:(person==="Francesco"||person==="Roza")?IMG.bags.grey:IMG.bags.black,
    contents:[]
  }))
};
