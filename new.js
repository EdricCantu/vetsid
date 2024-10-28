scale = {};
var logoImg;
var cur = {x: 0, y: 0};
can = document.getElementById("can");
ctx = can.getContext("2d");
ctx.textAlign = "center";
function hp(p){ return (can.height/100)*p }; //height percent
function wp(p){ return (can.width/100)*p};    //width percent
window.addEventListener("resize", rescale);
function imageWSrc(src){
  var img = new Image();
  img.src = src;
  return new Promise((res,rej)=>{
    img.onload = ()=>{res(img)};
    img.onerror = rej;
  });
}
/// color coding
/// - yellow = name of element

function ctrlC(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    console.log("%cCopied!", "color: lime; font-weight: bold")
  } catch (err) {
    console.error('%cUnable to copy to clipboard!',"color: red",err);
  }
  document.body.removeChild(textArea);
}
function rescale(w=0, h=0){
  if(typeof w !== "number" || w == 0){
    ({width: w, height: h} = can.getBoundingClientRect());
    w *= devicePixelRatio; h *= devicePixelRatio;
  }
  can.width = w; can.height = h;
  scale.card = { w, h, r: wp(5) };
  scale.VM = { y: hp(15), fnt: hp(16)+"px Georgia" };
  scale.ECHS = { y: hp(25), fnt: hp(10)+"px Georgia" };
  scale.logo = { x: wp(70), y: hp(50), w: hp(482/10), h: hp(400/10) };
  scale.stripe = { y: hp(30), h: hp(15) };
  scale.name = {  };
  scale.bday = {  };
  scale.idBar = { y: hp(57), h:hp(25), w: wp(40) };
  scale.idNo = {  };
  scale.pfp = { x: wp(0), y: hp(48), wh: hp(46) };
  scale.tooltip = { fnt: hp(1.8)+"px Arial", pad: hp(1) }
  ctx.textAlign = "center";  //rescaling undoes the ctx.textAlign
  update();
}
function encodeCode39(value){
  const map = {
    //"0":[1,    0,    1,    0,0,  1,1,  0,    1,1,  0,    1],
      "0":[1,    1,    1,    2,    2,    1,    2,    1,    1],
    //"1":[1,1,  0,    1,    0,0,  1,    0,    1,    0,    1,1],
      "1":[2,    1,    1,    2,    1,    1,    1,    1,    2],
    //"2":[1,    0,    1,1,  0,0,  1,    0,    1,    0,    1,1],
      "2":[1,    1,    2,    2,    1,    1,    1,    1,    2],
    //"3":[1,1,  0,    1,1,  0,0,  1,    0,    1,    0,    1],
      "3":[2,    1,    2,    2,    1,    1,    1,    1,    1],
    //"4":[1,    0,    1,    0,0,  1,1,  0,    1,    0,    1,1],
      "4":[1,    1,    1,    2,    2,    1,    1,    1,    2],
    //"5":[1,1,  0,    1,    0,0,  1,1,  0,    1,    0,    1],
      "5":[2,    1,    1,    2,    2,    1,    1,    1,    1],
    //"6":[1,    0,    1,1,  0,0,  1,1,  0,    1,    0,    1],
      "6":[1,    1,    2,    2,    2,    1,    1,    1,    1],
    //"7":[1,    0,    1,    0,0,  1,    0,    1,1,  0,    1,1],
      "7":[1,    1,    1,    2,    1,    1,    2,    1,    2],
    //"8":[1,1,  0,    1,    0,0,  1,    0,    1,1,  0,    1],
      "8":[2,    1,    1,    2,    1,    1,    2,    1,    1],
    //"9":[1,    0,    1,1,  0,0,  1,    0,    1,1,  0,    1],
      "9":[1,    1,    2,    2,    1,    1,    2,    1,    1],
    //"*":[1,    0,0,  1,    0,    1,1,  0,    1,1,  0,    1],
      "*":[1,    2,    1,    1,    2,    1,    2,    1,    1],
  }
  var ret = [];
  for( const char of value ){
    try{ 
      ret.push(...(map[char]), 1);
    }catch{
      return [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    }
  }
  ret.pop();
  return ret;
}
showtooltip = true;
function update(){//draw all other user editable things,
  basic();
  drawName();
  drawBday();
  drawIdNo();
  drawPfp();
  if(showtooltip) drawTooltip();
}
function basic(){
  //white card
    ctx.beginPath();
    ctx.fillStyle = "#FFF";
    ctx.roundRect(0, 0, scale.card.w, scale.card.h, scale.card.r);
    ctx.fill();
  //draw title text
    ctx.fillStyle = "#000";
    //Veterans Memorial
      ctx.font = scale.VM.fnt;
      ctx.fillText("Veterans Memorial", wp(50), scale.VM.y);
    //"Early College High School"
      ctx.font = scale.ECHS.fnt;
      ctx.fillText("Early College High School", wp(50), scale.ECHS.y);
  // draw Veterans logo
    ctx.drawImage(logoImg, scale.logo.x, scale.logo.y, scale.logo.w, scale.logo.h);
}

inputValues = {name: "Your Name", bday: "UR/BD/AY", idNo: "YOURIDNO", pfp: new Image()};
inputPaths = {name: new Path2D, bday: new Path2D, idNo: new Path2D, pfp: new Path2D}
editingData = {input: null};//pfp is the only thing that can't be in an edit process
currentHover = null;
function drawName(){
  //cover previous; path not necessary
    ctx.fillStyle = "#F00";
    ctx.fillRect(0, scale.stripe.y, scale.card.w, scale.stripe.h);
  //draw permanent highlight and save new path for hover detection:
    ctx.font = hp(10)+"px Arial";
    var {width: textWidth, fontBoundingBoxDescent: textH1, fontBoundingBoxAscent: textH2} = ctx.measureText(inputValues.name);
    textWidth += wp(3);
    ctx.fillStyle = "#F44";
    inputPaths.name = new Path2D(); inputPaths.name.rect((scale.card.w/2)-(textWidth/2), hp(30), textWidth, hp(15));
    ctx.fill(inputPaths.name);
  //draw the name
    ctx.fillStyle = "#000";
    ctx.fillText(inputValues.name, wp(50), hp(39));//30 to strip, 10 past strip include all of text height, 1 percent spacing above text 
  //manage the editor highlight or cursor
    if(editingData.input == "name"){
      var selectedText = inputValues.name.slice(...editingData.selection.toSorted((a,b)=>(a-b)));//shorter than math.max/math.min
      var {width: highlightWidth} = ctx.measureText(selectedText);
      var {width: preHighlightWidth} = ctx.measureText(inputValues.name.slice(0, Math.min(...editingData.selection)));
      if(highlightWidth){//selection
        //draw blue selection rect
          ctx.fillStyle = "#05F";
          ctx.globalAlpha = 0.5;
          ctx.fillRect((scale.card.w/2)-((textWidth-wp(3))/2)+preHighlightWidth, hp(30), highlightWidth, textH1+textH2);
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
        ctx.fillRect((scale.card.w/2)-((textWidth-wp(3))/2)+preHighlightWidth-(cursorWidth/2), hp(30), cursorWidth, textH1+textH2);
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
    inputPaths.bday = new Path2D(); inputPaths.bday.rect((scale.card.w/2)-(textWidth/2), hp(45), textWidth, textH1+textH2);
  //draw the bday
    ctx.fillStyle = "#000";
    ctx.fillText(inputValues.bday, wp(50), hp(45+9));
  //manage the editor highlight or cursor
    if(editingData.input == "bday"){
      var selectedText = inputValues.bday.slice(...editingData.selection.toSorted((a,b)=>(a-b)));//shorter than math.max/math.min
      var {width: highlightWidth} = ctx.measureText(selectedText);
      var {width: preHighlightWidth} = ctx.measureText(inputValues.bday.slice(0, Math.min(...editingData.selection)));
      if(highlightWidth){//selection
        //draw blue selection rect
          ctx.fillStyle = "#00F";
          ctx.globalAlpha = 0.7;
          ctx.fillRect((scale.card.w/2)-((textWidth-wp(3))/2)+preHighlightWidth, hp(45), highlightWidth, textH1+textH2);
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
        ctx.fillRect((scale.card.w/2)-((textWidth-wp(3))/2)+preHighlightWidth-(cursorWidth/2), hp(45), cursorWidth, textH1+textH2);
      }
    }
}
function drawIdNo(){
    //save new path for hover detection
    ctx.font = hp(10)+"px Arial";
    var {width: textWidth, fontBoundingBoxDescent: textH1, fontBoundingBoxAscent: textH2} = ctx.measureText(inputValues.idNo);
    textWidth += wp(3);
    inputPaths.idNo = new Path2D(); inputPaths.idNo.rect((scale.card.w/2)-(textWidth/2), hp(83), textWidth, textH1+textH2);
  //draw the idNo
    ctx.fillStyle = "#000";
    ctx.fillText("*"+inputValues.idNo+"*", wp(50), hp(83+9));
  //manage the editor highlight or cursor
    if(editingData.input == "idNo"){
      var selectedText = inputValues.idNo.slice(...editingData.selection.toSorted((a,b)=>(a-b)));//shorter than math.max/math.min
      var {width: highlightWidth} = ctx.measureText(selectedText);
      var {width: preHighlightWidth} = ctx.measureText(inputValues.idNo.slice(0, Math.min(...editingData.selection)));
      if(highlightWidth){//selection
        //draw blue selection rect
          ctx.fillStyle = "#00F";
          ctx.globalAlpha = 0.7;
          ctx.fillRect((scale.card.w/2)-((textWidth-wp(3))/2)+preHighlightWidth, hp(83), highlightWidth, textH1+textH2);
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
        ctx.fillRect((scale.card.w/2)-((textWidth-wp(3))/2)+preHighlightWidth-(cursorWidth/2), hp(83), cursorWidth, textH1+textH2);
      }
    }
  //draw barcode
    const barcode = encodeCode39("*"+inputValues.idNo+"*").reduce((acc,add,ind)=>{
      if(ind % 2) var blk = false;
      else var blk = true
      const lastend = (acc?.[acc.length-1]?.end) || 0
      acc.push({start: lastend, end: lastend + add, blk, wid: add});
      return acc;
    }, []);
    const units = (barcode.reduce((acc,add)=>(acc+(add.wid)), 0));
    const unitWidth = scale.idBar.w / units;
    const beginX = (scale.card.w/2) - (scale.idBar.w/2);
    
    ctx.fillStyle = "#000000";
    for( const bar of barcode ){
      if(bar.blk) ctx.fillRect(beginX + (bar.start * unitWidth), scale.idBar.y, bar.wid*unitWidth, scale.idBar.h);
    }
}
function drawPfp(){
  ctx.drawImage(inputValues.pfp, scale.pfp.x, scale.pfp.y, scale.pfp.wh, scale.pfp.wh);
  inputPaths.pfp = new Path2D(); inputPaths.pfp.rect(scale.pfp.x, scale.pfp.y, scale.pfp.wh, scale.pfp.wh);
}

can.addEventListener("mousemove", (e)=>{
  const {x:offX, y:offY, height:h, width:w} = can.getBoundingClientRect();
  cur.x = (e.pageX - offX)*(can.width/w), cur.y = (e.pageY - offY)*(can.height/h);
  var lastHover = currentHover;
  /***/ if(ctx.isPointInPath(inputPaths.name, cur.x, cur.y)){
    can.style.cursor = "text"; currentHover = "name";
  }else if(ctx.isPointInPath(inputPaths.bday, cur.x, cur.y)){
    can.style.cursor = "text"; currentHover = "bday";
  }else if(ctx.isPointInPath(inputPaths.pfp, cur.x, cur.y)){
    can.style.cursor = "pointer"; currentHover = "pfp";
  }else if(ctx.isPointInPath(inputPaths.idNo, cur.x, cur.y)){
    can.style.cursor = "text"; currentHover = "idNo";
  }else{
    can.style.cursor = "initial"; currentHover = null;
  }
  if(lastHover !== currentHover){
    var status;
    const style =  "font-weight: bold;color: yellow";
    if(!lastHover && currentHover && currentHover !== editingData.input){//null to nonediting
      status = "\u25C9";//show
    }else if(lastHover && lastHover == editingData.input && currentHover){//editing to nonediting
      status = "\u25C9";//show
    }else if(lastHover && currentHover && currentHover == editingData.input){//nonediting to editing
      status = "\u25CE";//hide
    }else if(lastHover && currentHover && currentHover !== editingData.input){//nonediting to nonediting, possible risk of editing to nonediting, eliminated with the real editing to nonediting line.
      status = "\u25D3";//redraw
    }else if(lastHover && lastHover !== editingData.input && !currentHover){//nonediting to null
      status = "\u25CE";//hide
    }else if(!lastHover && currentHover && currentHover == editingData.input){//null to editing
      status = "\u25EF";//continue hide
    }else if(lastHover && lastHover == editingData.input && !currentHover){//editing to null
      status = "\u25EF";//continue hide
    }
    console.log(`tooltip %c${status}%c \u2014 %c${(lastHover || "null").padEnd(4," ")}%c\u25B6%c`+currentHover,
                  "font-family: Arial;",
                 "font-weight: initial; font-size: initial",              "color: #CC0","color: initial;",        "font-weight: bold; color: yellow");
  }
  
  update();
});
can.addEventListener("click", async (e)=>{
  console.log("clicked on %c"+ currentHover, "font-weight: bold; color: yellow", "while editingData=", editingData);
  if(editingData.input){
    if(!currentHover){ //stop editing
      if(inputValues[editingData.input].length == 0){
        inputValues[editingData.input] = "*****";
      }
      editingData = {input: null};
    }else if(currentHover == editingData.input){ //select text or place caret;.
      
    }else{//change edit area
      if(inputValues[editingData.input].length == 0){
        inputValues[editingData.input] = "*****";
      }
      if(currentHover == "pfp"){
        var inpEl = document.createElement("input"); inpEl.type = "file";
        inpEl.oninput = ()=>{
          img = new Image()
          img.src = URL.createObjectURL(inpEl.files[0]);
          img.onload = ()=>{inputValues.pfp = img; update()};
        }
        inpEl.click();
      }else{ //prepare for textual edit
        editingData = {input: currentHover, selection: [inputValues[currentHover].length, 0]};
        console.log("tooltip %c\u25CE", "font-family: Arial");
      }
    }
  }else{  //nothing is currently edited. 
    if(currentHover){
      if(currentHover == "pfp"){
        var inpEl = document.createElement("input"); inpEl.type = "file";
        inpEl.oninput = ()=>{
          img = new Image()
          img.src = URL.createObjectURL(inpEl.files[0]);
          img.onload = ()=>{inputValues.pfp = img; update()};
        }
        inpEl.click();
      }else{ //prepare for textual edit
        editingData = {input: currentHover, selection: [inputValues[currentHover].length, 0]};
        console.log("tooltip %c\u25CE", "font-family: Arial");
      }
    }else{
      //nothing to do
    }
  }
  update();
});

document.addEventListener("keydown", (e)=>{ //implement ctrl actions on arrows, letters, delete, and backspace
  if(!editingData.input){
    if(e.ctrlKey && e.key === "s"){
      
    }
    if(e.ctrlKey && e.key === "p"){
      editingData = {input: null};
      showtooltip = false;
      update();
      setTimeout(()=>{showtooltip = true}, 250);
    }
    return;
  };
  var selFrom = editingData.selection[0];
  var selTo = editingData.selection[1];
  console.log(editingData, inputValues);
  switch(e.key){
    case "Escape":
      editingData = {input: null};
      break;
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
        }else if(e.key == "s"){//download image
          
        }else if(e.key == "p"){//print
          editingData = {input: null};
          showtooltip = false;
          update();
          setTimeout(()=>{showtooltip = true}, 250);
        }else if(e.key == "c"){
          console.log("Ctrl+C command.")
          ctrlC(inputValues[editingData.input].slice(...editingData.selection.toSorted((a,b)=>(a-b))));
        }else if(e.key == "v"){
          
        }else if(e.key == "x"){
          ctrlC(inputValues[editingData.input].slice(...editingData.selection.toSorted((a,b)=>(a-b))));
          inputValues[editingData.input] = 
            inputValues[editingData.input].slice(0,Math.min(selFrom, selTo)) 
              +
            inputValues[editingData.input].slice(Math.max(selFrom,selTo));
          editingData.selection = [0,0].fill(Math.min(selFrom,selTo));
        }else if(["y","z".includes(e.key)]){

        }
      }else{
        if(["idNo", "bday"].includes(editingData.input) && inputValues[editingData.input].length === 8 && selFrom === selTo) return;
        if(editingData.input === "idNo" && !(["0","1","2","3","4","5","6","7","8","9"].includes(e.key))){
          return; //prevent non numbers
        }else if(editingData.input === "bday" && !(["0","1","2","3","4","5","6","7","8","9","/"].includes(e.key))){
          return; 
        }
        inputValues[editingData.input] = 
          inputValues[editingData.input].slice(0,Math.min(selFrom, selTo))
            +e.key+
          inputValues[editingData.input].slice(Math.max(selFrom,selTo));
        editingData.selection = [0,0].fill(Math.min(selFrom,selTo)+1);
      }
      
  }
  if(editingData.input){
    if(editingData.selection[0] < 0)
       editingData.selection[0] = 0;
    if(editingData.selection[1] < 0)
       editingData.selection[1] = 0;
    if(editingData.selection[0] > inputValues[editingData.input].length)
       editingData.selection[0] = inputValues[editingData.input].length;
    if(editingData.selection[1] > inputValues[editingData.input].length)
       editingData.selection[1] = inputValues[editingData.input].length;
    var selectedText = inputValues.idNo.slice(...editingData.selection.toSorted((a,b)=>(a-b)));
    console.log("currently editing %c"+editingData.input, "font-weight: bold; color: yellow");
    console.log(`selectedText=%c"${selectedText}"%c;  selection=[%c${selFrom}%c, %c${selTo}%c]`,
                  "color: #6DF", "color: initial","color: #98F", "color: initial","color: #98F","color: initial"
    );
  }
  
  update();
});


function drawTooltip(){
  if([editingData.input, null].includes(currentHover)) return; // so the tooltip doesn't cover the edit area
  var ch;
  switch(currentHover){
    case "name": ch = "name"; break;
    case "idNo": ch = "ID number"; break;
    case "pfp": ch = "avatar"; break;
    case "bday": ch = "date of birth"; break;
    case null: return;
  }
  ctx.font = scale.tooltip.fnt;
  const tooltipText = "Change your "+ch;
  const {width: textWidth, fontBoundingBoxDescent: textH1, fontBoundingBoxAscent: textH2} = ctx.measureText(tooltipText);
  const textHeight = textH1+textH2;
  const boxHeight = textHeight + (2 * scale.tooltip.pad);
  const boxWidth = textWidth + (2* scale.tooltip.pad);
  const maxY = scale.card.h - boxHeight;
  const maxX = scale.card.w - boxWidth;
  var drawX = cur.x;
  var drawY = cur.y
  if(drawX > maxX) drawX = maxX;
  if(drawY > maxY) drawY = maxY;
  
  //console.log("drawing tooltip at: x=", drawX," y=", drawY,"; size: w=", boxWidth," h=",boxHeight);
  ctx.fillStyle = "#EEEEEE";
  ctx.fillRect(drawX, drawY, boxWidth, boxHeight);
  ctx.lineWidth = 1;
  ctx.strokeRect(drawX, drawY, boxWidth, boxHeight);
  ctx.fillStyle = "#000000"
  ctx.font = scale.tooltip.fnt;
  ctx.textAlign = "left";
  ctx.fillText(tooltipText, drawX+scale.tooltip.pad, drawY+boxHeight-(1.7*scale.tooltip.pad));
  ctx.textAlign = "center";
}

(async()=>{
  logoImg = await imageWSrc("./VetsM+border.png");
  inputValues.pfp = await imageWSrc("./aaa.svg");
  rescale(); //includes update();
})();
/*
create a javascript function that determines the new cursor position when Ctrl is pressed along with an arrow or shift+arrow in a text box.
it will be given as raw arguments. argument 1 will indicate the current cursor position.
Argument two is an array containing (array of two integers representing the word boundary. if a word's first letter is at position 0 and last letter is at position 3 (4 letters long), argument two is [0,4]. if the word is 1 letter long and is located at position 0, then argument 2 is [0,1])s. keep in mind that the array (if flattened) has been pre sorted.
Argument three is either -1 (ArrowLeft) or 1 (ArrowRight) representing the arrow that has been pressed.
no further arguments are required.

*/