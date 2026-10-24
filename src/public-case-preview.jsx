import {ProgramReviewPanel} from './land-evaluation/generated/panels.mjs';
import {fuzhongProgram} from '../qa/public-cases/fuzhong-program.mjs';
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {MixedZonePanel} from './land-evaluation/generated/panels.mjs';
import {publicCase,sources,descriptions} from '../qa/public-cases/fixtures.mjs';
import './land-evaluation/generated/mixed-zone.css';
function Preview(){const [program,setProgram]=useState(()=>structuredClone(fuzhongProgram));const [id,setId]=useState('fuzhong');const [m,setM]=useState(()=>publicCase('fuzhong'));return <main style={{maxWidth:1100,margin:'24px auto',padding:24,fontFamily:'system-ui',color:'#203B45'}}><h1>三策｜公開案例計算檢核</h1><p>本機預覽・尚未上架。相似案件獨立測試，不替代寶安街資料。下方使用網站與 App 共用的正式計算元件；按各項計算按鈕才產生結果。</p><nav style={{display:'flex',gap:12,flexWrap:'wrap'}}>{[['fuzhong','載入府中段案'],['mingde','載入明德段案']].map(([key,label])=><button key={key} onClick={()=>{setId(key);setM(publicCase(key));}}>{label}</button>)}</nav><p>{descriptions[id]}</p><p><a href={sources[id]} target="_blank" rel="noreferrer">本次採用的原始計畫文件</a></p>{id==='fuzhong'&&<ProgramReviewPanel value={program} onChange={setProgram}/>}<details><summary>土地範圍與分區基準檢核</summary><MixedZonePanel key={id} value={m} onChange={setM}/></details></main>};createRoot(document.getElementById('root')).render(<Preview/>);
