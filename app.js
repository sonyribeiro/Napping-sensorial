const $=id=>document.getElementById(id);

// Cada atributo tem a sua própria página de napping e questões específicas
const attrs=[
 {
   id:'visual', name:'Cor e aspeto', 
   instruction:'Considere apenas a cor e o aspeto visual. Amostras próximas devem ter cor/aspeto semelhantes.',
   questions: [
     { type: 'checkbox', name: 'aspeto_carateristicas', label: 'No geral, como descreve a intensidade da cor das bebidas? (selecione as que se aplicam)', options: ['Muito clara', 'Clara', 'Amarelada', 'Escura'] },
     { type: 'text', name: 'obs', label: 'Houve alguma amostra cujo aspeto visual o(a) tenha surpreendido (pela positiva ou negativa)? Qual e porquê?' }
   ]
 },
 {
   id:'aroma', name:'Aroma', 
   instruction:'Considere apenas o aroma. Amostras próximas devem apresentar aromas que lhe parecem semelhantes.',
   questions: [
     { type: 'radio', name: 'intensidade', label: 'No geral, como classifica a intensidade de aroma das amostras provadas?', options: ['Fraco', 'Moderado', 'Intenso'] },
     { type: 'checkbox', name: 'notas', label: 'Que notas de aroma destacou no conjunto das amostras? (Selecione todas as que se aplicam)', options: ['Frutado', 'Floral', 'Herbáceo/Vegetal', 'Fermentado/levedura','Doce','Caramelo','Vinagre', 'Especiarias'] },
     { type: 'text', name: 'obs', label: 'Houve alguma amostra cujo aroma se tenha destacado muito das restantes (pela positiva ou negativa)? Qual e o que sentiu?' }
   ]
 },
 {
   id:'alcohol', name:'Sensação alcoólica', 
   instruction:'Considere apenas a sensação de álcool que percebe no aroma. Amostras próximas devem provocar sensações semelhantes.',
   questions: [
     { type: 'radio', name: 'percecao', label: 'Como avalia a perceção global de álcool no aroma nas amostras?', options: ['Impercetível', 'Ligeira', 'Moderada', 'Pronunciada'] },
     { type: 'text', name: 'obs', label: 'Notou alguma diferença marcante na presença de álcool entre as diferentes amostras? Qual?' }
   ]
 },
 {
   id:'flavour', name:'Sabor', 
   instruction:'Prove as amostras e considere apenas o sabor. Amostras próximas devem apresentar sabores que lhe parecem semelhantes.',
   questions: [
     { type: 'radio', name: 'equilibrio_sabor', label: 'Como classifica o balanço geral entre os gostos básicos (doçura, acidez e amargor) no conjunto das amostras?', options: ['Desequilibrado', 'Equilibrado', 'Doce', 'Amargo', 'Neutro'] },
     { type: 'checkbox', name: 'perfil_sabor', label: 'Quais os perfis de sabor que mais se destacaram? (Selecione todas as opções aplicáveis)', options: ['Doce', 'Ácido', 'Fermentado', 'Caramelo', 'Aguado', 'Desagradável', 'Outro'] },
     { type: 'radio', name: 'retrogosto', label: 'Como descreve o sabor que permanece na boca após a prova (retrogosto)?', options: ['Pouco persistente', 'Agradável', 'Persistência longa', 'Amargo', 'Adstringente'] },
     { type: 'text', name: 'obs', label: 'Houve alguma amostra com um sabor particularmente marcante ou surpreendente? Qual e porquê?' }
   ]
 },
 {
   id:'mouthfeel', name:'Sensação em boca', 
   instruction:'Considere apenas corpo, textura e sensação na boca. Amostras próximas devem provocar sensações semelhantes.',
   questions: [
     { type: 'checkbox', name: 'textura', label: 'Que sensações táteis em boca destacou no conjunto das amostras? (Selecione todas as que se aplicam)', options: ['Aquoso', 'Textura aveludada', 'Adstringente', 'Picante'] },
     { type: 'text', name: 'obs', label: 'Houve alguma amostra com uma textura ou sensação em boca particularmente agradável ou desagradável? Qual e o que sentiu?' }
   ]
 }
];

const FIRST_ATTR=4;                 // 0 boas-vindas, 1 perfil, 2 contexto, 3 expectativas
const G=FIRST_ATTR+attrs.length;    // página do napping global
let step=0,codes=[],maps={};

// Cria uma página por atributo com o mapa e as respetivas questões, antes do napping global
function buildAttrSteps(){
 const before=$('globalMap').closest('section');
 attrs.forEach((a,i)=>{
  const s=document.createElement('section');
  s.className='step card';
  
  let qHtml = '<div class="attr-questions" style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">';
  a.questions.forEach((q, qIdx)=>{
    qHtml += `<div class="question"><label><b>${q.label}</b></label>`;
    if(q.type==='checkbox'||q.type==='radio'){
      qHtml += '<div style="display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; margin-top: 0.4rem;">';
      q.options.forEach(opt=>{
        qHtml += `<label class="choice" style="font-weight: normal;"><input type="${q.type}" name="attr_${a.id}_q${qIdx}" value="${opt}">${opt}</label>`;
      });
      qHtml += '</div>';
    } else if(q.type==='text'){
      qHtml += `<textarea name="attr_${a.id}_q${qIdx}" rows="2" placeholder="Escreva aqui..." style="margin-top: 0.4rem; width: 100%;"></textarea>`;
    }
    qHtml += '</div>';
  });
  qHtml += '</div>';

  s.innerHTML=`<div class="maptitle"><h2>Napping: ${a.name}</h2><span class="tag">Mapa ${i+1} de ${attrs.length}</span></div>
   <p class="sub">Organize as amostras de acordo com a sua semelhança, considerando apenas este atributo. Arraste os códigos.</p>
   <p><b>Instrução:</b> ${a.instruction}</p>
   <div class="map" id="map_${a.id}"></div>
   ${qHtml}
   <div class="actions" style="margin-top: 1.5rem;"><button class="btn secondary" type="button" onclick="prev()">Anterior</button><button class="btn primary" type="button" onclick="next()">Seguinte</button></div>`;
  before.parentNode.insertBefore(s,before);
 });
}
buildAttrSteps();

const steps=[...document.querySelectorAll('.step')];

function renderProgress(){
 $('progress').innerHTML=steps.map((_,i)=>`<span class="${i<=step?'active':''}"></span>`).join('');
}

function go(n){
 if(n===1&&!$('consent').checked){alert('Confirme a idade legal e o consentimento para continuar.');return}
 if(n<0||n>=steps.length)return;
 if(n===FIRST_ATTR&&step<FIRST_ATTR)initCodes();   // só reinicia ao entrar pela primeira vez
 const ai=n-FIRST_ATTR;
 if(ai>=0&&ai<attrs.length)drawMap('map_'+attrs[ai].id,attrs[ai].id);
 if(n===G)drawMap('globalMap','global');
 if(n===G+1){drawMap('preferenceMap','preference');buildFavorite()}
 step=n;
 steps.forEach((s,i)=>s.classList.toggle('active',i===n));
 renderProgress();
 window.scrollTo({top:0,behavior:'smooth'});
}
const next=()=>go(step+1), prev=()=>go(step-1);

let initialMaps = {}; // Guarda a posição inicial gerada para cada sessão/mapa

function initCodes(){
  const pool = ['128', '246', '357', '491', '583', '724'];
  const n = +$('n').value;
  
  codes = pool.slice(0, n);
  
  maps = {};
  initialMaps = {};
  
  // Lista de todos os mapas (atributos + global + preferência)
  const allKeys = [...attrs.map(a => a.id), 'global', 'preference'];
  
  // Pré-gera posições iniciais estocásticas e únicas para este participante em cada mapa
  allKeys.forEach(key => {
    initialMaps[key] = {};
    codes.forEach((c) => {
      const randomX = Math.floor(Math.random() * 75) + 12; // entre 12% e 87%
      const randomY = Math.floor(Math.random() * 70) + 15; // entre 15% e 85%
      initialMaps[key][c] = { x: randomX, y: randomY };
    });
  });
}

// Desenha um mapa; mantém as posições já guardadas
function drawMap(el, key){
  const area = $(el); area.innerHTML = '';
  if(!maps[key]) maps[key] = {};
  
  codes.forEach((c) => {
    const p = maps[key][c] || initialMaps[key]?.[c] || { x: 50, y: 50 };
    maps[key][c] = p;
    
    const d = document.createElement('div');
    d.className = 'dot'; d.textContent = c; 
    d.style.left = p.x + '%'; d.style.top = p.y + '%';
    area.appendChild(d);
    
    d.addEventListener('pointerdown', e => {
      e.preventDefault(); d.setPointerCapture(e.pointerId);
      const move = ev => {
        const r = area.getBoundingClientRect();
        const x = Math.max(5, Math.min(95, (ev.clientX - r.left) / r.width * 100));
        const y = Math.max(8, Math.min(92, (ev.clientY - r.top) / r.height * 100));
        d.style.left = x + '%'; d.style.top = y + '%';
        maps[key][c] = { x: +x.toFixed(2), y: +y.toFixed(2) };
      };
      const up = () => {
        d.removeEventListener('pointermove', move);
        d.removeEventListener('pointerup', up);
        d.removeEventListener('pointercancel', up);
      };
      d.addEventListener('pointermove', move);
      d.addEventListener('pointerup', up);
      d.addEventListener('pointercancel', up);
    });
  });
}

function buildFavorite(){
 const cur=$('favorite').value;
 $('favorite').innerHTML='<option value="">Selecione a sua favorita</option>'+codes.map(c=>`<option value="${c}">Amostra ${c}</option>`).join('');
 $('favorite').value=cur;
}

// Campo "Outra" -> mostra/esconde a caixa de texto
function bindOther(cbId,inputId){
 $(cbId).addEventListener('change',function(){
  $(inputId).hidden=!this.checked;
  if(!this.checked)$(inputId).value='';
 });
}
bindOther('otherContextOpt','otherContext');
bindOther('otherPackOpt','otherPack');

const checked=name=>[...document.querySelectorAll(`input[name="${name}"]:checked`)].map(i=>i.value).join(' | ');

function collect(){
 const o={
  participant:$('pid').value.trim()||'Sem código',
  timestamp:new Date().toISOString(),
  age:$('age').value,gender:$('gender').value,
  frequency:$('frequency').value,familiarity:$('familiarity').value,
  consumption_context:checked('consumption_context'),consumption_context_other:$('otherContext').value,
  packaging:checked('packaging'),packaging_other:$('otherPack').value,
  expectations:$('expect').value,
  global_comment:$('globalNote').value,
  favorite:$('favorite').value,
  preference_reason:$('preferenceWhy').value,
  comments:$('comments').value,
  sample_count:codes.length
 };

 // Regista a ordem dos códigos apresentados
 o['sample_order'] = codes.join(' | ');

 // 1. Recolha das respostas às questões específicas de cada atributo
 attrs.forEach(a=>{
  a.questions.forEach((q, qIdx)=>{
   const fieldName = `attr_${a.id}_q${qIdx}`;
   if(q.type==='checkbox'){
    o[`${a.id}_q_${q.name}`] = [...document.querySelectorAll(`input[name="${fieldName}"]:checked`)].map(i=>i.value).join(' | ');
   } else if(q.type==='radio'){
    const selected = document.querySelector(`input[name="${fieldName}"]:checked`);
    o[`${a.id}_q_${q.name}`] = selected ? selected.value : '';
   } else if(q.type==='text'){
    const txt = document.querySelector(`textarea[name="${fieldName}"]`);
    o[`${a.id}_q_${q.name}`] = txt ? txt.value.trim() : '';
   }
  });
 });

 // 2. Recolha das posições finais e iniciais de todos os mapas
 const allMapKeys = [...attrs.map(a => a.id), 'global', 'preference'];
 allMapKeys.forEach(k => {
   codes.forEach(c => {
     o[k+'_x_'+c] = maps[k]?.[c]?.x ?? '';
     o[k+'_y_'+c] = maps[k]?.[c]?.y ?? '';
     o[k+'_init_x_'+c] = initialMaps[k]?.[c]?.x ?? '';
     o[k+'_init_y_'+c] = initialMaps[k]?.[c]?.y ?? '';
   });
 });

 return o;
}

// Enter não deve submeter o formulário a meio
$('form').addEventListener('keydown',e=>{
 if(e.key==='Enter'&&e.target.tagName!=='TEXTAREA')e.preventDefault();
});

// Substitua pelo URL da sua Aplicação Web do Google Apps Script (ou deixe vazio se usar apenas armazenamento local)
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyg4HXAgYBU2m-eSBHtB5S3qGj2JACu8l1yB-zyfccNI-HKkHJL5BVCOJX4cKEtj8PRuA/exec";

$('form').addEventListener('submit', async e => {
 e.preventDefault();
 if(!$('favorite').value){alert('Selecione a sua amostra favorita.');return}

 const dadosParticipante = collect();

 try {
   const submitBtn = e.target.querySelector('button[type="submit"]');
   submitBtn.textContent = 'A guardar...';
   submitBtn.disabled = true;

   // Se tiver configurado o Google Apps Script, envia para a nuvem
   if (WEB_APP_URL && WEB_APP_URL.includes("http")) {
     await fetch(WEB_APP_URL, {
       method: 'POST',
       mode: 'no-cors',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(dadosParticipante)
     });
   }

   // Guarda sempre uma cópia de segurança local no navegador
   const rows = JSON.parse(localStorage.getItem('sensoryStudyV2')||'[]');
   rows.push(dadosParticipante);
   localStorage.setItem('sensoryStudyV2',JSON.stringify(rows));

   $('form').hidden = true;
   $('done').hidden = false;
   $('count').textContent = 'Participação guardada com sucesso!';
   window.scrollTo({top:0,behavior:'smooth'});

 } catch (error) {
   console.error('Erro ao enviar:', error);
   alert('Erro ao submeter. Os dados foram guardados localmente.');
   
   const rows = JSON.parse(localStorage.getItem('sensoryStudyV2')||'[]');
   rows.push(dadosParticipante);
   localStorage.setItem('sensoryStudyV2',JSON.stringify(rows));
   $('form').hidden = true;
   $('done').hidden = false;
   $('count').textContent = 'Guardado localmente.';
 }
});

function exportCSV(){
 const rows=JSON.parse(localStorage.getItem('sensoryStudyV2')||'[]');
 if(!rows.length){alert('Ainda não existem participações.');return}
 const keys=[...new Set(rows.flatMap(Object.keys))];
 const esc=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
 const csv='\ufeff'+[keys.map(esc).join(';'),...rows.map(r=>keys.map(k=>esc(r[k])).join(';'))].join('\r\n');
 const a=document.createElement('a');
 a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
 a.download='dados_napping_sensorial.csv';a.click();
 URL.revokeObjectURL(a.href);
}

function newParticipant(){
 $('form').reset();
 $('otherContext').hidden=true;$('otherPack').hidden=true;
 $('form').hidden=false;$('done').hidden=true;
 step=0;initCodes();go(0);
}

initCodes();
renderProgress();