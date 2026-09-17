/*
  DATI PdRugby
  ------------------------------------------------------------
  FOTO: sostituire i valori photo con percorsi relativi, per es.
  photo: "images/giocatori/nicolo.jpg"
  oppure: "images/carrozine/nicolo.jpg"

  Consigli tecnici immagini:
  - foto giocatore: JPG/WEBP, 1200x1200 px, soggetto centrato
  - foto carrozzina: JPG/WEBP, 1600x1200 px (4:3), carrozzina intera
  - logo: SVG o PNG trasparente, almeno 800 px di larghezza
  - foto borse: JPG/WEBP, 1200x900 px (4:3), borsa intera su fondo semplice
*/
const DATA = {
  players: [
    {id:"P006",number:6,name:"Nicolò",role:"Attacco",wheelchair:{model:"Da completare",photo:""},wheels:{diameter:'25"',cover:"Raggi rosse (IRC)",spoke:"Corto"},accessories:[],bag:{color:"Nera",contents:["2× Ruote","Sacchetto Mercedes","Pece"]},notes:""},
    {id:"P001",number:1,name:"Nando",role:"Attacco",wheelchair:{model:"Da completare",photo:""},wheels:{diameter:'25"',cover:"Raggi rosse (IRC)",spoke:"Corto"},accessories:[],bag:{color:"Nera",contents:["2× Ruote"]},notes:""},
    {id:"P003",number:3,name:"Sante",role:"Difesa",wheelchair:{model:"Da completare",photo:""},wheels:{diameter:'24"',cover:"Raggi rosse (IRC)",spoke:"Corto"},accessories:[],bag:{color:"Nera",contents:["1× Ruota (?)"]},notes:"Quantità ruote da verificare."},
    {id:"P008",number:8,name:"Paolino",role:"Difesa",wheelchair:{model:"Da completare",photo:""},wheels:{diameter:'24"',cover:"Tubolari",spoke:"Lungo"},accessories:[],bag:{color:"Nera",contents:["2× Ruote"]},notes:""},
    {id:"P010",number:10,name:"Hassan",role:"Difesa",wheelchair:{model:"Da completare",photo:""},wheels:{diameter:'25"',cover:"Raggi grigie (Kenda)",spoke:"Lungo"},accessories:[],bag:{color:"Nera",contents:["2× Ruote"]},notes:""}
  ],
  containers:[
    {id:"C001",name:"Sacca blu materiale",type:"Sacca",parent:null,photo:""},
    {id:"C002",name:"Magazzino",type:"Locale",parent:null,photo:""},
    {id:"C003",name:"Cesta",type:"Cesta",parent:null,photo:""},
    {id:"C004",name:"Cassetta attrezzi",type:"Cassetta",parent:null,photo:""},
    {id:"C005",name:"Sacca nera ruote",type:"Sacca",parent:null,photo:""},
    {id:"C006",name:"Sacca grigia ruote",type:"Sacca",parent:null,photo:""}
  ],
  materials:[
    ["M001","Camera d'aria","Camera",'24"',"Nuova"],["M002","Camera d'aria","Camera",'24"',"Con toppe"],["M003","Camera d'aria","Camera",'25"',"Con toppe"],["M004","Camera d'aria","Camera",'25"',"Nuova"],
    ["M005","Tubolare","Tubolare",'24"',""],["M006","Tubolare","Tubolare",'25"',""],["M007","Copertoncino","Copertoncino",'24"',"Rosso"],["M008","Copertoncino","Copertoncino",'25"',"Rosso"],["M009","Copertoncino","Copertoncino",'25"',"Grigio"],
    ["M010","Kit riparazione","Attrezzatura","",""],["M011","Striscione Bettson","Striscioni","",""],["M012","Striscione PD","Striscioni","",""],["M013","Bandiera Italia","Striscioni","",""],["M014","Cinghia","Fissaggio","",""] ,
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
  personalBags:["Hassan","Francesco","Nando","Roza","Brugno","Sach","Sante","Nicolas","Ahmed","Max","Niki","Amine"].map((person,i)=>({id:`SP${String(i+1).padStart(3,'0')}`,person,color:(person==="Francesco"||person==="Roza")?"Grigia":"Nera",contents:[]}))
};
