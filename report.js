/* 보고서 렌더러 */
window.FieldReport = (() => {
  const esc = x => String(x ?? '').replace(
    /[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

  const safePhoto = s =>
    typeof s === 'string' &&
    (
      /^assets\/scene-[1-4]\.jpg$/.test(s) ||
      /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(s)
    );

  const noticeTypes = {
    funeral:{title:'부고 알림',time:'별세일시',venue:'빈소',body:'고인·직원과의 관계·연령 등을 입력합니다.'},
    wedding:{title:'결혼 알림',time:'예식일시',venue:'예식장 / 홀',body:'결혼 당사자·직원과의 관계·초대 문구 등을 입력합니다.'},
    sixtieth:{title:'회갑 알림',time:'행사일시',venue:'행사장',body:'회갑을 맞으신 분·직원과의 관계·초대 문구 등을 입력합니다.'},
    first_birthday:{title:'돌잔치 알림',time:'행사일시',venue:'행사장',body:'아이 이름·부모·초대 문구 등을 입력합니다.'},
    other:{title:'경조사 알림',time:'행사일시',venue:'행사장',body:'행사명·대상자·안내 내용을 자유롭게 입력합니다.'}
  };
  function noticeKind(d){
    if(noticeTypes[d.noticeKind]) return d.noticeKind;
    const title=String(d.title||'');
    if(/결혼|혼례|예식/.test(title))return 'wedding';
    if(/회갑|환갑/.test(title))return 'sixtieth';
    if(/돌잔치|첫돌/.test(title))return 'first_birthday';
    return 'funeral';
  }
  function renderAdditional(d) {
    const notice=d.reportType==='notice', injury=d.trendKind==='injury';
    const nk=noticeKind(d), nt=noticeTypes[nk];
    const e=k=>esc(d[k]||'미기재');
    const pair=(label,key)=>`<dt>${label}</dt><dd>${e(key)}</dd>`;
    const map=d.address ? `<div class="additional-map"><iframe title="${notice?'행사장':'사고 발생장소'} 지도" src="https://maps.google.com/maps?q=${encodeURIComponent(d.address)}&output=embed" loading="lazy" allowfullscreen></iframe><a href="https://map.kakao.com/link/search/${encodeURIComponent(d.address)}" target="_blank" rel="noopener">지도에서 위치 확인</a></div>`:'';
    const photos=(d.photos||[]).filter(p=>p&&safePhoto(p.src));
    const gallery=photos.length?`<section class="additional-section"><h3>${notice?'관련 사진':'사고위치 및 관련사진'}</h3><div class="additional-photos">${photos.map(p=>`<figure><img src="${esc(p.src)}" alt="${esc(p.caption)}"><figcaption>${esc(p.caption)}</figcaption></figure>`).join('')}</div></section>`:'';
    const timeline=String(d.timeline||'').split('\n').filter(x=>x.trim()).map(line=>{const at=line.indexOf('|');return `<tr><td>${esc(at<0?'미기재':line.slice(0,at).trim())}</td><td>${esc(at<0?line:line.slice(at+1).trim())}</td></tr>`;}).join('');
    const content=notice?`
      <p class="additional-summary">${e('noticeText')}</p>
      <section class="additional-section"><h3>일정 및 장소</h3><dl>${pair(nt.time,'eventTime')}${pair(nt.venue,'venue')}${pair('주소','address')}<dt>위치 지도</dt><dd>${map||'미기재'}</dd>${nk==='funeral'?pair('발인','funeralTime')+pair('장지','burial'):''}${pair('연락처','contact')}${d.noticeDetails?pair('추가 안내','noticeDetails'):''}</dl></section>
      ${d.bank||d.account||d.holder?`<section class="additional-section"><h3>마음 전하실 곳</h3><dl>${pair('은행','bank')}${pair('계좌번호','account')}${pair('예금주','holder')}</dl></section>`:''}${gallery}`:`
      ${d.summary?`<p class="additional-summary">${e('summary')}</p>`:''}
      <section class="additional-section"><h3>01 · 사고 개요</h3><dl>${pair('발생일시','occurred')}${pair('발생장소','address')}<dt>위치 지도</dt><dd>${map||'미기재'}</dd>${injury?pair('대상자','subject'):pair('사고차량','vehicle')+pair('운전자','driver')}${pair('사고내용','accident')}</dl></section>
      <section class="additional-section"><h3>02 · ${injury?'부상현황 및 조치사항':'피해현황'}</h3><dl>${injury?pair('부상현황','injuryDetail')+pair('조치사항','measures'):pair('인명피해','humanDamage')+pair('차량피해','vehicleDamage')+pair('기타피해','otherDamage')}</dl></section>
      ${gallery}
      <section class="additional-section"><h3>03 · 시간대별 상황</h3><table><thead><tr><th scope="col">시간</th><th scope="col">내용</th></tr></thead><tbody>${timeline||'<tr><td colspan="2">미기재</td></tr>'}</tbody></table></section>
      <section class="additional-section"><h3>04 · 향후계획</h3><p class="multiline">${e('future')}</p></section>`;
    return `<header><div class="wrap additional-header"><b>${notice?'경조사알림':'동향보고'}</b><button onclick="window.print()">인쇄 / PDF</button></div></header><main class="wrap additional-report"><div class="additional-title"><span class="additional-kind">${notice?'경조사알림':injury?'직원 부상':'소방차량 사고발생'}</span><h2>${e('title')}</h2>${notice?'':`<p>보고 기준 ${e('updated')}</p>`}</div>${content}<footer class="additional-footer"><strong>${e('unit')}</strong><p>작성자 ${e('author')}${d.phone?' · '+e('phone'):''}</p></footer></main>`;
  }

  function render(d){return renderAdditional(d);}
  function mount(d){document.title=(d.title||'동향보고')+' | 계룡소방서';document.getElementById('report').innerHTML=render(d);}
  return {render,mount,safePhoto,noticeTypes,noticeKind};
})();
