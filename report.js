// ════════════════════════════════════════════════════
//  교사 탭: 리포트 생성 & PDF 다운로드
// ════════════════════════════════════════════════════
async function tReport(c){
  c.innerHTML='<div class="card"><div class="empty">데이터 불러오는 중...</div></div>';
  var results=await Promise.all([
    gasGet('학생목록'),gasGet('신앙온도'),gasGet('신앙일기'),
    gasGet('삼줄기도'),gasGet('공감QT'),gasGet('나의결단'),
    gasGet('QT'),gasGet('기도제목')
  ]);
  var students=results[0],temp=results[1],diary=results[2],prayer3=results[3],
      empathy=results[4],apply=results[5],qt=results[6],pray=results[7];
  window._rpt={students:students,temp:temp,diary:diary,prayer3:prayer3,empathy:empathy,apply:apply,qt:qt,pray:pray};
  var sh=students.map(function(s){return '<option value="'+s.학생id+'">'+s.이름+' ('+s.학년+')</option>';}).join('');
  c.innerHTML='<div class="card">'
    +'<div class="card-title">\uD83D\uDCCA 영성지도 리포트</div>'
    +'<div class="card-sub">학생 데이터를 리포트로 만들어 PDF로 다운받을 수 있습니다</div>'
    +'<div class="form-row"><label>리포트 유형</label>'
    +'<select id="rpt-type" onchange="document.getElementById(\'rpt-stu-row\').style.display=this.value===\'individual\'?\'block\':\'none\'">'
    +'<option value="all">전체 학생 리포트</option><option value="individual">개별 학생 리포트</option></select></div>'
    +'<div class="form-row" id="rpt-stu-row" style="display:none"><label>학생 선택</label><select id="rpt-stu">'+sh+'</select></div>'
    +'<div class="stat-grid" style="margin-top:1rem">'
    +'<div class="stat-box"><div class="stat-num">'+students.length+'</div><div class="stat-lbl">학생 수</div></div>'
    +'<div class="stat-box"><div class="stat-num">'+(temp.length+diary.length+prayer3.length)+'</div><div class="stat-lbl">총 기록</div></div>'
    +'<div class="stat-box"><div class="stat-num">'+(empathy.length+qt.length)+'</div><div class="stat-lbl">QT 기록</div></div></div>'
    +'<button class="btn btn-green btn-full" onclick="openReport()" style="margin-top:1rem">\uD83D\uDCC4 리포트 생성 & PDF 다운로드</button>'
    +'<div style="font-size:11px;color:#888;text-align:center;margin-top:.5rem">새 창에서 리포트가 열립니다. 인쇄(Ctrl+P)로 PDF 저장하세요.</div>'
    +'</div>'
    +'<div class="card"><div class="card-title">\uD83D\uDCCB 데이터 요약</div><div style="font-size:13px;line-height:2">'
    +'<div>\uD83C\uDF21\uFE0F 신앙온도: <strong>'+temp.length+'</strong>건</div>'
    +'<div>\uD83D\uDCD4 신앙일기: <strong>'+diary.length+'</strong>건</div>'
    +'<div>\uD83D\uDD4A\uFE0F 3줄기도: <strong>'+prayer3.length+'</strong>건</div>'
    +'<div>\u271D\uFE0F 공감QT: <strong>'+empathy.length+'</strong>건</div>'
    +'<div>\uD83C\uDFD5\uFE0F 나의 결단: <strong>'+apply.length+'</strong>건</div>'
    +'<div>\uD83D\uDCD6 QT: <strong>'+qt.length+'</strong>건</div>'
    +'<div>\uD83D\uDE4F 기도제목: <strong>'+pray.length+'</strong>건</div>'
    +'</div></div>';
}

function _rptEsc(s){if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function openReport(){
  var d=window._rpt;
  if(!d){toast('데이터를 먼저 불러와주세요');return;}
  var type=document.getElementById('rpt-type').value;
  var selId=type==='individual'?document.getElementById('rpt-stu').value:null;
  var stuList=selId?d.students.filter(function(s){return s.학생id===selId;}):d.students;
  if(!stuList.length){toast('학생 데이터가 없습니다');return;}
  var today=new Date().toLocaleDateString('ko-KR',{year:'numeric',month:'long',day:'numeric'});

  var h='<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>수련회 영성지도 리포트</title>';
  h+='<style>';
  h+="@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap');";
  h+='*{margin:0;padding:0;box-sizing:border-box}';
  h+="body{font-family:'Noto Sans KR',sans-serif;color:#1a1a2e;background:#fff;padding:2rem;max-width:800px;margin:0 auto;line-height:1.6}";
  h+='@media print{body{padding:1rem;font-size:11pt}.no-print{display:none!important}.page-break{page-break-before:always}.section{break-inside:avoid}}';
  h+='.header{text-align:center;margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:3px solid #6C3CE1}';
  h+='.header h1{font-size:24px;font-weight:900;color:#6C3CE1;margin-bottom:.25rem}';
  h+='.header .sub{font-size:13px;color:#666}.header .date{font-size:12px;color:#999;margin-top:.25rem}';
  h+='.section{margin-bottom:1.5rem}.section-title{font-size:16px;font-weight:700;color:#6C3CE1;margin-bottom:.75rem;padding-bottom:.35rem;border-bottom:2px solid #EDE9FE}';
  h+='.stu-hdr{background:linear-gradient(135deg,#EDE9FE,#fff);padding:1rem;border-radius:12px;margin-bottom:1rem;border-left:4px solid #6C3CE1}';
  h+='.stu-nm{font-size:18px;font-weight:700;color:#1E1B4B}.stu-gr{font-size:13px;color:#6B7280}';
  h+='.cd{background:#FAFAFA;border-radius:10px;padding:.85rem;margin-bottom:.6rem;border:1px solid #E5E7EB}';
  h+='.cd-lb{font-size:11px;font-weight:600;color:#6C3CE1;margin-bottom:.3rem;letter-spacing:.05em}';
  h+='.cd-ct{font-size:13px;color:#374151;margin-top:.15rem}';
  h+='.tbar{height:8px;background:#EEE;border-radius:4px;overflow:hidden;margin:.2rem 0}';
  h+='.tfill{height:100%;border-radius:4px;background:linear-gradient(90deg,#34D399,#10B981)}';
  h+='table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:.5rem}';
  h+='th{background:#EDE9FE;color:#6C3CE1;padding:.5rem;text-align:left;font-weight:600;font-size:11px}';
  h+='td{padding:.5rem;border-bottom:1px solid #E5E7EB;vertical-align:top}';
  h+='.sr{display:flex;gap:1rem;margin-bottom:1rem;flex-wrap:wrap}.si{flex:1;min-width:80px;text-align:center;background:#EDE9FE;border-radius:10px;padding:.75rem}';
  h+='.sn{font-size:22px;font-weight:900;color:#6C3CE1}.sl{font-size:10px;color:#6B7280;margin-top:.15rem}';
  h+='.em-msg{text-align:center;color:#9CA3AF;font-size:12px;padding:.75rem}';
  h+='.pb{position:fixed;top:0;left:0;right:0;background:#6C3CE1;color:#fff;padding:.75rem;text-align:center;z-index:999;display:flex;align-items:center;justify-content:center;gap:1rem;flex-wrap:wrap}';
  h+='.pb button{background:#fff;color:#6C3CE1;border:none;padding:.5rem 1.5rem;border-radius:25px;font-weight:700;cursor:pointer;font-size:14px}';
  h+='.ft{text-align:center;color:#9CA3AF;font-size:11px;margin-top:2rem;padding-top:1rem;border-top:1px solid #E5E7EB}';
  h+='</style></head><body>';

  h+='<div class="pb no-print"><span>\uD83D\uDCCA 리포트가 준비되었습니다</span>';
  h+='<button onclick="window.print()">\uD83D\uDDA8\uFE0F PDF 다운로드 / 인쇄</button>';
  h+='<button onclick="window.close()" style="background:transparent;color:#C4B5FD">닫기</button></div>';
  h+='<div style="height:50px" class="no-print"></div>';

  h+='<div class="header"><h1>\u271D\uFE0F 수련회 영성지도 리포트</h1>';
  h+='<div class="sub">'+(selId?_rptEsc(stuList[0].이름)+' 학생 개별 리포트':'전체 학생 리포트 ('+stuList.length+'명)')+'</div>';
  h+='<div class="date">생성일: '+today+'</div></div>';

  // Summary stats
  var ta=selId?d.temp.filter(function(r){return r.학생id===selId;}):d.temp;
  var da=selId?d.diary.filter(function(r){return r.학생id===selId;}):d.diary;
  var pa=selId?d.prayer3.filter(function(r){return r.학생id===selId;}):d.prayer3;
  var ea=selId?d.empathy.filter(function(r){return r.학생id===selId;}):d.empathy;
  h+='<div class="section"><div class="section-title">\uD83D\uDCC8 전체 요약</div>';
  h+='<div class="sr"><div class="si"><div class="sn">'+stuList.length+'</div><div class="sl">학생 수</div></div>';
  h+='<div class="si"><div class="sn">'+ta.length+'</div><div class="sl">온도 기록</div></div>';
  h+='<div class="si"><div class="sn">'+da.length+'</div><div class="sl">일기</div></div>';
  h+='<div class="si"><div class="sn">'+pa.length+'</div><div class="sl">3줄기도</div></div>';
  h+='<div class="si"><div class="sn">'+ea.length+'</div><div class="sl">공감QT</div></div></div></div>';

  // Per student
  stuList.forEach(function(stu,si){
    var sid=stu.학생id;
    var sT=d.temp.filter(function(r){return r.학생id===sid;});
    var sD=d.diary.filter(function(r){return r.학생id===sid;});
    var sP=d.prayer3.filter(function(r){return r.학생id===sid;});
    var sE=d.empathy.filter(function(r){return r.학생id===sid;});
    var sA=d.apply.filter(function(r){return r.학생id===sid;});
    var sQ=d.qt.filter(function(r){return r.학생id===sid;});
    var sR=d.pray.filter(function(r){return r.학생id===sid;});

    if(si>0)h+='<div class="page-break"></div>';
    h+='<div class="stu-hdr"><div class="stu-nm">'+_rptEsc(stu.이름)+'</div><div class="stu-gr">'+_rptEsc(stu.학년)+' \u00B7 '+_rptEsc(sid)+'</div></div>';

    // 신앙온도
    h+='<div class="section"><div class="section-title">\uD83C\uDF21\uFE0F 신앙 온도 ('+sT.length+'건)</div>';
    if(sT.length){
      var avg=Math.round(sT.reduce(function(s,r){return s+(+r.온도||0);},0)/sT.length*10)/10;
      h+='<div class="cd"><div class="cd-lb">평균 온도: '+avg+' / 5</div><div class="tbar"><div class="tfill" style="width:'+avg/5*100+'%"></div></div></div>';
      h+='<table><tr><th>날짜</th><th>온도</th><th>이모지</th><th>한마디</th></tr>';
      sT.slice().reverse().slice(0,10).forEach(function(r){
        h+='<tr><td>'+r.날짜+'</td><td>'+r.온도+'/5</td><td>'+r.이모지+'</td><td>'+(r.한마디||'-')+'</td></tr>';
      });h+='</table>';
    }else h+='<div class="em-msg">기록 없음</div>';
    h+='</div>';

    // 신앙일기
    h+='<div class="section"><div class="section-title">\uD83D\uDCD4 신앙 일기 ('+sD.length+'건)</div>';
    if(sD.length){
      sD.slice().reverse().slice(0,5).forEach(function(r){
        h+='<div class="cd"><div class="cd-lb">'+r.날짜+'</div>';
        if(r.느낀순간)h+='<div class="cd-ct">\uD83C\uDF3F <strong>느낀 순간:</strong> '+_rptEsc(r.느낀순간)+'</div>';
        if(r.고백)h+='<div class="cd-ct">\uD83D\uDE4F <strong>고백:</strong> '+_rptEsc(r.고백)+'</div>';
        if(r.바라는것)h+='<div class="cd-ct">\u2B50 <strong>내일의 소망:</strong> '+_rptEsc(r.바라는것)+'</div>';
        h+='</div>';
      });
    }else h+='<div class="em-msg">기록 없음</div>';
    h+='</div>';

    // 3줄기도
    h+='<div class="section"><div class="section-title">\uD83D\uDD4A\uFE0F 3줄 기도 ('+sP.length+'건)</div>';
    if(sP.length){
      sP.slice().reverse().slice(0,5).forEach(function(r){
        h+='<div class="cd"><div class="cd-lb">'+r.날짜+(r.시간?' \u00B7 '+r.시간:'')+(r.공유여부==='true'?' (공유)':' (비공개)')+'</div>';
        if(r.감사)h+='<div class="cd-ct">\uD83C\uDF3F <strong>감사:</strong> '+_rptEsc(r.감사)+'</div>';
        if(r.고백)h+='<div class="cd-ct">\uD83D\uDE4F <strong>고백:</strong> '+_rptEsc(r.고백)+'</div>';
        if(r.간구)h+='<div class="cd-ct">\u2B50 <strong>간구:</strong> '+_rptEsc(r.간구)+'</div>';
        h+='</div>';
      });
    }else h+='<div class="em-msg">기록 없음</div>';
    h+='</div>';

    // 공감QT
    h+='<div class="section"><div class="section-title">\u271D\uFE0F 공감 QT ('+sE.length+'건)</div>';
    if(sE.length){
      h+='<table><tr><th>날짜</th><th>말씀구절</th><th>선택</th><th>한마디</th></tr>';
      sE.slice().reverse().slice(0,10).forEach(function(r){
        h+='<tr><td>'+r.날짜+'</td><td>'+(r.말씀구절||'')+'</td><td>'+(r.선택||'')+'</td><td>'+(r.한마디||'-')+'</td></tr>';
      });h+='</table>';
    }else h+='<div class="em-msg">기록 없음</div>';
    h+='</div>';

    // 결단
    h+='<div class="section"><div class="section-title">\uD83C\uDFD5\uFE0F 나의 결단 ('+sA.length+'건)</div>';
    if(sA.length){
      sA.forEach(function(r){
        h+='<div class="cd"><div class="cd-ct">\u2714 '+_rptEsc(r.적용점내용)+'</div>';
        h+='<div class="cd-lb" style="margin-top:.3rem">실천율: '+(r.실천율||0)+'%</div>';
        h+='<div class="tbar"><div class="tfill" style="width:'+(r.실천율||0)+'%"></div></div></div>';
      });
    }else h+='<div class="em-msg">기록 없음</div>';
    h+='</div>';

    // QT
    h+='<div class="section"><div class="section-title">\uD83D\uDCD6 QT 기록 ('+sQ.length+'건)</div>';
    if(sQ.length){
      sQ.slice().reverse().slice(0,5).forEach(function(r){
        h+='<div class="cd"><div class="cd-lb">'+r.날짜+' \u00B7 '+(r.말씀||'')+'</div>';
        if(r.묵상)h+='<div class="cd-ct">\uD83D\uDCAD '+_rptEsc(r.묵상)+'</div>';
        if(r.적용)h+='<div class="cd-ct">\u2192 '+_rptEsc(r.적용)+'</div>';
        h+='</div>';
      });
    }else h+='<div class="em-msg">기록 없음</div>';
    h+='</div>';

    // 기도제목
    h+='<div class="section"><div class="section-title">\uD83D\uDE4F 기도제목 ('+sR.length+'건)</div>';
    if(sR.length){
      sR.forEach(function(r){
        h+='<div class="cd"><div class="cd-ct">\uD83D\uDD4A\uFE0F '+_rptEsc(r.기도제목)+' <span style="font-size:11px;color:'+(r.공유여부==='true'?'#10B981':'#9CA3AF')+'">'+(r.공유여부==='true'?'(공유)':'(비공개)')+'</span></div></div>';
      });
    }else h+='<div class="em-msg">기록 없음</div>';
    h+='</div>';
  });

  h+='<div class="ft">\u271D\uFE0F 수련회 영성지도 시스템 \u00B7 리포트 생성일: '+today+'</div>';
  h+='</body></html>';

  var w=window.open('','_blank');
  if(w){w.document.write(h);w.document.close();}
  else{toast('팝업이 차단되었습니다. 팝업을 허용해주세요.');}
}
