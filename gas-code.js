var SS_ID='1eBPTioXt0RWvO-wnZJ94WWC3hWI9FUkS6zEchQS0nBI';
var SHEETS={'학생등록':'학생목록','학생목록':'학생목록','신앙온도':'신앙온도','신앙일기':'신앙일기','공감QT':'공감QT','삼줄기도':'삼줄기도','나의결단':'나의결단','QT':'QT','기도제목':'기도제목','메시지':'메시지'};
var HEADERS={
'학생목록':['학생id','이름','학년','등록일시'],
'신앙온도':['학생id','이름','날짜','온도','이모지','한마디','저장일시'],
'신앙일기':['학생id','이름','날짜','느낀순간','고백','바라는것','저장일시'],
'공감QT':['학생id','이름','날짜','말씀','말씀구절','선택','한마디','저장일시'],
'삼줄기도':['학생id','이름','날짜','시간','감사','고백','간구','공유여부','저장일시'],
'나의결단':['학생id','이름','적용점내용','실천율','저장일시'],
'QT':['학생id','이름','날짜','말씀','묵상','적용','저장일시'],
'기도제목':['학생id','이름','기도제목','공유여부','저장일시'],
'메시지':['발신자','수신자','내용','저장일시']
};

function getSS(){return SpreadsheetApp.openById(SS_ID);}

function getSheet(name){
var ss=getSS();
var sheet=ss.getSheetByName(name);
if(!sheet){
  sheet=ss.insertSheet(name);
  var h=HEADERS[name];
  if(h){sheet.getRange(1,1,1,h.length).setValues([h]);sheet.getRange(1,1,1,h.length).setFontWeight('bold');sheet.setFrozenRows(1);}
}
return sheet;
}

function sheetToJson(sn){
var sheet=getSheet(sn),vals=sheet.getDataRange().getValues();
if(vals.length<=1)return[];
var hdr=vals[0],arr=[];
for(var i=1;i<vals.length;i++){var o={};for(var j=0;j<hdr.length;j++)o[hdr[j]]=vals[i][j]!=null?String(vals[i][j]):'';arr.push(o);}
return arr;
}

function addRow(sn,data,hdr){
var sheet=getSheet(sn),row=[];
for(var i=0;i<hdr.length;i++){var h=hdr[i];row.push((h==='저장일시'||h==='등록일시')?new Date():(data[h]!=null?data[h]:''));}
sheet.appendRow(row);
}

function upsertRow(sn,data,hdr,keys){
var sheet=getSheet(sn),vals=sheet.getDataRange().getValues();
if(vals.length<=1){addRow(sn,data,hdr);return;}
var h0=vals[0],ki=[];
for(var m=0;m<keys.length;m++)ki.push(h0.indexOf(keys[m]));
for(var i=1;i<vals.length;i++){
  var ok=true;
  for(var j=0;j<keys.length;j++){if(String(vals[i][ki[j]])!==String(data[keys[j]])){ok=false;break;}}
  if(ok){
    var row=[];
    for(var k=0;k<hdr.length;k++){var h=hdr[k];if(h==='저장일시'||h==='등록일시')row.push(new Date());else if(data[h]!=null)row.push(data[h]);else row.push(vals[i][h0.indexOf(h)]||'');}
    sheet.getRange(i+1,1,1,row.length).setValues([row]);return;
  }
}
addRow(sn,data,hdr);
}

function saveData(data){
if(!data)return{ok:false,error:"no data received"};
var type=data.type;if(!type)return{ok:false,error:'no type'};
var sn=SHEETS[type];if(!sn)return{ok:false,error:'bad type:'+type};
var h=HEADERS[sn];
switch(type){
  case '학생등록':upsertRow(sn,data,h,['학생id']);break;
  case '신앙온도':upsertRow(sn,data,h,['학생id','날짜']);break;
  case '신앙일기':upsertRow(sn,data,h,['학생id','날짜']);break;
  case '공감QT':upsertRow(sn,data,h,['학생id','날짜','말씀구절']);break;
  case '삼줄기도':upsertRow(sn,data,h,['학생id','날짜']);break;
  case '나의결단':upsertRow(sn,data,h,['학생id','적용점내용']);break;
  case 'QT':upsertRow(sn,data,h,['학생id','날짜']);break;
  case '기도제목':upsertRow(sn,data,h,['학생id','기도제목']);break;
  case '메시지':addRow(sn,data,h);break;
  default:addRow(sn,data,h);
}
return{ok:true};
}

function doGet(e){
try{
  var p=e.parameter||{};
  if(p.action==='save'&&p.data){
    var parsed=null;
    try{parsed=JSON.parse(p.data);}catch(pe){return out({ok:false,error:'JSON parse error: '+pe.message});}
    if(!parsed)return out({ok:false,error:'parsed data is null'});
    return out(saveData(parsed));
  }
  if(!p.type)return out({ok:true,msg:'API OK'});
  var sn=SHEETS[p.type];if(!sn)return out({ok:false,error:'bad type'});
  var data=sheetToJson(sn);
  if(p.id&&sn!=='메시지')data=data.filter(function(r){return r['학생id']===p.id;});
  return out({ok:true,data:data});
}catch(err){return out({ok:false,error:err.message});}
}

function doPost(e){
try{
  var raw='';
  if(e&&e.postData&&e.postData.contents){raw=e.postData.contents;}
  else if(e&&e.parameter&&e.parameter.data){raw=e.parameter.data;}
  if(!raw)return out({ok:false,error:'no post data'});
  var parsed=null;
  try{parsed=JSON.parse(raw);}catch(pe){return out({ok:false,error:'JSON parse error: '+pe.message});}
  if(!parsed)return out({ok:false,error:'parsed data is null'});
  return out(saveData(parsed));
}catch(err){return out({ok:false,error:err.message});}
}

function out(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}

function testSave(){
var r=saveData({type:'학생등록',학생id:'test_중1',이름:'테스트학생',학년:'중1'});
Logger.log('결과: '+JSON.stringify(r));
Logger.log('스프레드시트 학생목록 시트를 확인하세요!');
}
