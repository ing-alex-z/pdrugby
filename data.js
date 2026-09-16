const DATA = {
  containers: [
    {id:"C001",name:"Sacca blu materiale",type:"Sacca",parent:null},
    {id:"C002",name:"Magazzino",type:"Locale",parent:null},
    {id:"C003",name:"Cesta",type:"Cesta",parent:null},
    {id:"C004",name:"Cassetta attrezzi",type:"Cassetta",parent:null},
    {id:"C005",name:"Sacca nera ruote",type:"Sacca",parent:null},
    {id:"C006",name:"Sacca grigia ruote",type:"Sacca",parent:null}
  ],
  materials: [
    ["M001","Camera d'aria","Camera","24\"","Nuova"],
    ["M002","Camera d'aria","Camera","24\"","Con toppe"],
    ["M003","Camera d'aria","Camera","25\"","Con toppe"],
    ["M004","Camera d'aria","Camera","25\"","Nuova"],
    ["M005","Tubolare","Tubolare","24\"",""],
    ["M006","Tubolare","Tubolare","25\"",""],
    ["M007","Copertoncino","Copertoncino","24\"","Rosso"],
    ["M008","Copertoncino","Copertoncino","25\"","Rosso"],
    ["M009","Copertoncino","Copertoncino","25\"","Grigio"],
    ["M010","Kit riparazione","Attrezzatura","",""],
    ["M011","Striscione Bettson","Striscioni","",""],
    ["M012","Striscione PD","Striscioni","",""],
    ["M013","Bandiera Italia","Striscioni","",""],
    ["M014","Cinghia","Fissaggio","",""],
    ["M015","Ruotino","Ricambio","","Nuovo"],
    ["M016","Ruotino","Ricambio","","Usato"],
    ["M017","Perno","Ricambio","","Piccolo"],
    ["M018","Perno","Ricambio","","Lungo"]
  ].map(x=>({id:x[0],name:x[1],category:x[2],size:x[3],variant:x[4]})),
  stock: [
    ["C001","M001",23],["C001","M002",2],["C001","M003",5],["C001","M004",23],
    ["C001","M005",3],["C001","M006",3],["C001","M007",3],["C001","M008",3],
    ["C001","M009",1],["C001","M010",10],["C001","M011",1],["C001","M012",1],
    ["C001","M013",1],["C001","M014",2],
    ["C003","M005",4],["C003","M006",6],
    ["C004","M015",3],["C004","M016",3],["C004","M017",13],["C004","M018",5],
    ["C002","M007",2],["C002","M008",2],["C002","M009",1]
  ].map(x=>({container:x[0],material:x[1],qty:x[2]})),
  wheels: [
    {id:"R001",size:"26\"",assignment:"Hamed",type:"Ruota",note:""},
    {id:"R002",size:"26\"",assignment:"Hamed",type:"Ruota",note:""},
    {id:"R003",size:"26\"",assignment:"Hamed",type:"Ruota",note:""},
    {id:"R004",size:"26\"",assignment:"Hamed",type:"Ruota",note:""},
    {id:"R005",size:"26\"",assignment:"Hamed",type:"Ruota",note:""},
    {id:"R006",size:"25\"",assignment:"",type:"Ruota",note:"Copertoncino grigio raggi"},
    {id:"R007",size:"24\"",assignment:"Nando",type:"Ruota",note:"Copertoncino rosso Spinergy"},
    {id:"R008",size:"24\"",assignment:"",type:"Ruota",note:"Copertoncino rosso Spinergy"},
    {id:"R009",size:"24\"",assignment:"Niki",type:"Ruota",note:"Copertoncino rosso Spinergy - Niki vecchia"},
    {id:"R010",size:"24\"",assignment:"",type:"Ruota",note:"Copertoncino rosso Spinergy"},
    {id:"R011",size:"24\"",assignment:"",type:"Ruota",note:"Tubolare PDR 4"},
    {id:"R012",size:"25\"",assignment:"",type:"Ruota",note:""},
    {id:"R013",size:"24\"",assignment:"",type:"Ruota",note:""}
  ],
  personalBags: [
    ["SP001","Nera","Hassan"],["SP002","Nera","Nando"],["SP003","Nera","Brugno"],
    ["SP004","Nera","Sach"],["SP005","Nera","Sante"],["SP006","Nera","Nicolas"],
    ["SP007","Nera","Ahmed"],["SP008","Nera","Max"],["SP009","Nera","Niki"],
    ["SP010","Nera","Amine"],["SP011","Grigia","Francesco"],["SP012","Grigia","Roza"]
  ].map(x=>({id:x[0],color:x[1],person:x[2]}))
};