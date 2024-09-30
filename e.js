//Todo
//-- animate hover with dashed line
//--implement ctrl z,y,x,c,v
//--implement pointer selection rather than caret only

ctx = can.getContext("2d");
ctx.fillStyle="#ffffff";
ctx.beginPath();
ctx.fill();
//IEC_7810 ID-1 = 85.60mm by 53.98mm
//[8560,5398].map(x=>x/2);
scale = 1;
w = 4280*scale;
h = 2699*scale;
function hp(p){ return (h/100)*p }; function wp(p){ return (w/100)*p}; //height percent width percent
fontSize = hp(10);
ctx.textAlign = "center";
(async ()=>{
const i = {
  card:{
    w,
    h,
    r: wp(5) 
  },
  VM:{
    font: hp(16)+"px Georgia",
    y:hp(15)
  },
  ECHS:{
    font: hp(10)+"px Georgia",
    y: hp(25)
  },
  vetsLogo:{
    img: await imageWSrc("./VetsM+border.png"),
    x: wp(70),
    y: hp(53),
    w: hp(482/10),
    h: hp(400/10)
  },
  stripe:{
    h: hp(15),
    y: hp(30)
  },
  name:{
    
  },
  bday:{

  },
  idNo:{

  },
  pfp:{
    x: wp(0),
    y: hp(53),
    wh: hp(40)
  },

}

function imageWSrc(src){
  var img = new Image();
  img.src = src;
  return new Promise((res,rej)=>{
    img.onload = ()=>{res(img)};
    img.onerror = rej;
  });
}
function update(){//draw all other user editable things,
  basic();
  drawName();
  drawBday();
  drawIdNo();
  drawPfp();
}
function basic(){
  //white card
    ctx.beginPath();
    ctx.fillStyle = "#FFF";
    ctx.roundRect(0, 0, i.card.w, i.card.h, i.card.r);
    ctx.fill();
  //draw title text
    ctx.fillStyle = "#000";
    //Veterans Memorial
      ctx.font = i.VM.font;
      ctx.fillText("Veterans Memorial", wp(50), i.VM.y);
    //"Early College High School"
      ctx.font = i.ECHS.font;
      ctx.fillText("Early College High School", wp(50), i.ECHS.y);
  // draw Veterans logo
    ctx.drawImage(i.vetsLogo.img, i.vetsLogo.x, i.vetsLogo.y, i.vetsLogo.w, i.vetsLogo.h);
}
function encodeCode39(value){
  const map = {
    "0":[1,0,1,0,0,1,1,0,1,1,0,1],
    "1":[1,1,0,1,0,0,1,0,1,0,1,1],
    "2":[1,0,1,1,0,0,1,0,1,0,1,1],
    "3":[1,1,0,1,1,0,0,1,0,1,0,1],
    "4":[1,0,1,0,0,1,1,0,1,0,1,1],
    "5":[1,1,0,1,0,0,1,1,0,1,0,1],
    "6":[1,0,1,1,0,0,1,1,0,1,0,1],
    "7":[1,0,1,0,0,1,0,1,1,0,1,1],
    "8":[1,1,0,1,0,0,1,0,1,1,0,1],
    "9":[1,0,1,1,0,0,1,0,1,1,0,1],
    "*":[1,0,0,1,0,1,1,0,1,1,0,1],
  }
  var ret = [];
  for( const char of value ){
    ret.push(...map[char], 0);
  }
  ret.pop();
  return ret;
}
//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//
//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//
//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//


inputValues = {name: "Your Name", bday: "UR/BD/AY", idNo:"YOURIDNO", pfp: await imageWSrc("./aaa.svg")};
inputPaths = {name: new Path2D, bday: new Path2D, idNo: new Path2D, pfp: new Path2D}
editingData = {input:null};//pfp is the only thing that can't be in an edit process
currentHover = null;


function drawName(){
  //cover previous; path not necessary
    ctx.fillStyle = "#F00";
    ctx.fillRect(0, i.stripe.y, i.card.w, i.stripe.h);
  //draw permanent highlight and save new path for hover detection:
    ctx.font = hp(10)+"px Arial";
    var {width: textWidth, fontBoundingBoxDescent: textH1, fontBoundingBoxAscent: textH2} = ctx.measureText(inputValues.name);
    textWidth += wp(3);
    ctx.fillStyle = "#F44";
    inputPaths.name = new Path2D(); inputPaths.name.rect((w/2)-(textWidth/2), hp(30), textWidth, hp(15));
    ctx.fill(inputPaths.name);
  //draw the name
    ctx.fillStyle = "#000";
    ctx.fillText(inputValues.name, wp(50), hp(39));//30 to strip, 10 past strip include all of text height, 1 percent spacing above text 
  //manage the editor highlight or cursor
    console.log(editingData.input);
    if(editingData.input == "name"){
      var selectedText = inputValues.name.slice(...editingData.selection.toSorted((a,b)=>(a-b)));//shorter than math.max/math.min
      var {width: highlightWidth} = ctx.measureText(selectedText);
      var {width: preHighlightWidth} = ctx.measureText(inputValues.name.slice(0, Math.min(...editingData.selection)));
      console.log("currently editing "+editingData.input);
      console.log("highlightWidth="+highlightWidth);
      console.log("preHighlightWidth="+preHighlightWidth);
      console.log('selectedText="'+selectedText+'"; selection=['+editingData.selection[0]+', '+editingData.selection[1]+']');
      if(highlightWidth){//selection
        //draw blue selection rect
          ctx.fillStyle = "#05F";
          ctx.globalAlpha = 0.5;
          ctx.fillRect((w/2)-((textWidth-wp(3))/2)+preHighlightWidth, hp(30), highlightWidth, textH1+textH2);
          ctx.globalAlpha = 1;
        //redraw selected text as white. also figure out Why Y(q,e,u,i,o,p, a,v, "," "." "-") numbers and capital letters were not tested
          ctx.fillStyle = "#FFF";
          ctx.textAlign = "left";
          ctx.fillText(selectedText, wp(50)-((textWidth-wp(3))/2)+preHighlightWidth, hp(39));
          ctx.textAlign = "center";
      }else{//cursor
        console.log()
        ctx.fillStyle = "#000";
        const cursorWidth = (ctx.measureText("i").width / 7);
        ctx.fillRect((w/2)-((textWidth-wp(3))/2)+preHighlightWidth-(cursorWidth/2), hp(30), cursorWidth, textH1+textH2);
      }
    }
}
function drawBday(){
  //cover previous
    //ctx.fillStyle = "#FFF";
    //ctx.fill(inputPaths.bday);
  //save new path for hover detection
    ctx.font = hp(10)+"px Arial";
    var {width: textWidth, fontBoundingBoxDescent: textH1, fontBoundingBoxAscent: textH2} = ctx.measureText(inputValues.bday);
    textWidth += wp(3);
    inputPaths.bday = new Path2D(); inputPaths.bday.rect((w/2)-(textWidth/2), hp(45), textWidth, textH1+textH2);
  //draw the bday
    ctx.fillStyle = "#000";
    ctx.fillText(inputValues.bday, wp(50), hp(45+9));
  //manage the editor highlight or cursor
    console.log(editingData.input);
    if(editingData.input == "bday"){
      var selectedText = inputValues.bday.slice(...editingData.selection.toSorted((a,b)=>(a-b)));//shorter than math.max/math.min
      var {width: highlightWidth} = ctx.measureText(selectedText);
      var {width: preHighlightWidth} = ctx.measureText(inputValues.bday.slice(0, Math.min(...editingData.selection)));
      console.log("currently editing "+editingData.input);
      console.log("highlightWidth="+highlightWidth);
      console.log("preHighlightWidth="+preHighlightWidth);
      console.log('selectedText="'+selectedText+'"; selection=['+editingData.selection[0]+', '+editingData.selection[1]+']');
      if(highlightWidth){//selection
        //draw blue selection rect
          ctx.fillStyle = "#00F";
          ctx.globalAlpha = 0.7;
          ctx.fillRect((w/2)-((textWidth-wp(3))/2)+preHighlightWidth, hp(45), highlightWidth, textH1+textH2);
          ctx.globalAlpha = 1;
        //redraw selected text as white. also figure out Why Y(q,e,u,i,o,p, a,v, "," "." "-") numbers and capital letters were not tested
          ctx.fillStyle = "#FFF";
          ctx.textAlign = "left";
          ctx.fillText(selectedText, wp(50)-((textWidth-wp(3))/2)+preHighlightWidth, hp(45+9));
          ctx.textAlign = "center";
      }else{//cursor
        console.log()
        ctx.fillStyle = "#000";
        const cursorWidth = (ctx.measureText("i").width / 7);
        ctx.fillRect((w/2)-((textWidth-wp(3))/2)+preHighlightWidth-(cursorWidth/2), hp(45), cursorWidth, textH1+textH2);
      }
    }
}
function drawIdNo(){
    //save new path for hover detection
    ctx.font = hp(10)+"px Arial";
    var {width: textWidth, fontBoundingBoxDescent: textH1, fontBoundingBoxAscent: textH2} = ctx.measureText(inputValues.idNo);
    textWidth += wp(3);
    inputPaths.idNo = new Path2D(); inputPaths.idNo.rect((w/2)-(textWidth/2), hp(83), textWidth, textH1+textH2);
  //draw the idNo
    ctx.fillStyle = "#000";
    ctx.fillText(inputValues.idNo, wp(50), hp(83+9));
  //manage the editor highlight or cursor
    console.log(editingData.input);
    if(editingData.input == "idNo"){
      var selectedText = inputValues.idNo.slice(...editingData.selection.toSorted((a,b)=>(a-b)));//shorter than math.max/math.min
      var {width: highlightWidth} = ctx.measureText(selectedText);
      var {width: preHighlightWidth} = ctx.measureText(inputValues.idNo.slice(0, Math.min(...editingData.selection)));
      console.log("currently editing "+editingData.input);
      console.log("highlightWidth="+highlightWidth);
      console.log("preHighlightWidth="+preHighlightWidth);
      console.log('selectedText="'+selectedText+'"; selection=['+editingData.selection[0]+', '+editingData.selection[1]+']');
      if(highlightWidth){//selection
        //draw blue selection rect
          ctx.fillStyle = "#00F";
          ctx.globalAlpha = 0.7;
          ctx.fillRect((w/2)-((textWidth-wp(3))/2)+preHighlightWidth, hp(83), highlightWidth, textH1+textH2);
          ctx.globalAlpha = 1;
        //redraw selected text as white. also figure out Why Y(q,e,u,i,o,p, a,v, "," "." "-") numbers and capital letters were not tested
          ctx.fillStyle = "#FFF";
          ctx.textAlign = "left";
          ctx.fillText(selectedText, wp(50)-((textWidth-wp(3))/2)+preHighlightWidth, hp(83+9));
          ctx.textAlign = "center";
      }else{//cursor
        console.log()
        ctx.fillStyle = "#000";
        const cursorWidth = (ctx.measureText("i").width / 7);
        ctx.fillRect((w/2)-((textWidth-wp(3))/2)+preHighlightWidth-(cursorWidth/2), hp(83), cursorWidth, textH1+textH2);
      }
    }
}
function drawPfp(){
  ctx.drawImage(inputValues.pfp, i.pfp.x, i.pfp.y, i.pfp.wh, i.pfp.wh);
  inputPaths.pfp = new Path2D(); inputPaths.pfp.rect(i.pfp.x, i.pfp.y, i.pfp.wh, i.pfp.wh);
}


can.addEventListener("mousemove", (e)=>{
  const {x:offX, y:offY, height:h, width:w} = can.getBoundingClientRect();
  const x = (e.pageX - offX)*(can.width/w), y = (e.pageY - offY)*(can.height/h);
  if(editingData.input) return;
  var lastHover = currentHover;
  /***/ if(ctx.isPointInPath(inputPaths.name, x, y)){
    can.style.cursor = "pointer"; currentHover = "name";
    can.title = "Change your Name";
  }else if(ctx.isPointInPath(inputPaths.bday, x, y)){
    can.style.cursor = "pointer"; currentHover = "bday";
    can.title = "Change your Birthday";
  }else if(ctx.isPointInPath(inputPaths.pfp, x, y)){
    can.style.cursor = "pointer"; currentHover = "pfp";
    can.title = "Change your Photo";
  }else if(ctx.isPointInPath(inputPaths.idNo, x, y)){
    can.style.cursor = "pointer"; currentHover = "idNo";
    can.title = "Change your ID Number";
  }else{
    can.style.cursor = "initial"; currentHover = null;
    can.title = "";
  }
  if(lastHover !== currentHover) console.log("Now hovering over "+currentHover);
});
can.addEventListener("click", async (e)=>{
   if(!editingData.input && currentHover){
    if(currentHover == "pfp"){
      var inpEl = document.createElement("input"); inpEl.type = "file";
      inpEl.oninput = ()=>{
        img = new Image()
        img.src = URL.createObjectURL(inpEl.files[0]);
        img.onload = ()=>{inputValues.pfp = img; update()};
      }
      inpEl.click();
    }else{ await can.requestPointerLock() } //handle edit preparation on function below
  }
});
document.addEventListener("pointerlockchange", (e)=>{
  if(document.pointerLockElement === can){//
    editingData = {input: currentHover, selection: [inputValues[currentHover].length, 0]};
                                                /*based on my observation in chrome's URL bar*/
  }else{///////////////////////////////////////
    if(inputValues[editingData.input].length == 0){
      inputValues[editingData.input] = "*****";
    }
    editingData = {input: null};
  }
  update();
}, false);
document.addEventListener("keydown", (e)=>{ //implement ctrl actions on arrows, letters, delete, and backspace
  if(!editingData.input) return;
  var selFrom = editingData.selection[0];
  var selTo = editingData.selection[1];
  console.log(editingData, inputValues);
  switch(e.key){
    case "ArrowLeft":
    case "ArrowRight":
      lr = (e.key==="ArrowLeft") ? (-1) : (1);
      if(selFrom == selTo){//if it's a cursor, not a selection
        if(!e.shiftKey){//no selection
          if(!e.ctrlKey){//move cursor only
            editingData.selection = [0,0].fill(selTo +lr);
          }else{//jump words
            
          }
        }else{//begin selection
          if(!e.ctrlKey){//move cursor to select
            editingData.selection = [selTo, selTo +lr];
          }else{//select word
            
          }
        }
      }else{//if already in a selection
        if(e.shiftKey){//keep selecting
          if(!e.ctrlKey){//move cursor to select
            editingData.selection = [selFrom, selTo +lr];
          }else{//select word
            
          }
        }else{//stop selecting
          if(!e.ctrlKey){//move cursor to select
            editingData.selection = [0,0].fill(Math[["min",0,"max"][lr+1]](selFrom,selTo));
          }else{//jump words
            
          }
        }
      }
      break;
    case "Backspace":
      if(selFrom === selTo){//remove relative to cursor, shift has no effect
        const bksp = (e.key == "Backspace");
        if(!e.ctrlKey){//remove character to the left
          inputValues[editingData.input] = 
            inputValues[editingData.input].slice(0,selTo+(bksp?-1:0)) 
              +
            inputValues[editingData.input].slice(selTo+(bksp?0:1));
          if(bksp) editingData.selection = [0,0].fill(selTo-1); //cursor keeps position in delete
        }else{//remove word
          if(bksp){//to the left
            
          }else{//to the right

          }
        }
      }else{//delete selection, ctrl has no effect
        inputValues[editingData.input] = 
          inputValues[editingData.input].slice(0,Math.min(selFrom, selTo)) 
            +
          inputValues[editingData.input].slice(Math.max(selFrom,selTo));
        editingData.selection = [0,0].fill(Math.min(selFrom,selTo));
      }
      break;
    default:
      if(e.key.length !== 1) break;//a typeable thing
      if(e.ctrlKey){
        if(e.key == "a" || e.key == "l"){
          editingData.selection = [0,inputValues[currentHover].length];
        }else if(["y","z","c","v","x"].includes(e.key)){
          alert("Ctrl actions (Redo, Undo) aren't supported yet")
        }
      }else{
        if(["idNo", "bday"].includes(editingData.input) && inputValues[editingData.input].length === 8) return;
        inputValues[editingData.input] = 
          inputValues[editingData.input].slice(0,Math.min(selFrom, selTo))
            +e.key+
          inputValues[editingData.input].slice(Math.max(selFrom,selTo));
        editingData.selection = [0,0].fill(Math.min(selFrom,selTo)+1);
      }
      
  }
  if(editingData.selection[0] < 0)
     editingData.selection[0] = 0;
  if(editingData.selection[1] < 0)
     editingData.selection[1] = 0;
  if(editingData.selection[0] > inputValues[editingData.input].length)
     editingData.selection[0] = inputValues[editingData.input].length;
  if(editingData.selection[1] > inputValues[editingData.input].length)
     editingData.selection[1] = inputValues[editingData.input].length;
  update();
});

update();
})()