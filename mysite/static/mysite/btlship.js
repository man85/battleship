     let colCount=10;
     let rowCount=10;
     let templShips=new Map();
     let ships=[];
     let ship=null;
     let tblAr=[];
     let oppTblAr=[];
     let state='placeShips';
     let ws=window.ws;
     let sender=window.sender;
     let yourMove=false;
     let countAliveShips;
     ws.onmessage=onMessage;
     //-----------main table----------------
     for (let i = 0; i < rowCount; i++) { 
        let tr=document.createElement('tr');
        table.appendChild(tr);
        tblAr.push([]);
        for (let j=0;j<colCount;j++){
          
          let cell1=document.createElement('td');
          cell1.className="empty";
          tblAr[i].push({ship:new Set(),cell:cell1});
          
          tr.appendChild(cell1);
        }
     }
     function templShipClick(event){
        let tbl=event.target.closest('table');
        if (!tbl) return;
        if (templShips.get(tbl.id).count==0) return;
        ship={
          x: undefined,//col number
          y: undefined,//row number
          length:templShips.get(tbl.id).length,
          xOr:1,
          yOr:0,
          cells:[],
          canPlaced:undefined,
          tmplShipId: tbl.id,
        }
     }
     //---------create opponent table field---------
     function createOppField(){
       for (let i = 0; i < rowCount; i++) { 
          let tr=document.createElement('tr');
          oppField.appendChild(tr);
          oppTblAr.push([]);
          for (let j=0;j<colCount;j++){
            let cell1=document.createElement('td');
            cell1.className="empty";
            oppTblAr[i].push(cell1);
            tr.appendChild(cell1);
          }
       }
       let jsonObj={
                      requestType:'shipsArePlaced',
                      'sender':sender,
                   }
       ws.send(JSON.stringify(jsonObj));
     }
     //---------ships tables----------------
     function createShipTable(length,id,count){
       templShips.set(id,{'length':length, 'count':count});
       let tr=document.createElement('tr');
       let ship1cell=document.getElementById(id);
       ship1cell.onclick=templShipClick;
       ship1cell.appendChild(tr);
       for (let j=0;j<length;j++){          
          let cell1=document.createElement('td');
          cell1.className="canPlaced";
          tr.appendChild(cell1);
       }
       ship1cell.previousSibling.textContent=count;
     }
     createShipTable(1,'ship1cell',1) ;
     createShipTable(2,'ship2cell',1) ;
     createShipTable(3,'ship3cell',1) ;
     createShipTable(4,'ship4cell',1) ;
     
     table.onmouseover=function(event){
        if (!ship) return;
        let td=event.target.closest('td');
        if (!td) return;
        let tr=td.parentNode;
        placeShipOnTable(tblAr,tr,td,ship);
     }

     function placeShipOnTable(tblAr,tr,td,ship){
         let canPlaced=(td.cellIndex+ship.xOr*ship.length<=tblAr[0].length)&&(tr.rowIndex+ship.yOr*ship.length<=tblAr.length);
         //-------check ships around new place---------------------
         let i;
         let j;
         if (canPlaced){
           let startI=i=Math.max(0,td.cellIndex-1);
           let startJ=j=Math.max(0,tr.rowIndex-1);
           while ((i<=td.cellIndex+1)&&(j<=tr.rowIndex+1)){
             while ((i<Math.min(tblAr[0].length,td.cellIndex+ship.length+1))&&(j<Math.min(tblAr.length,tr.rowIndex+ship.length+1))&& canPlaced){
                if (canPlaced){ canPlaced=(tblAr[j][i].ship.size==0);}
                i=i+ship.xOr;
                j=j+ship.yOr;
             }
             startI=startI+ship.yOr; 
             startJ=startJ+ship.xOr;
             i=startI;
             j=startJ;
           }
         }
         i=td.cellIndex;
         j=tr.rowIndex;
         ship.x=i;
         ship.y=j;
         while ((i<Math.min(tblAr[0].length,td.cellIndex+ship.length))&&(j<Math.min(tblAr.length,tr.rowIndex+ship.length))){
            tblAr[j][i].ship.add(ship);
            ship.cells.push(tblAr[j][i].cell);   
            i=i+ship.xOr;
            j=j+ship.yOr;
         }
         ship.canPlaced=canPlaced;
         //---------Add class to cells-------------------------------  
         for (let cell of ship.cells){
             if (canPlaced){ 
                   cell.classList.add("canPlaced");
             } else{
                      cell.classList.add("cantPlaced");                      
                   }
         }
     }
     table.onmouseout=function(event){
        if (!ship) return;
        let td=event.target.closest('td');
        if (!td) return;
        for (let cell of ship.cells){
           tblAr[cell.parentNode.rowIndex][cell.cellIndex].ship.delete(ship);
           if (tblAr[cell.parentNode.rowIndex][cell.cellIndex].ship.size==0){
             cell.classList.remove("canPlaced");
           }
           cell.classList.remove("cantPlaced");
        }
        ship.cells=[];
     }
     table.onclick=function(event){
        if (!ship) return;
        if (ship.canPlaced!=true) return;
        let td=event.target.closest('td');
        if (!td) return;
        ships.push(ship);
        let count=--(templShips.get(ship.tmplShipId).count);
        let tbl=document.getElementById(ship.tmplShipId);
        if (count!=0){
           tbl.previousSibling.textContent=count;
        } else {
               tbl.style.display = "none";
               tbl.previousSibling.style.display = "none";
               //---calc total number of unplaced ships---
               let countShips=0;
               for (let tmpl of templShips.values()){
                  countShips+=tmpl.count;
               }
               if (countShips==0){
                  state='readyToStartGame';
                  countAliveShips=ships.length;
                  createOppField();
               }
           }
        ship=null;
     }
     document.onkeypress=function(event){
        event.preventDefault();
        if (event.code=='KeyR') {
            let targetEvent=null;
            //-------mouseout-----------
            if (ship.cells){
              if (ship.cells[0]==undefined) return;
              targetEvent=ship.cells[0];
              let event = new MouseEvent("mouseout", {
                bubbles: true,
                cancelable: true,
                target: ship.cells[0]
              });
              ship.cells[0].dispatchEvent(event);
            }
            if (ship.xOr==1){
               ship.xOr=0;
               ship.yOr=1;
            }else{//if
                    ship.xOr=1;
                    ship.yOr=0;
                 }
            //-------mouseover------------
            if (targetEvent){
              let event = new MouseEvent("mouseover", {
                bubbles: true,
                cancelable: true,
                target: targetEvent
              });
              targetEvent.dispatchEvent(event);
            }
        }
     }
     function onMessage(event){
       let  msg=JSON.parse(event.data);
       let msgU;
       if (msg.sender==sender) return; // echo message
       switch(msg.requestType){
          case "yourOpponentPlacedShips":
            msgU=document.getElementById("msg");
            msgU.textContent="Your opponent placed ships! ";
            break;
          case "yourMove":
            yourMove=true;
            msgU=document.getElementById("msg");
            msgU.textContent="Your move! ";
            break;
          case "shot":
            //------checking shot------------
            let i=msg.col;
            let j=msg.row;
            let ship=tblAr[j][i].ship;
            let jsonObj;
            if (ship.size!=0){
               let it=ship.values();
               let first=it.next();
               ship=first.value;
               ship.length--;
               if(ship.length==0){//shot on last cell of ship
                  for (let cell of ship.cells){
                     cell.className="shipSank";
                  }
                  countAliveShips--;
                  if (countAliveShips==0){
                    msgU=document.getElementById("msg");
                    msgU.textContent="Game over! ";

                  }
                  //---ship sank-----
                  jsonObj={
                          requestType:"shipSank",
                          'sender':sender,
                          x: ship.x,
                          y: ship.y,
                          length:templShips.get(ship.tmplShipId).length,
                          xOr:ship.xOr,
                          yOr:ship.yOr,
                          'countAliveShips':countAliveShips
                          };
                  
               }else{
                   tblAr[j][i].cell.className="wounded";
                   jsonObj={
                          requestType:"wounded",
                          'sender':sender,
                          col: msg.col,
                          row: msg.row
                          };

                 }
            }else{
                  tblAr[j][i].cell.className="shotPast";
                  jsonObj={
                         requestType:'shotPast',
                         'sender':sender,
                         col:msg.col,
                         row:msg.row,
                        };
                  yourMove=true;
                  msgU=document.getElementById("msg");
                  msgU.textContent="Your move! ";

               }
            ws.send(JSON.stringify(jsonObj));
            break;
          case 'wounded':
            let i1=msg.col;
            let j1=msg.row;
            oppTblAr[j1][i1].className='wounded'; 
            yourMove=true;
            msgU=document.getElementById("msg");
            msgU.textContent="Your move! ";
            break;
          case 'shipSank':
            let x=msg.x;
            let y=msg.y;
            while ((x<msg.x+msg.length)&&(y<msg.y+msg.length)){
              oppTblAr[y][x].className='shipSank';
              x=x+msg.xOr;
              y=y+msg.yOr;
            }
            msgU=document.getElementById("msg");
            
            if (msg.countAliveShips==0){
               yourMove=false;
               msgU.textContent="Your are a winner! ";
               let jsonObj={
                 requestType:'oppField',
                 'sender':sender,
                 'oppField':table.innerHTML,
               }
               ws.send(JSON.stringify(jsonObj));
            }else{
                  yourMove=true;
                  msgU.textContent="Your move! ";
               }
            break;
          case 'shotPast':
            let iIdx=msg.col;
            let jIdx=msg.row;
            let cell1=oppTblAr[jIdx][iIdx];
            cell1.className='shotPast';
            msgU=document.getElementById("msg");
            msgU.textContent="Waiting fot opponent shot... ";
            break;
          case 'oppField':
            oppField.innerHTML=msg.oppField;
            break;

       }
     }
     //------click on opp field-----------
     oppField.onclick=function(event){
       if (!yourMove) return;
       let td=event.target.closest('td');
       if (!td) return;
       if (td.className!='empty') return;
       let colIdx=td.cellIndex;
       let rowIdx=td.parentNode.rowIndex;
       let jsonObj={ 
            requestType:"shot",
            'sender':sender,
            col:colIdx,
            row:rowIdx,
            };
       ws.send(JSON.stringify(jsonObj));
       let msgU=document.getElementById("msg");
       msgU.textContent="Waiting for answer server...";
       yourMove=false;
     }